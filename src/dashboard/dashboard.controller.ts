import { Controller, HttpStatus, Req, Res, Get } from '@nestjs/common';
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

  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Admin overview dashboard',
    description: 'This loads admin overview dashboard',
  })
  @ApiResponse({
    status: 200,
    description: 'dashboard loaded successfully',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('overview')
  async overviewDashboard(@Req() req: Request, @Res() res: Response) {

    const campaign =
      await this.homeDashboardService.overviewDashboard();
    res.status(HttpStatus.CREATED).json({
      message: 'success',
      data: campaign,
    });
  }
}
