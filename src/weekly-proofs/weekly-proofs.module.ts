import { Module } from '@nestjs/common';
import { WeeklyProofsService } from './weekly-proofs.service';
import { WeeklyProofsController } from './weekly-proofs.controller';
import { DbModule } from '@src/db/db.module';
import { WeeklyProofsRepository } from '@src/weekly-proofs/repository/weekly-proofs.repository';
import { OneSignalModule } from '@src/one-signal/one-signal.module';
@Module({
  imports: [DbModule, OneSignalModule],
  controllers: [WeeklyProofsController],
  providers: [WeeklyProofsService, WeeklyProofsRepository],
  exports: [WeeklyProofsService, WeeklyProofsRepository]
})
export class WeeklyProofsModule {}
