import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  InstallmentProofStatusType,
  UpdateInstallmentProofDto,
} from './dto/update-installment-proof.dto';
import { InstallmentProofRepository } from '@src/installment-proofs/repository/installment-proofs.repository';
import { CampaignRepository } from '@src/campaign/repository/campaign.repository';
import { OneSignalService } from '@src/one-signal/one-signal.service';
import { EmailService } from '@src/email/email.service';
import { NotificationService } from '@src/notification/notification.service';
import { CategoryType, StatusType, VariantType } from '@src/notification/dto/createNotificationDto';
import { UserRepository } from '@src/users/repository/user.repository';
import { EmailTemplateType } from '@src/email/types/types';
import { WeeklyProofStatus } from '@src/weekly-proofs/dto/create-weekly-proof.dto';
@Injectable()
export class InstallmentProofsService {
  constructor(
    private readonly installmentProofRepository: InstallmentProofRepository,
    private readonly campaignRepository: CampaignRepository,
    private readonly oneSignalService: OneSignalService,
    private readonly notificationService: NotificationService,
    private readonly emailService: EmailService,
    private readonly userRepository: UserRepository,

  ) {}

  async getCampaignInstallmentProof(campaignId?: string, userId?: string) {
    const installmentProof =
      await this.installmentProofRepository.getCampaignInstallmentProof(
        campaignId,
        userId,
      );

    return installmentProof;
  }
  async updateCampaignInstallmentProof(
    data: UpdateInstallmentProofDto,
    campaignId: string,
    userId: string,
  ) {
    if (data.statusType === InstallmentProofStatusType.APPROVED) {
      if (data.rejectionReason)
        throw new BadRequestException(
          'You cannot provide rejection reason when approving an installment proof',
        );
      const startDriverCampaign =
        await this.campaignRepository.startDriverCampaign(campaignId, userId);

      // console.log(startDriverCampaign, campaignId, userId)

      if (!startDriverCampaign)
        throw new BadRequestException(
          'This driver is not part of the campaign!',
        );
      const installmentProof =
        await this.installmentProofRepository.updateCampaignInstallmentProof(
          data,
          campaignId,
          userId,
        );
             const campaign =
                await this.campaignRepository.findCampaignByCampaignId(campaignId);
              if (!campaign) throw new NotFoundException('Could not find campaign');
        
              const user = await this.userRepository.findUserById(userId);
              if (!user) throw new NotFoundException('Could not find user!!!');
        
              const userDriver = await this.userRepository.findDriverByUserId(userId);

      await Promise.all([
        this.oneSignalService.sendNotificationToUser(
          userId,
          'Installment Proof Approved.',
          `Your installment proof has been approved`,
        ),

        this.notificationService.createNotification(
          {
            title: 'Installment Proof Approved',
            message: `Installment proof has been approved for the campaign ${campaign.campaignTitle}`,
            category: CategoryType.CAMPAIGN,
            variant: VariantType.INFO,
            priority: 'important',
            status: StatusType.UNREAD,
          },
          userId,
          'driver',
        ),

        this.emailService.queueTemplatedEmail(
          EmailTemplateType.INSTALLMENT_PROOF_SUBMISSION,
          user.email,
          {
            driverName: userDriver.firstname,
            campaignName: campaign.campaignTitle,
            status: WeeklyProofStatus.APPROVED,
            submittedAt: installmentProof.submittedAt, 
          },
        ),
      ]);

      return installmentProof;
    } else {
      if (!data.rejectionReason)
        throw new BadRequestException(
          'You must provide rejection reason when rejecting an installment proof',
        );
      const installmentProof =
        await this.installmentProofRepository.updateCampaignInstallmentProof(
          data,
          campaignId,
          userId,
        );

         const campaign =
           await this.campaignRepository.findCampaignByCampaignId(campaignId);
         if (!campaign) throw new NotFoundException('Could not find campaign');

         const user = await this.userRepository.findUserById(userId);
         if (!user) throw new NotFoundException('Could not find user!!!');

         const userDriver =
           await this.userRepository.findDriverByUserId(userId);

      await Promise.all([
        this.oneSignalService.sendNotificationToUser(
          userId,
          'Installment Proof rejected.',
          `Your installment proof has been rejected, please capture and try again`,
        ),

        this.notificationService.createNotification(
          {
            title: 'Installment Proof Rejected',
            message: `Installment proof has been rejected for the campaign ${campaign.campaignTitle}`,
            category: CategoryType.CAMPAIGN,
            variant: VariantType.INFO,
            priority: 'important',
            status: StatusType.UNREAD,
          },
          userId,
          'driver',
        ),

        this.emailService.queueTemplatedEmail(
          EmailTemplateType.INSTALLMENT_PROOF_SUBMISSION,
          user.email,
          {
            driverName: userDriver.firstname,
            campaignName: campaign.campaignTitle,
            status: WeeklyProofStatus.APPROVED,
            submittedAt: installmentProof.submittedAt,
          },
        ),
      ]);

      return installmentProof;
    }
  }
}
