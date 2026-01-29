import { Module } from '@nestjs/common';
import { InstallmentProofsService } from './installment-proofs.service';
import { InstallmentProofsController } from './installment-proofs.controller';
import { InstallmentProofRepository } from '@src/installment-proofs/repository/installment-proofs.repository';

@Module({
  controllers: [InstallmentProofsController],
  providers: [InstallmentProofsService, InstallmentProofRepository],
  exports: [InstallmentProofsService, InstallmentProofRepository],
})
export class InstallmentProofsModule {}
