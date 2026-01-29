import { Injectable } from '@nestjs/common';
import { UpdateInstallmentProofDto } from './dto/update-installment-proof.dto';
import { InstallmentProofRepository } from '@src/installment-proofs/repository/installment-proofs.repository';

@Injectable()
export class InstallmentProofsService {
  constructor( private readonly installmentProofRepository: InstallmentProofRepository) {}
 

   async getCampaignInstallmentProof(campaignId: string, userId: string) {
     const installmentProof = await this.installmentProofRepository.getCampaignInstallmentProof(campaignId, userId)
 
     return installmentProof;
   }
   async updateCampaignInstallmentProof(data: UpdateInstallmentProofDto, campaignId: string, userId: string) {
     const installmentProof = await this.installmentProofRepository.updateCampaignInstallmentProof(data, campaignId, userId)
     return installmentProof;
   }
}
