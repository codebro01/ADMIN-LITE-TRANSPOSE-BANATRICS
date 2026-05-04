import { Injectable, NotFoundException } from '@nestjs/common';
import { WeeklyProofsRepository } from '@src/weekly-proofs/repository/weekly-proofs.repository';
import { weeklyProofInsertType } from '@src/db';
import { QueryWeeklyProofDto } from '@src/weekly-proofs/dto/query-weekly-proofs.dto';
import { WeeklyProofStatus } from '@src/weekly-proofs/dto/create-weekly-proof.dto';
import { OneSignalService } from '@src/one-signal/one-signal.service';
import { NotificationService } from '@src/notification/notification.service';
import {
  CategoryType,
  StatusType,
  VariantType,
} from '@src/notification/dto/createNotificationDto';
import { CampaignRepository } from '@src/campaign/repository/campaign.repository';
import { EmailService } from '@src/email/email.service';
import { EmailTemplateType } from '@src/email/types/types';
import { UserRepository } from '@src/users/repository/user.repository';

@Injectable()
export class WeeklyProofsService {
  constructor(
    private readonly weeklyProofsRepository: WeeklyProofsRepository,
    private readonly oneSignalService: OneSignalService,
    private readonly notificationService: NotificationService,
    private readonly campaignRepository: CampaignRepository,
    private readonly emailService: EmailService,
    private readonly userRepository: UserRepository,
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
    data: Pick<weeklyProofInsertType, 'statusType' | 'comment'> & {
      weeklyProofId: string;
    },
    campaignId: string,
    userId: string,
  ) {
    const weeklyProof =
      await this.weeklyProofsRepository.approveOrRejectWeeklyProof(
        data,
        campaignId,
        userId,
      );

    if (!weeklyProof || !weeklyProof.statusType) {
      if (data.statusType === 'approved')
        throw new NotFoundException(
          'Cannot approve weekly proof, please check inputed data',
        );
      if (data.statusType === 'rejected')
        throw new NotFoundException(
          'Cannot reject weekly proof, please check inputed data',
        );
    }

    if (weeklyProof.statusType === WeeklyProofStatus.APPROVED) {
      const campaign =
        await this.campaignRepository.findCampaignByCampaignId(campaignId);
      if (!campaign) throw new NotFoundException('Could not find campaign');

      const user = await this.userRepository.findUserById(userId);
      if (!user) throw new NotFoundException('Could not find user!!!');

      const userDriver = await this.userRepository.findDriverByUserId(userId);

      await Promise.all([
        this.oneSignalService.sendNotificationToUser(
          userId,
          'Weekly Proof Approved',
          `Your weekly proof has been approved`,
        ),

        this.notificationService.createNotification(
          {
            title: 'Weekly Proof Approved',
            message: `Weekly proof has been approved for the campaign ${campaign.campaignTitle}`,
            category: CategoryType.CAMPAIGN,
            variant: VariantType.INFO,
            priority: 'important',
            status: StatusType.UNREAD,
          },
          userId,
          'driver',
        ),

        this.notificationService.createNotification(
          {
            title: `${userDriver.firstname} weekly proof is not approved for the campaign titled ${campaign.campaignTitle}`,
            message: `Weekly proof has been approved for the campaign ${campaign.campaignTitle}`,
            category: CategoryType.CAMPAIGN,
            variant: VariantType.INFO,
            priority: 'important',
            status: StatusType.UNREAD,
          },
          campaign.userId,
          'businessOwner',
        ),

        this.emailService.queueTemplatedEmail(
          EmailTemplateType.WEEKLY_PROOF_SUBMISSION,
          user.email,
          {
            driverName: userDriver.firstname,
            campaignName: campaign.campaignTitle,
            status: WeeklyProofStatus.APPROVED,
          },
        ),
      ]);
    }

    if (weeklyProof.statusType === WeeklyProofStatus.REJECTED) {
      const campaign =
        await this.campaignRepository.findCampaignByCampaignId(campaignId);
      if (!campaign) throw new NotFoundException('Could not find campaign');

      const user = await this.userRepository.findUserById(userId);
      if (!user) throw new NotFoundException('Could not find user!!!');

      const userDriver = await this.userRepository.findDriverByUserId(userId);

      await Promise.all([
        this.oneSignalService.sendNotificationToUser(
          userId,
          'Weekly Proof Rejected',
          `Your weekly proof has been rejected`,
        ),

        this.notificationService.createNotification(
          {
            title: 'Weekly Proof Rejected',
            message: `Weekly proof has been rejected for the campaign ${campaign.campaignTitle}`,
            category: CategoryType.CAMPAIGN,
            variant: VariantType.INFO,
            priority: 'important',
            status: StatusType.UNREAD,
          },
          userId,
          'driver',
        ),

        this.emailService.queueTemplatedEmail(
          EmailTemplateType.WEEKLY_PROOF_SUBMISSION,
          user.email,
          {
            driverName: userDriver.firstname,
            campaignName: campaign.campaignTitle,
            status: WeeklyProofStatus.REJECTED,
          },
        ),
      ]);
    }

    return weeklyProof;
  }

  async listDriverWeeklyProofs(userId: string) {
    return await this.weeklyProofsRepository.listDriverWeeklyProofs(userId);
  }

  async campaignAllWeeklyProofs(campaignId: string) {
    return await this.weeklyProofsRepository.campaignAllWeeklyProofs(
      campaignId,
    );
  }
}
