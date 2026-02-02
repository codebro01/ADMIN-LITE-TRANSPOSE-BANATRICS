import { Injectable } from '@nestjs/common';
import { WeeklyProofsRepository } from '@src/weekly-proofs/repository/weekly-proofs.repository';
import { weeklyProofInsertType } from '@src/db';
import { QueryWeeklyProofDto } from '@src/weekly-proofs/dto/query-weekly-proofs.dto';

@Injectable()
export class WeeklyProofsService {
  constructor(
    private readonly weeklyProofsRepository: WeeklyProofsRepository,
  ) {}

  async weeklyProofDashboardCards() {
    return await this.weeklyProofsRepository.weeklyProofDashboardCards();
  }

  async queryAllWeeklyProofs(query: QueryWeeklyProofDto) {
    return await this.weeklyProofsRepository.queryAllWeeklyProofs(query);
  }
  async weeklyProofDetails(weeklyProofId: string, userId: string) {
    return await this.weeklyProofsRepository.weeklyProofDetails(
      weeklyProofId,
      userId,
    );
  }

  async approveOrRejectWeeklyProof(
    data: Pick<weeklyProofInsertType, 'statusType' | 'comment'> & {weeklyProofId: string},
    campaignId: string,
    userId: string,
  ) {
    return await this.weeklyProofsRepository.approveOrRejectWeeklyProof(
      data,
      campaignId,
      userId,
    );
  }

  async listDriverWeeklyProofs(userId: string) {
    return await this.weeklyProofsRepository.listDriverWeeklyProofs(userId);
  }
  
  async campaignAllWeeklyProofs(campaignId: string) {
    return await this.weeklyProofsRepository.campaignAllWeeklyProofs(campaignId);
  }
}
