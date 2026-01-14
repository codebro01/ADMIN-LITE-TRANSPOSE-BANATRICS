import { Injectable } from '@nestjs/common';
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
      const result = await this.homeDashboardsRepository.getMonthlyRevenueLast6Months();
      return result;
  }
  async get7DaysGrowth() {
      const result = await this.homeDashboardsRepository.get7DaysGrowth();
      return result;
  }
  async get6MonthsGrowth() {
      const result = await this.homeDashboardsRepository.get6MonthsGrowth();
      return result;
  }
  async get5YearsGrowth() {
      const result = await this.homeDashboardsRepository.get5YearsGrowth();
      return result;
  }
  async get6MonthsEarnings() {
      const result = await this.homeDashboardsRepository.get6MonthsEarnings();
      return result;
  }
  
}
