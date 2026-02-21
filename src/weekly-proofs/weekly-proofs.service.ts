import { Injectable } from '@nestjs/common';
import { WeeklyProofsRepository } from '@src/weekly-proofs/repository/weekly-proofs.repository';
import { weeklyProofInsertType } from '@src/db';
import { QueryWeeklyProofDto } from '@src/weekly-proofs/dto/query-weekly-proofs.dto';
import { WeeklyProofStatus } from '@src/weekly-proofs/dto/create-weekly-proof.dto';
import { OneSignalService } from '@src/one-signal/one-signal.service';

@Injectable()
export class WeeklyProofsService {
  constructor(
    private readonly weeklyProofsRepository: WeeklyProofsRepository,
    private readonly oneSignalService: OneSignalService,
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
    const weeklyProof =  await this.weeklyProofsRepository.approveOrRejectWeeklyProof(
      data,
      campaignId,
      userId,
    );

    if(weeklyProof.statusType === WeeklyProofStatus.APPROVED) await this.oneSignalService.sendNotificationToUser(
      userId,
      'Weekly Proof Approved',
      `Your weekly proof has been approved`,
    )
    if(weeklyProof.statusType === WeeklyProofStatus.REJECTED) await this.oneSignalService.sendNotificationToUser(
      userId,
      'Weekly Proof Rejected',
      `Your weekly proof has been rejected`,
    );

      return weeklyProof;
  }

  async listDriverWeeklyProofs(userId: string) {
    return await this.weeklyProofsRepository.listDriverWeeklyProofs(userId);
  }
  
  async campaignAllWeeklyProofs(campaignId: string) {
    return await this.weeklyProofsRepository.campaignAllWeeklyProofs(campaignId);
  }
}
