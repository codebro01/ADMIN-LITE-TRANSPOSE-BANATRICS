import {  BadRequestException, Injectable } from '@nestjs/common';

import { CloudinaryService } from '@src/cloudinary/cloudinary.service';
import { CampaignRepository } from '@src/campaign/repository/campaign.repository';
import { NotificationService } from '@src/notification/notification.service';
import { PackageRepository } from '@src/package/repository/package.repository';

import { CronExpression, Cron } from '@nestjs/schedule';
import { updatePricePerDriverPerCampaign } from '@src/campaign/dto/update-price-per-driver-per-campaign.dto';
import { UploadCampaignDesignDto } from '@src/campaign/dto/upload-campaign-design.dto';
import { ApproveCampaignDto, approveCampaignType } from '@src/users/dto/approve-campaign.dto';
import { QueryCampaignDto } from '@src/campaign/dto/query-campaign.dto';
import { CategoryType, StatusType, VariantType } from '@src/notification/dto/createNotificationDto';

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
  async updateCampaignStatusToCompleted() {
    console.log('Running campaign status update job...');

    const result =
      await this.campaignRepository.updateCampaignStatusToCompleted();

    return result;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateCampaignToActive() {
    console.log('Running campaign status update job...');

    const result = await this.campaignRepository.updateCampaignToActive();

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
    const approvedCampaign =  await this.campaignRepository.approveDriverCampaign(
      campaignId,
      userId,
    );

    const campaign = await this.campaignRepository.findCampaignByCampaignId(approvedCampaign.campaignId)

    await this.notificationService.createNotification({
      title: 'Campaign Approved', 
      message: `Your campaign "${campaign.campaignTitle} has been approved, please provide an installation proof within 24 hours. Thank you.`, 
      category: CategoryType.CAMPAIGN, 
      variant: VariantType.INFO, 
      priority: 'important', 
      status: StatusType.UNREAD, 
    }, userId, 'driver')

    return approvedCampaign
  }

  async getFullCampaignInformation(campaignId: string) {
    const [campaign, design] = await Promise.all([
      this.campaignRepository.getFullCampaignInformation(campaignId),
      this.campaignRepository.getDesignsForCampaign(campaignId),
    ]);

    return {
      ...campaign,
      design,
    };
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
  async createCampaignDesigns(
    data: UploadCampaignDesignDto,
    campaignId: string,
  ) {

    const existingDesign = await this.campaignRepository.getDesignsForCampaign(campaignId);
    if(existingDesign.length > 0) throw new BadRequestException(`This campaign currently has an uploaded design, please update the design.`)
    return this.campaignRepository.createCampaignDesigns(data, campaignId);
  }
  async updateCampaignDesigns(
    data: UploadCampaignDesignDto,
    campaignId: string,
  ) {
    return this.campaignRepository.updateCampaignDesigns(data, campaignId);
  }
  async getDesignsForCampaign(campaignId: string) {
    return this.campaignRepository.getDesignsForCampaign(campaignId);
  }
  async approveCampaign(data: ApproveCampaignDto, campaignId: string) {
    const [design] = await this.campaignRepository.getDesignsForCampaign(campaignId);
    if(!design) throw new BadRequestException(
      'Design has not been created for the campaign',
    );
    if(design.approvalStatus !== approveCampaignType.APPROVE) throw new BadRequestException('Please make sure the design of the campaign is approved before approving the campaign')
    return this.campaignRepository.approveCampaign(data, campaignId);
  }
  async listAllAvailableCampaigns(query: QueryCampaignDto) {
    return this.campaignRepository.listAllAvailableCampaigns(query);
  }
  async listCampaignDriverApplications(campaignId?: string) {
    console.log('got to here nah', campaignId);
    // if (!campaignId) throw new BadRequestException('Campaign Id not provided');
    return this.campaignRepository.listCampaignDriverApplications(campaignId);
  }
  async listAllAsignedCampaignsForDriver(userId: string) {
    return this.campaignRepository.listAllAsignedCampaignsForDriver(userId);
  }
}
