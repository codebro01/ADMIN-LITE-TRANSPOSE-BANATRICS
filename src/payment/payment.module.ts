import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { DbProvider } from '@src/db/provider';
import {  HttpModule } from '@nestjs/axios';
import { UserModule } from '@src/users/users.module';
import { PaymentRepository } from '@src/payment/repository/payment.repository';
import { CampaignModule } from '@src/campaign/campaign.module';
import { CatchErrorModule } from '@src/catch-error/catch-error.module';
import { NotificationModule } from '@src/notification/notification.module';
import { EarningModule } from '@src/earning/earning.module';
import { BankDetailsModule } from '@src/bank-details/bank-details.module';

@Module({
  imports: [HttpModule, UserModule, CampaignModule, CatchErrorModule, NotificationModule, EarningModule, BankDetailsModule],
  controllers: [PaymentController],
  providers: [PaymentService, DbProvider, PaymentRepository],
})
export class PaymentModule {}

