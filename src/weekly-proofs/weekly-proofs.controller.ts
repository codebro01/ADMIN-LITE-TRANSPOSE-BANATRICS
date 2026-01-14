import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  HttpStatus,
  UseGuards,
  HttpCode,
  Query,
} from '@nestjs/common';
import { WeeklyProofsService } from './weekly-proofs.service';
import {
  WeeklyProofStatus,
} from './dto/create-weekly-proof.dto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import {
  ApiCookieAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { QueryWeeklyProofDto } from '@src/weekly-proofs/dto/query-weekly-proofs.dto';

@Controller('weekly-proofs')
export class WeeklyProofsController {
  constructor(private readonly weeklyProofsService: WeeklyProofsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Weekly Proof Dashboard cards',
    description:
      'Fetches weekly proofs info such as No. of total drivers, No of accepted weekly proofs etc',
  })
  @HttpCode(HttpStatus.OK)
  async weeklyProofDashboardCards() {
    const weeklyProofs =
      await this.weeklyProofsService.weeklyProofDashboardCards();

    return { success: true, data: weeklyProofs };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Query weekly proofs',
    description: 'Query Weekly proofs by using query like limit, page etc.',
  })
  @HttpCode(HttpStatus.OK)
  async queryAllWeeklyProofs(@Query() query: QueryWeeklyProofDto) {
    const weeklyProofs =
      await this.weeklyProofsService.queryAllWeeklyProofs(query);

    return { success: true, data: weeklyProofs };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':weeklyProofId/user/:driverId')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Get weekly proof details',
    description:
      'Provides information about a weekly detail by providing its id and the user id',
  })
  @HttpCode(HttpStatus.OK)
  async weeklyProofDetails(
    @Param('weeklyProofId') weeklyProofId: string,
    @Param('driverId') driverId: string,
  ) {
    const weeklyProofs = await this.weeklyProofsService.weeklyProofDetails(
      weeklyProofId,
      driverId,
    );

    return { success: true, data: weeklyProofs };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('approve-reject/:campaignId/driver/:driverId')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Approve or reject weekly proof',
    description: 'Admin approves or reject week proofs =',
  })
  @HttpCode(HttpStatus.OK)
  async approveOrRejectWeeklyProof(
    @Param('campaignId') campaignId: string,
    @Param('driverId') driverId: string,
    @Body('status') status: WeeklyProofStatus,
  ) {
    const weeklyProofs =
      await this.weeklyProofsService.approveOrRejectWeeklyProof(
        { statusType: status },
        campaignId,
        driverId,
      );

    return { success: true, data: weeklyProofs };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':driverId')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'List all weekly proofs for particular driver',
    description: 'List all weekly proofs submitted by a driver',
  })
  @HttpCode(HttpStatus.OK)
  async listDriverWeeklyProofs(@Param('driverId') driverId: string) {
    const weeklyProofs =
      await this.weeklyProofsService.listDriverWeeklyProofs(driverId);

    return { success: true, data: weeklyProofs };
  }
}
