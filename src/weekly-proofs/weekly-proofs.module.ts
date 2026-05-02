import { Module } from '@nestjs/common';
import { WeeklyProofsService } from './weekly-proofs.service';
import { WeeklyProofsController } from './weekly-proofs.controller';
import { DbModule } from '@src/db/db.module';
import { WeeklyProofsRepository } from '@src/weekly-proofs/repository/weekly-proofs.repository';
import { OneSignalModule } from '@src/one-signal/one-signal.module';
import { CampaignModule } from '@src/campaign/campaign.module';
import { NotificationModule } from '@src/notification/notification.module';
import { EmailModule } from '@src/email/email.module';
import { UserModule } from '@src/users/users.module';
@Module({
  imports: [DbModule, OneSignalModule, CampaignModule, NotificationModule, EmailModule,UserModule],
  controllers: [WeeklyProofsController],
  providers: [WeeklyProofsService, WeeklyProofsRepository],
  exports: [WeeklyProofsService, WeeklyProofsRepository]
})
export class WeeklyProofsModule {}
