import { BadRequestException, Injectable } from '@nestjs/common';

import { CloudinaryService } from '@src/cloudinary/cloudinary.service';
import { CampaignRepository } from '@src/campaign/repository/campaign.repository';
import { NotificationService } from '@src/notification/notification.service';
import { PackageRepository } from '@src/package/repository/package.repository';

import { CronExpression, Cron } from '@nestjs/schedule';
import { updatePricePerDriverPerCampaign } from '@src/campaign/dto/update-price-per-driver-per-campaign.dto';
import { UploadCampaignDesignDto } from '@src/campaign/dto/upload-campaign-design.dto';
import { ApproveCampaignDto } from '@src/users/dto/approve-campaign.dto';

@Injectable()
export class CampaignService {
  constructor(
    private readonly campaignRepository: CampaignRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly notificationService: NotificationService,
    private readonly packageRepository: PackageRepository,
  ) {}

  // !====================== admin section ===================================================

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCampaignStatusUpdate() {
    console.log('Running campaign status update job...');

    const result = await this.campaignRepository.handleCampaignStatusUpdate();

    return result;
  }

  async updateCampaignStatusManually() {
    const result = await this.campaignRepository.updateCampaignStatusManually();

    return result;
  }
  async updatePricePerDriverPerCampaign(data: updatePricePerDriverPerCampaign) {
    const result =
      await this.campaignRepository.updatePricePerDriverPerCampaign(data);

    return result;
  }

  async approveDriverCampaign(campaignId: string, userId: string) {
    return await this.campaignRepository.approveDriverCampaign(
      campaignId,
      userId,
    );
  }

  async getFullCampaignInformation(campaignId: string) {
    return await this.campaignRepository.getFullCampaignInformation(campaignId);
  }

  async listAllAssignedDriversForCampaign(campaignId: string) {
    return this.campaignRepository.listAllAssignedDriversForCampaign(
      campaignId,
    );
  }

  async listAllCreatedCampaignsByBusinessOwners(userId: string) {
    return this.campaignRepository.listAllCreatedCampaignsByBusinessOwners(
      userId,
    );
  }
  async createCampaignDesigns(data: UploadCampaignDesignDto) {
    return this.campaignRepository.createCampaignDesigns(data);
  }
  async updateCampaignDesigns(data: UploadCampaignDesignDto) {
    return this.campaignRepository.updateCampaignDesigns(data);
  }
  async approveCampaign(data: ApproveCampaignDto, campaignId: string) {
    return this.campaignRepository.approveCampaign(data, campaignId);
  }
  async listAllAvailableCampaigns() {
    return this.campaignRepository.listAllAvailableCampaigns();
  }
  async listCampaignDriverApplications(campaignId: string) {
    console.log('got to here nah', campaignId)
    if(!campaignId) throw new BadRequestException('Campaign Id not provided') 
    return this.campaignRepository.listCampaignDriverApplications(campaignId);
  }
  async listAllAsignedCampaignsForDriver(userId: string) {
    return this.campaignRepository.listAllAsignedCampaignsForDriver(userId);
  }
}
