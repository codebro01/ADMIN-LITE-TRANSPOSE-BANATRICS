import { BadRequestException, Injectable } from '@nestjs/common';
import { InstallmentProofStatusType, UpdateInstallmentProofDto } from './dto/update-installment-proof.dto';
import { InstallmentProofRepository } from '@src/installment-proofs/repository/installment-proofs.repository';
import { CampaignRepository } from '@src/campaign/repository/campaign.repository';

@Injectable()
export class InstallmentProofsService {
  constructor(
    private readonly installmentProofRepository: InstallmentProofRepository,
    private readonly campaignRepository: CampaignRepository,
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
  
        if(!startDriverCampaign) throw new BadRequestException('Could not set startDate for driver campaign')
      const installmentProof =
        await this.installmentProofRepository.updateCampaignInstallmentProof(
          data,
          campaignId,
          userId,
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
    return installmentProof;
    }
  }
}
