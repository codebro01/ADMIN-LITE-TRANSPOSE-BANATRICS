import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  HttpStatus,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  generateSecureRef,
  PaymentRepository,
} from '@src/payment/repository/payment.repository';
import { UserRepository } from '@src/users/repository/user.repository';
import { CampaignRepository } from '@src/campaign/repository/campaign.repository';

import { NotificationService } from '@src/notification/notification.service';
import { EarningRepository } from '@src/earning/repository/earning.repository';
import {
  GraphQueryDto,
  GraphQueryOption,
} from '@src/payment/dto/graph-query.dto';
import { InitializePayoutDto } from '@src/payment/dto/initialize-payout.dto';
import { BankDetailsRepository } from '@src/bank-details/repository/create-bank-details-repository';
import { ApprovalStatusType } from '@src/earning/dto/create-earning.dto';
import { WeeklyProofsRepository } from '@src/weekly-proofs/repository/weekly-proofs.repository';
import { PaymentStatusType } from '@src/db';
import { VariantType } from '@src/notification/dto/createNotificationDto';
import { StatusType } from '@src/notification/dto/createNotificationDto';
import { CategoryType } from '@src/notification/dto/createNotificationDto';
import { EmailService } from '@src/email/email.service';
import { EmailTemplateType } from '@src/email/types/types';
@Injectable()
export class PaymentService {
  private readonly baseUrl: string = 'https://api.flutterwave.com';
  private readonly secretKey: string;
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private userRepository: UserRepository,
    private paymentRepository: PaymentRepository,
    private campaignRepository: CampaignRepository,
    private notificationService: NotificationService,
    private earningRepository: EarningRepository,
    private bankDetailsRepository: BankDetailsRepository,
    private weeklyProofsRepository: WeeklyProofsRepository,
    private emailService: EmailService,
  ) {
    const key = this.configService.get<string>('FLUTTERWAVE_SECRET_KEY');
    if (!key) {
      throw new BadRequestException('Please provide flutterwave secret Key');
    }
    this.secretKey = key;
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
  }
  private getTransferHeaders() {
    return {
      'x-proxy-secret': this.configService.get('PROXY_SECRET'),
    };
  }

  async initializePayout(
    data: InitializePayoutDto,
    earningId: string,
    campaignId: string,
    userId: string,
  ) {
    // ! count number of approved weekly proofs

    const campaign =
      await this.campaignRepository.findCampaignByCampaignId(campaignId);

    if (!campaign)
      throw new NotFoundException('Error loading campaign information');

    const weeklyProofs =
      await this.weeklyProofsRepository.getAllApprovedWeeklyProofsForCampaign(
        campaignId,
        userId,
      );
    if (weeklyProofs.total < 1)
      throw new NotFoundException(
        'No weekly proof found for user for this campaign',
      );

    if (!campaign.earningPerDriver || !campaign.duration)
      throw new BadRequestException(
        'Property price or duration is missing from campaign',
      );

    const { withdrawableAmount, missedWeeks } =
      this.calculateWithdrawableAmount(
        campaign.duration,
        campaign.earningPerDriver,
        weeklyProofs.total,
      );

    if (withdrawableAmount === 0) {
      throw new BadRequestException(
        `Driver missed ${Math.round(missedWeeks)} weeks and is not eligible for payout`,
      );
    }
    const totalPossibleWeeklyProofs = campaign.duration / 7;

    if (weeklyProofs.total > totalPossibleWeeklyProofs + 1)
      throw new BadRequestException(
        'User have more than the required weekly proofs',
      );

    const driverBankInfo =
      await this.bankDetailsRepository.findBankDetailsByUserId(userId);

      if(!driverBankInfo) throw new NotFoundException('Could not get driver bank info')

    if (!driverBankInfo.bank_details.recipientCode)
      throw new NotFoundException('Error loading driver account information.');

    if (!data.approve) {
      const rejectApproval = await this.earningRepository.rejectPayouts(
        {
          rejectionReason: data.reason,
          recipientCode: driverBankInfo.bank_details.recipientCode,
        },
        userId,
      );

      return rejectApproval;
    }
    const earning = await this.earningRepository.findUnapprovedEarningById(
      earningId,
      userId,
    );

    if (!earning)
      throw new NotFoundException(
        'Error loading earning information, please try again',
      );

    await this.earningRepository.updateEarningApprovedStatus(
      ApprovalStatusType.APPROVED,
      userId,
    );

    const response = await firstValueFrom(
      this.httpService.post(
        `http://159.65.101.153:3001/transfer`,
        {
          account_bank: driverBankInfo.bank_details.bankCode,
          account_number: driverBankInfo.bank_details.accountNumber,
          currency: 'NGN',
          beneficiary_name: driverBankInfo.bank_details.accountName,
          debit_currency: 'NGN',
          callback_url:
            'https://bathrooms-unix-attendance-mills.trycloudflare.com/api/v1/payments/webhook',
          narration: data.reason,
          beneficiary: driverBankInfo.bank_details.recipientCode,
          amount: withdrawableAmount,
          reference: generateSecureRef(),
          meta: {
            userId: driverBankInfo.drivers?.userId,
            email: driverBankInfo.users?.email,
          },
        },
        { headers: this.getHeaders() },
      ),
    );

    return response.data;
  }

  // ! calculate withdrawable amount

  calculateWithdrawableAmount(
    duration: number,
    price: number,
    totalWeeklyProofs: number,
  ) {
    const durationInWeeks = duration / 7;
    const missedWeeks = durationInWeeks - totalWeeklyProofs;

    // 4 or more misses = no payout
    if (missedWeeks >= 4) {
      return { withdrawableAmount: 0, durationInWeeks, missedWeeks };
    }

    // Each missed week deducts 25% of the total price
    const penaltyPercentage = missedWeeks * 0.25;
    const withdrawableAmount = price * (1 - penaltyPercentage);

    return { withdrawableAmount, durationInWeeks, missedWeeks };
  }

  //! paystack query
  async getTransaction(id: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/transaction/${id}`, {
          headers: this.getHeaders(),
        }),
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Failed to get transaction',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async listAllTransactions(params?: { perPage?: number; page?: number }) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/transaction`, {
          headers: this.getHeaders(),
          params: {
            perPage: params?.perPage || 50,
            page: params?.page || 1,
          },
        }),
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Failed to list transactions',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //! Db calls

  async listAllWithdrawals() {
    return await this.paymentRepository.listAllWithdrawals();
  }
  async listAllPayments() {
    return await this.paymentRepository.listAllPayments();
  }

  async totalIncomGraph(query: GraphQueryDto) {
    if (query.option === GraphQueryOption.WEEKLY) {
      return await this.paymentRepository.totalWeeklyIncomeGraph();
    }

    if (query.option === GraphQueryOption.MONTHLY) {
      return await this.paymentRepository.totalMonthlyIncomeGraph();
    }
    if (query.option === GraphQueryOption.YEARLY) {
      return await this.paymentRepository.totalYearlyIncomeGraph();
    }
  }
  async totalDriverPayouts(query: GraphQueryDto) {
    if (query.option === GraphQueryOption.WEEKLY) {
      return await this.paymentRepository.totalDriverPayoutsWeekly();
    }

    if (query.option === GraphQueryOption.MONTHLY) {
      return await this.paymentRepository.totalDriverPayoutsMonthly();
    }
    if (query.option === GraphQueryOption.YEARLY) {
      return await this.paymentRepository.totalDriverPayoutsYearly();
    }
  }
  async netProfit(query: GraphQueryDto) {
    if (query.option === GraphQueryOption.WEEKLY) {
      return await this.paymentRepository.netProfitWeekly();
    }

    if (query.option === GraphQueryOption.MONTHLY) {
      return await this.paymentRepository.netProfitMonthly();
    }
    if (query.option === GraphQueryOption.YEARLY) {
      return await this.paymentRepository.netProfitYearly();
    }
  }

  //! verify webhook signatures

  verifyWebhookSignature(signature: string): boolean {
    const secret = this.configService.get('FLUTTERWAVE_WEBHOOK_SECRET');
    return signature === secret;
  }

  async postVerifyWebhookSignatures(event: any) {
    try {
      const { reference, amount } = event.data;
      const { userId, email } = event.data.meta || {};
      console.log('got in event', event);
      // const recipient_code = event.data?.recipient?.recipient_code || null;
      // const {account_number, account_name, bank_name, bank_code} = event.data.recipient.details
      switch (event.data.status) {
        case 'SUCCESSFUL': {
          const earning = await this.earningRepository.findEarningsByReference(
            reference,
            userId,
          );

          if (!earning.reference)
            throw new BadRequestException('Withdrawal request not found!');
          if (earning && earning.paymentStatus === PaymentStatusType.SUCCESS) {
            return 'already processed';
          }

          console.log('got in here');
          await this.paymentRepository.executeInTransaction(async (trx) => {
            if (
              earning &&
              earning.paymentStatus === PaymentStatusType.PENDING
            ) {
              await this.earningRepository.updateEarningPaymentStatus(
                PaymentStatusType.SUCCESS,
                reference,
                userId,

                trx,
              );
            }
          });

          await Promise.all([
            this.notificationService.createNotification(
              {
                title: `Withdrawal Successful`,
                message: `Your withdrawal of ${amount} is successful`,
                variant: VariantType.SUCCESS,
                category: CategoryType.PAYMENT,
                priority: '',
                status: StatusType.UNREAD,
              },
              userId,
              'driver',
            ),
            this.emailService.queueTemplatedEmail(
              EmailTemplateType.DRIVER_WITHDRAWAL,
              email,
              {
                amount: amount,
                status: PaymentStatusType.SUCCESS,
              },
            ),
          ]);

          break;
        }
        case 'FAILED': {
          const earning = await this.earningRepository.findEarningsByReference(
            reference,
            userId,
          );

          if (!earning.reference)
            throw new BadRequestException('Withdrawal request not found!');
          if (earning && earning.paymentStatus === PaymentStatusType.SUCCESS) {
            return 'already processed';
          }

          console.log('got in here');
          await this.paymentRepository.executeInTransaction(async (trx) => {
            if (
              earning &&
              earning.paymentStatus === PaymentStatusType.PENDING
            ) {
              await this.earningRepository.updateEarningPaymentStatus(
                PaymentStatusType.FAILED,
                reference,
                userId,
                trx,
              );
            }
          });

          await Promise.all([
            this.notificationService.createNotification(
              {
                title: `Withdrawal Failed`,
                message: `Your withdrawal of ${amount} failed`,
                variant: VariantType.DANGER,
                category: CategoryType.PAYMENT,
                priority: '',
                status: StatusType.UNREAD,
              },
              userId,
              'driver',
            ),
            this.emailService.queueTemplatedEmail(
              EmailTemplateType.DRIVER_WITHDRAWAL,
              email,
              {
                amount: amount,
                status: PaymentStatusType.FAILED,
              },
            ),
          ]);

          break;
        }

        default:
      }

      return { status: 'success' };
    } catch (error) {
      console.error('Webhook processing error:', error);
      return { error: error.message };
    }
  }
}
