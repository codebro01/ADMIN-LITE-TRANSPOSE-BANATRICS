import { Controller, Get, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('cards')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Returns data for report dashboard cards',
    description: 'Returns data for report dashboard cards',
  })
  @HttpCode(HttpStatus.OK)
  reportsDashboardCards() {
    return this.reportsService.reportsDashboardCards();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('cards')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Returns data for Monthly revenue trend chart',
    description: 'Returns a plottable data for monthly revenue trend chart',
  })
  @HttpCode(HttpStatus.OK)
  monthlyRevenueTrend() {
    return this.reportsService.monthlyRevenueTrend();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('cards')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Returns data for driver activity trend chart',
    description: 'Returns a plottable data for driver activity trend chart',
  })
  @HttpCode(HttpStatus.OK)
  getDriverActivityTrend() {
    return this.reportsService.getDriverActivityTrend();
  }
}
