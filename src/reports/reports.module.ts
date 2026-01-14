import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { DbModule } from '@src/db/db.module';
import { ReportsRepository } from '@src/reports/repository/reports.repository';

@Module({
  imports: [DbModule],
  controllers: [ReportsController],
  providers: [ReportsService, ReportsRepository],
  exports: [ReportsService, ReportsRepository],
})
export class ReportsModule {}
