import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { DbModule } from '@src/db/db.module';
import { InvoicesRepository } from '@src/invoices/repository/invoices.repository';

@Module({
  imports:[DbModule],
  controllers: [InvoicesController],
  providers: [InvoicesService, InvoicesRepository],
  exports: [InvoicesService, InvoicesRepository],
})
export class InvoicesModule {}
