import { Injectable } from '@nestjs/common';
import { ReportsRepository } from '@src/reports/repository/reports.repository';

@Injectable()
export class ReportsService {
  constructor(
    private readonly reportsRepository: ReportsRepository, 
  ){}
  async reportsDashboardCards() {
    return await this.reportsRepository.reportsDashboardCards()
  }
  async monthlyRevenueTrend() {
    return await this.reportsRepository.monthlyRevenueTrend()
  }
  async getDriverActivityTrend() {
    return await this.reportsRepository.getDriverActivityTrend()
  }
}
