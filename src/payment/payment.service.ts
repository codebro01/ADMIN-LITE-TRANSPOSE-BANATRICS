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
    const driverBankInfo =
      await this.bankDetailsRepository.findBankDetailsByUserId(userId);

    if (!driverBankInfo.bank_details.recipientCode)
      throw new NotFoundException('Error loading driver account information.');

    if (!data.approve) {
      await this.earningRepository.rejectPayouts(
        {
          rejectionReason: data.reason,
          recipientCode: driverBankInfo.bank_details.recipientCode,
        },
        userId,
      );
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

    const campaign = await this.campaignRepository.findCampaignById(campaignId);

    if (!campaign)
      throw new NotFoundException('Error loading campaign information');

    const response = await firstValueFrom(
      this.httpService.post(
        `${this.baseUrl}/transfer`,
        {
          source: 'balance',
          recipient: driverBankInfo.bank_details.recipientCode,
          amount: campaign.price,
          reason: data.reason,
          reference: generateSecureRef(),
        },
        { headers: this.getHeaders() },
      ),
    );

    return response.data;
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
