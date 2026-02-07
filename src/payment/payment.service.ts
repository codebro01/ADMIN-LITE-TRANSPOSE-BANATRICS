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

@Injectable()
export class PaymentService {
  private readonly baseUrl: string = 'https://api.paystack.co';
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
  ) {
    const key = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    if (!key) {
      throw new BadRequestException('Please provide paystack secretKey');
    }
    this.secretKey = key;
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
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

    const { withdrawableAmount } = this.calculateWithdrawableAmount(
      campaign.duration,
      campaign.earningPerDriver,
      weeklyProofs.total,
    );

    console.log('withdrawableAmount', withdrawableAmount);

    const totalPossibleWeeklyProofs = campaign.duration / 7;

    if (weeklyProofs.total > totalPossibleWeeklyProofs + 1)
      throw new BadRequestException(
        'User have more than the required weekly proofs',
      );

    const driverBankInfo =
      await this.bankDetailsRepository.findBankDetailsByUserId(userId);

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
        `${this.baseUrl}/transfer`,
        {
          source: 'balance',
          recipient: driverBankInfo.bank_details.recipientCode,
          amount: withdrawableAmount,
          reason: data.reason,
          reference: generateSecureRef(),
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
    const pricePerWeek = price / durationInWeeks;

    const withdrawableAmount = pricePerWeek * totalWeeklyProofs;

    return { withdrawableAmount, durationInWeeks };
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
}
