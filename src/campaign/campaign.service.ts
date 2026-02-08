import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CloudinaryService } from '@src/cloudinary/cloudinary.service';
import { CampaignRepository } from '@src/campaign/repository/campaign.repository';
import { NotificationService } from '@src/notification/notification.service';
import { PackageRepository } from '@src/package/repository/package.repository';

import { CronExpression, Cron } from '@nestjs/schedule';
import { UploadCampaignDesignDto } from '@src/campaign/dto/upload-campaign-design.dto';
import {
  ApproveCampaignDto,
  approveCampaignType,
} from '@src/users/dto/approve-campaign.dto';
import { QueryCampaignDto } from '@src/campaign/dto/query-campaign.dto';
import {
  CategoryType,
  StatusType,
  VariantType,
} from '@src/notification/dto/createNotificationDto';
import { UserRepository } from '@src/users/repository/user.repository';
import { InvoicesRepository } from '@src/invoices/repository/invoices.repository';
import { InvoiceStatusType } from '@src/db';
import { EmailService } from '../email/email.service';
import { EmailTemplateType } from '@src/email/types/types';

@Injectable()
export class CampaignService {
  constructor(
    private readonly campaignRepository: CampaignRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly notificationService: NotificationService,
    private readonly packageRepository: PackageRepository,
    private readonly invoicesRepository: InvoicesRepository,
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
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

  async approveDriverCampaign(campaignId: string, userId: string) {
    const approvedCampaign =
      await this.campaignRepository.approveDriverCampaign(campaignId, userId);

    const campaign = await this.campaignRepository.findCampaignByCampaignId(
      approvedCampaign.campaignId,
    );

    await this.notificationService.createNotification(
      {
        title: 'Campaign Approved',
        message: `Your campaign "${campaign.campaignTitle} has been approved, please provide an installation proof within 24 hours. Thank you.`,
        category: CategoryType.CAMPAIGN,
        variant: VariantType.INFO,
        priority: 'important',
        status: StatusType.UNREAD,
      },
      userId,
      'driver',
    );

    return approvedCampaign;
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
    const existingDesign =
      await this.campaignRepository.getDesignsForCampaign(campaignId);
    if (existingDesign.length > 0)
      throw new BadRequestException(
        `This campaign currently has an uploaded design, please update the design.`,
      );
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
    const [design] =
      await this.campaignRepository.getDesignsForCampaign(campaignId);
    if (!design)
      throw new BadRequestException(
        'Design has not been created for the campaign',
      );
    if (design.approvalStatus !== approveCampaignType.APPROVE)
      throw new BadRequestException(
        'Please make sure the design of the campaign is approved before approving the campaign',
      );

    const Trx = await this.campaignRepository.executeInTransaction(
      async (trx) => {
        const campaign =
          await this.campaignRepository.updatePricePerDriverPerCampaign(
            data.pricePerDriver,
            campaignId,
            trx,
          );

        await this.campaignRepository.updateCampaignPaymentStatus(
          campaign.campaignId,
          campaign.userId,
          trx,
        );

        if (!campaign.amount)
          throw new NotFoundException('Could not get price of the campaign');

        await this.userRepository.updateBusinessOwnerPendingBalance(
          campaign.amount,
          campaign.userId,
          trx,
        );

        const invoice = await this.invoicesRepository.updateInvoiceStatus(
          InvoiceStatusType.SUCCESS,
          campaignId,
          campaign.userId,
          trx,
        );
        const approveCampaign = await this.campaignRepository.approveCampaign(
          data,
          campaignId,
          trx,
        );

        return { invoice, approveCampaign };
      },
    );

    const user = await this.userRepository.findUserById(
      Trx.approveCampaign.userId,
    );

    await this.emailService.queueTemplatedEmail(
      EmailTemplateType.CAMPAIGN_APPROVED,
      user.email,
      {
        invoiceId: Trx.invoice.id,
        campaignTitle: Trx.approveCampaign.campaignTitle,
        startDate: Trx.approveCampaign.startDate,
        endDate: Trx.approveCampaign.endDate,
        amountPaid: Trx.approveCampaign.price,
        noOfDrivers: Trx.approveCampaign.noOfDrivers,
        invoiceStatus: Trx.invoice.Status,
        packageType: Trx.approveCampaign.packageType,
        campaignStatus: Trx.approveCampaign.statusType,
      },
    );

    return Trx.approveCampaign;
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
