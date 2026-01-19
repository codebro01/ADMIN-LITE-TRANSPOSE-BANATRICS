import {
  Controller,
  HttpStatus,
  HttpCode,
  Req,
  Res,
  Get,
  Query,
} from '@nestjs/common';
import { HomeDashboardService } from '@src/dashboard/dashboard.service';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from '@src/auth/decorators/roles.decorators';
import type { Response } from 'express';
import type { Request } from '@src/types';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { GraphQueryDto } from '@src/dashboard/dto/campaign-growth-query.dto';

@ApiTags('dashboard-overview')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly homeDashboardService: HomeDashboardService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('overview')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Admin overview dashboard',
    description: 'This loads admin overview dashboard cards',
  })
  async overviewDashboard(@Req() req: Request, @Res() res: Response) {
    const campaign = await this.homeDashboardService.overviewDashboard();
    res.status(HttpStatus.CREATED).json({
      message: 'success',
      data: campaign,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('monthly-revenue')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary:
      'Fetches monthly revenue for the  past 6 months convenient for graph',
    description:
      'This loads monthly revenue last 6 months. Enpoint is only accessible for admins',
  })
  @HttpCode(HttpStatus.OK)
  async getMonthlyRevenueLast6Months() {
    const result =
      await this.homeDashboardService.getMonthlyRevenueLast6Months();
    return {
      success: true,
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('campaign-growth')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Fetches campaign growth data convenient for graph',
    description:
      'This loads campaign growth based on query. Enpoint is only accessible for admins',
  })
  @HttpCode(HttpStatus.OK)
  async get7DaysGrowth(@Query() query: GraphQueryDto) {
    const result = await this.homeDashboardService.getCampaignGrowth(query);
    return {
      success: true,
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('total-payouts')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Fetches total payouts based on query convenient for graph',
    description:
      'This loads total payouts data. Enpoint is only accessible for admins',
  })
  @HttpCode(HttpStatus.OK)
  async get6MonthsEarnings(@Query() query: GraphQueryDto) {
    const result = await this.homeDashboardService.getTotalPayouts(query);
    return {
      success: true,
      data: result,
    };
  }
}
