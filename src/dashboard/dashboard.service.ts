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
}
