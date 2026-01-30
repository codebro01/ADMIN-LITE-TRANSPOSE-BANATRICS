import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { InstallmentProofsService } from './installment-proofs.service';
import { UpdateInstallmentProofDto } from '@src/installment-proofs/dto/update-installment-proof.dto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { ApiCookieAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@Controller('installment-proofs')
export class InstallmentProofsController {
  constructor(
    private readonly installmentProofsService: InstallmentProofsService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':driverId/:campaignId')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'List installment proofs',
    description: 'List installment proofs for a campaign by driver Id',
  })
  @HttpCode(HttpStatus.OK)
  @ApiQuery({
    name: 'campaignId',
    required: false,
    type: String,
    description: 'Optional campaign ID to filter applications',
  })
  @ApiQuery({
    name: 'driverId',
    required: false,
    type: String,
    description: 'Optional driver ID to filter applications',
  })
  async getCampaignInstallmentProof(
    @Param('driverId', ParseUUIDPipe) driverId?: string,
    @Param('campaignId', ParseUUIDPipe) campaignId?: string,
  ) {
    const installmentProofs =
      await this.installmentProofsService.getCampaignInstallmentProof(
        campaignId,
        driverId,
      );

    return {
      success: true,
      data: installmentProofs,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('approve-reject/:driverId/:campaignId')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Approve installment proofs',
    description: 'Approve-reject proofs for a campaign by driver Id',
  })
  @HttpCode(HttpStatus.OK)
  async approveOrRejectInstallmentProof(
    @Body('body') body: UpdateInstallmentProofDto,
    @Param('driverId', ParseUUIDPipe) driverId: string,
    @Param('campaignId', ParseUUIDPipe) campaignId: string,
  ) {
    const installmentProofs =
      await this.installmentProofsService.updateCampaignInstallmentProof(
        body,
        campaignId,
        driverId,
      );

    return {
      success: true,
      data: installmentProofs,
    };
  }
}
