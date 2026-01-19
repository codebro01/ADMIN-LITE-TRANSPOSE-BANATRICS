import { Injectable } from '@nestjs/common';
import {
  GraphQueryInterval,
  GraphQueryDto,
} from '@src/dashboard/dto/campaign-growth-query.dto';
import { HomeDashboardsRepository } from '@src/dashboard/repository/dashboard.repository';

@Injectable()
export class HomeDashboardService {
  constructor(
    private readonly homeDashboardsRepository: HomeDashboardsRepository,
  ) {}

  async overviewDashboard() {
    const result = await this.homeDashboardsRepository.overviewDashboard();
    return result;
  }
  async getMonthlyRevenueLast6Months() {
    const result =
      await this.homeDashboardsRepository.getMonthlyRevenueLast6Months();
    return result;
  }

  async getCampaignGrowth(query: GraphQueryDto) {
    if (query.interval === GraphQueryInterval.SEVENDAYS) {
      return await this.homeDashboardsRepository.get7DaysGrowth();
    }
    if (query.interval === GraphQueryInterval.SIXMONTHS) {
      return await this.homeDashboardsRepository.get6MonthsGrowth();
    }
    if (query.interval === GraphQueryInterval.FIVEYEARS) {
      return await this.homeDashboardsRepository.get5YearsGrowth();
    }
  }
  async getTotalPayouts(query: GraphQueryDto) {

    if(query.interval === GraphQueryInterval.SEVENDAYS)
    return  await this.homeDashboardsRepository.get7DaysPayouts();
    if(query.interval === GraphQueryInterval.SIXMONTHS)
    return  await this.homeDashboardsRepository.get6MonthsPayouts();
    if(query.interval === GraphQueryInterval.FIVEYEARS)
    return  await this.homeDashboardsRepository.get5YearsPayouts();
    
  }
}
