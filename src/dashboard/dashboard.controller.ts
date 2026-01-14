import { Controller, HttpStatus, HttpCode, Req, Res, Get } from '@nestjs/common';
import { HomeDashboardService } from '@src/dashboard/dashboard.service';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from '@src/auth/decorators/roles.decorators';
import  type { Response } from 'express';
import type { Request } from '@src/types';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';


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
  @ApiResponse({
    status: 200,
    description: 'dashboard loaded successfully',
  })
  async overviewDashboard(@Req() req: Request, @Res() res: Response) {

    const campaign =
      await this.homeDashboardService.overviewDashboard();
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
    summary: 'Fetches monthly revenue for the  past 6 months convenient for graph',
    description: 'This loads monthly revenue last 6 months. Enpoint is only accessible for admins',
  })
  @ApiResponse({
    status: 200,
    description: 'dashboard loaded successfully',
  })
  @HttpCode(HttpStatus.OK)
  async getMonthlyRevenueLast6Months() {

    const result =
      await this.homeDashboardService.getMonthlyRevenueLast6Months();
    return {
      success: true, 
      data: result
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('seven-days-campaign-growth')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Fetches 7 days campaign growth convenient for graph',
    description: 'This loads campaign growth for the last 7 days. Enpoint is only accessible for admins',
  })
  @ApiResponse({
    status: 200,
    description: 'dashboard loaded successfully',
  })
  @HttpCode(HttpStatus.OK)
  async get7DaysGrowth() {

    const result =
      await this.homeDashboardService.get7DaysGrowth();
    return {
      success: true, 
      data: result
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('six-months-campaign-growth')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Fetches 6  months campaign growth convenient for graph',
    description: 'This loads campaign growth for the last 6 months. Enpoint is only accessible for admins',
  })
  @ApiResponse({
    status: 200,
    description: 'dashboard loaded successfully',
  })
  @HttpCode(HttpStatus.OK)
  async get6MonthsGrowth() {

    const result =
      await this.homeDashboardService.get6MonthsGrowth();
    return {
      success: true, 
      data: result
    }
  }

  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('five-years-campaign-growth')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Fetches 5 years campaign growth convenient for graph',
    description: 'This loads campaign growth for the last 5 months. Enpoint is only accessible for admins',
  })
  @ApiResponse({
    status: 200,
    description: 'dashboard loaded successfully',
  })
  @HttpCode(HttpStatus.OK)
  async get5YearsGrowth() {

    const result =
      await this.homeDashboardService.get5YearsGrowth();
    return {
      success: true, 
      data: result
    }
  }
    
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('six-months-earnings')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Fetches 6 months  earnings convenient for graph',
    description: 'This loads earnings for the last 6 months. Enpoint is only accessible for admins',
  })
  @ApiResponse({
    status: 200,
    description: 'dashboard loaded successfully',
  })
  @HttpCode(HttpStatus.OK)
  async get6MonthsEarnings() {

    const result =
      await this.homeDashboardService.get6MonthsEarnings();
    return {
      success: true, 
      data: result
    }
  }
}

