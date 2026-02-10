import {
  Controller,
  UseGuards,
  Res,
  Body,
  Patch,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Param,
  Post,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { CampaignService } from '@src/campaign/campaign.service';
import { CloudinaryService } from '@src/cloudinary/cloudinary.service';
import {} from '@src/campaign/dto/draftCampaignDto';
import type { Response } from 'express';

import { ApproveDriverApplicationDto } from '@src/campaign/dto/approve-driver-application.dto';
import { UploadCampaignDesignDto } from '@src/campaign/dto/upload-campaign-design.dto';
import { UpdateCampaignDesignDto } from '@src/campaign/dto/update-campaign-design.dto';
import { ApproveCampaignDto } from '@src/users/dto/approve-campaign.dto';
import { QueryCampaignDto } from '@src/campaign/dto/query-campaign.dto';

@ApiTags('Campaign')
@Controller('campaign')
export class CampaignController {
  constructor(
    private readonly campaignService: CampaignService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ! ========================           admin section     ================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('update/campaign-status')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    description: 'Admin update campaign status to completed manually',
    summary: 'Admin update campaign status to completed manually',
  })
  @ApiResponse({
    status: 200,
    description: 'Update successful',
  })
  async updateCampaignStatusManually(@Res() res: Response) {
    const campaign = await this.campaignService.updateCampaignStatusManually();

    res.status(HttpStatus.OK).json({ message: 'success', data: campaign });
  }

  @Patch('drivers/:driverId/approve')
  @ApiOperation({
    summary: 'Approve driver for campaign',
  })
  async approveDriverCampaign(
    @Param('driverId') driverId: string,
    @Body() approveDto: ApproveDriverApplicationDto,
  ) {
    const campaign = await this.campaignService.approveDriverCampaign(
      approveDto.campaignId,
      driverId,
    );
    return { success: true, data: campaign };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Get campaign comprehensive information',
    description:
      'Get campaigns comprehensive information. Endpoint is only accessible to admins',
  })
  @HttpCode(HttpStatus.OK)
  async getFullCampaignInformation(@Query('campaignId') campaignId: string) {
    const campaign =
      await this.campaignService.getFullCampaignInformation(campaignId);

    return { success: true, data: campaign };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('assigned-drivers/:campaignId')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Gets assigned driver to a campaign',
    description: 'Gets the list of assigned driver to a particular campaign',
  })
  @HttpCode(HttpStatus.OK)
  async listAllAssignedDriversForCampaign(
    @Param('campaignId') campaignId: string,
  ) {
    const campaign =
      await this.campaignService.listAllAssignedDriversForCampaign(campaignId);

    return { success: true, data: campaign };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('created/:businessOwnerId')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Gets all created campaign  by a business owner',
    description: 'Gets all created campaign by a business owner',
  })
  @HttpCode(HttpStatus.OK)
  async listAllCreatedCampaignsByBusinessOwners(
    @Param('businessOwnerId') businessOwnerId: string,
  ) {
    const campaign =
      await this.campaignService.listAllCreatedCampaignsByBusinessOwners(
        businessOwnerId,
      );

    return { success: true, data: campaign };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':campaignId/designs')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Create a campaign design',
    description: 'Submit a campaign design',
  })
  @HttpCode(HttpStatus.CREATED)
  async createCampaignDesigns(
    @Body() body: UploadCampaignDesignDto,
    @Param('campaignId', ParseUUIDPipe) campaignId: string,
  ) {
    const campaign = await this.campaignService.createCampaignDesigns(
      body,
      campaignId,
    );

    return { success: true, data: campaign };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('approve/:campaignId')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Approve a  created campaign',
    description: 'Approve a created Campaign',
  })
  @HttpCode(HttpStatus.CREATED)
  async approveCampaign(
    @Body() body: ApproveCampaignDto,
    @Param('campaignId', ParseUUIDPipe) campaignId: string,
  ) {
    const campaign = await this.campaignService.approveCampaign(body, campaignId);

    return { success: true, message: campaign.message };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':campaignId/designs')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Update a campaign design',
    description: 'update a campaign design',
  })
  @HttpCode(HttpStatus.CREATED)
  async updateCampaignDesigns(
    @Body() body: UpdateCampaignDesignDto,
    @Param('campaignId', ParseUUIDPipe) campaignId: string,
  ) {
    const campaign = await this.campaignService.updateCampaignDesigns(
      body,
      campaignId,
    );

    return { success: true, data: campaign };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('all')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'List all available campaigns',
    description: 'List all available campaigns',
  })
  @HttpCode(HttpStatus.CREATED)
  async listAllAvailableCampaigns(@Query() query: QueryCampaignDto) {
    const campaign =
      await this.campaignService.listAllAvailableCampaigns(query);

    return { success: true, data: campaign };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('driver/applications')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'List all campaigns applications',
    description: 'List all campaign applications',
  })
  @ApiQuery({
    name: 'campaignId',
    required: false,
    type: String,
    description: 'Optional campaign ID to filter applications',
  })
  @HttpCode(HttpStatus.CREATED)
  async listCampaignDriverApplications(
    @Query('campaignId', new ParseUUIDPipe({ optional: true }))
    campaignId?: string,
  ) {
    const campaign =
      await this.campaignService.listCampaignDriverApplications(campaignId);

    return { success: true, data: campaign };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('assigned/:driverId')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary:
      'List all campaigns that have been assigned to a particular driver',
    description: 'List all assigned campaign to a particular driver',
  })
  @HttpCode(HttpStatus.CREATED)
  async listAllAsignedCampaignsForDriver(@Param('driverId') driverId: string) {
    const campaign =
      await this.campaignService.listAllAsignedCampaignsForDriver(driverId);

    return { success: true, data: campaign };
  }
}
