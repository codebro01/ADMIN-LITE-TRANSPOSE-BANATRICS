import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PaymentRepository } from '@src/payment/repository/payment.repository';
import { UserRepository } from '@src/users/repository/user.repository';
import { CampaignRepository } from '@src/campaign/repository/campaign.repository';

import { NotificationService } from '@src/notification/notification.service';
import { EarningRepository } from '@src/earning/repository/earning.repository';
import {
  GraphQueryDto,
  GraphQueryOption,
} from '@src/payment/dto/graph-query.dto';

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
