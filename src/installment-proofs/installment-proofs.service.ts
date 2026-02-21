import { BadRequestException, Injectable } from '@nestjs/common';
import { InstallmentProofStatusType, UpdateInstallmentProofDto } from './dto/update-installment-proof.dto';
import { InstallmentProofRepository } from '@src/installment-proofs/repository/installment-proofs.repository';
import { CampaignRepository } from '@src/campaign/repository/campaign.repository';
import { OneSignalService } from '@src/one-signal/one-signal.service';

@Injectable()
export class InstallmentProofsService {
  constructor(
    private readonly installmentProofRepository: InstallmentProofRepository,
    private readonly campaignRepository: CampaignRepository,
    private readonly oneSignalService: OneSignalService,
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

    if(data.statusType === InstallmentProofStatusType.APPROVED) {
        if(data.rejectionReason) throw new BadRequestException('You cannot provide rejection reason when approving an installment proof')
      const startDriverCampaign =
        await this.campaignRepository.startDriverCampaign(campaignId, userId);

        // console.log(startDriverCampaign, campaignId, userId)
  
        if(!startDriverCampaign) throw new BadRequestException('This driver is not part of the campaign!')
      const installmentProof =
        await this.installmentProofRepository.updateCampaignInstallmentProof(
          data,
          campaignId,
          userId,
        );
        
        await this.oneSignalService.sendNotificationToUser(
          userId,
          'Installment Proof Approved.',
          `Your installment proof has been approved`,
        );

        
        return installmentProof;
    } else {
          if (!data.rejectionReason)
            throw new BadRequestException(
              'You must provide rejection reason when using the rejecting an installment proof',
            );
    const installmentProof =
      await this.installmentProofRepository.updateCampaignInstallmentProof(
        data,
        campaignId,
        userId,
      );

       await this.oneSignalService.sendNotificationToUser(
         userId,
         'Installment Proof rejected.',
         `Your installment proof has been rejected, please capture and try again`,
       );
    return installmentProof;
    }
  }
}
