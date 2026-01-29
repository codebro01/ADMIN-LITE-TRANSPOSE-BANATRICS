import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq, ne, lt, count, lte, gt, or } from 'drizzle-orm';
import { campaignTable } from '@src/db/campaigns';
import { MaintenanceType } from '../dto/publishCampaignDto';
import {
  businessOwnerTable,
  campaignDesignsTable,
  driverCampaignTable,
  driverTable,
  userTable,
} from '@src/db';

import { updatePricePerDriverPerCampaign } from '@src/campaign/dto/update-price-per-driver-per-campaign.dto';
import { UploadCampaignDesignDto } from '@src/campaign/dto/upload-campaign-design.dto';
import { ApproveCampaignDto } from '@src/users/dto/approve-campaign.dto';
import { QueryCampaignDto } from '@src/campaign/dto/query-campaign.dto';

export type CampaignStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'completed';
export type packageType = 'starter' | 'basic' | 'premium' | 'custom';

export type uploadType = {
  secure_url: string;
  public_id: string;
};

export interface CreateCampaignData {
  packageType?: packageType;
  duration?: number;
  revisions?: string;
  price?: number;
  noOfDrivers?: number;
  campaignName?: string;
  campaignDescriptions?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  companyLogo?: uploadType;
  colorPallete?: string[];
  callToAction?: string;
  mainMessage?: string;
  slogan?: string;
  responseOnSeeingBanner?: string;
  uploadedImages?: uploadType[];
  statusType: CampaignStatus;
  updatedAt?: Date;
  maintenanceType?: MaintenanceType;
  lgaCoverage?: string;
}

export interface UpdateCampaignData {
  packageType?: packageType;
  duration?: number;
  revisions?: string;
  price?: number;
  noOfDrivers?: number;
  campaignName?: string;
  campaignDescriptions?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  colorPallete?: string[];
  callToAction?: string;
  mainMessage?: string;
  companyLogo?: {
    secure_url: string;
    public_id: string;
  };
  slogan?: string;
  responseOnSeeingBanner?: string;
  uploadedImages?: uploadType[];
  statusType?: CampaignStatus;
  updatedAt?: Date;
  maintenanceType?: MaintenanceType;
  lgaCoverage?: string;
}

@Injectable()
export class CampaignRepository {
  constructor(
    @Inject('DB')
    private DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  // ! ============================ admin section ===============================

  async findCampaignById(userId: string) {
    const [campaigns] = await this.DbProvider.select()
      .from(campaignTable)
      .where(and(eq(campaignTable.userId, userId)));

    return campaigns;
  }
  async findCampaignByCampaignId(campaignId: string) {
    const [campaigns] = await this.DbProvider.select({
      campaignTitle: campaignTable.campaignName, 
    })
      .from(campaignTable)
      .where(and(eq(campaignTable.id, campaignId)));

    return campaigns;
  }

  

  async updateCampaignStatusToCompleted() {
    const now = new Date();

    const result = await this.DbProvider.update(campaignTable)
      .set({
        statusType: 'completed',
        active: false, 
        updatedAt: now,
      })
      .where(
        and(
          lte(campaignTable.endDate, now), // ended at or before now
          ne(campaignTable.statusType, 'completed'),
        ),
      )
      .returning({
        id: campaignTable.id,
        campaignName: campaignTable.campaignName,
      });

    return result;
  }
  async updateCampaignToActive() {
    const now = new Date();

    const result = await this.DbProvider.update(campaignTable)
      .set({
        active: true,
        updatedAt: now,
      })
      .where(
        and(
          lte(campaignTable.startDate, now),
          gt(campaignTable.endDate, now), // hasn't ended yet
          eq(campaignTable.statusType, 'approved'),
          eq(campaignTable.active, false), // not already active
        ),
      )
      .returning({
        id: campaignTable.id,
        campaignName: campaignTable.campaignName,
      });

    return result;
  }

  async updateCampaignStatusManually() {
    const now = new Date();

    const result = await this.DbProvider.update(campaignTable)
      .set({
        statusType: 'completed',
        updatedAt: now,
      })
      .where(
        and(
          lt(campaignTable.endDate, now),
          ne(campaignTable.statusType, 'completed'),
        ),
      )
      .returning({
        id: campaignTable.id,
        campaignName: campaignTable.campaignName,
      });

    return {
      success: true,
      updatedCount: result.length,
      campaigns: result,
    };
  }

  async updatePricePerDriverPerCampaign(data: updatePricePerDriverPerCampaign) {
    const campaign = await this.DbProvider.update(campaignTable)
      .set({ earningPerDriver: data.earningPerDriver })
      .where(eq(campaignTable.id, data.campaignId));
    return campaign;
  }

  async approveDriverCampaign(campaignId: string, userId: string) {
    console.log('approving', campaignId, userId);
    const [campaign] = await this.DbProvider.update(driverCampaignTable)
      .set({
        campaignStatus: 'approved',
      })
      .where(
        and(
          eq(driverCampaignTable.userId, userId),
          eq(driverCampaignTable.campaignId, campaignId),
        ),
      )
      .returning();

    return campaign;
  }

  async getFullCampaignInformation(campaignId: string) {
    const [campaign] = await this.DbProvider.select({
      campaignName: campaignTable.campaignName,
      status: campaignTable.statusType,
      duration: campaignTable.duration,
      startDate: campaignTable.startDate,
      endDate: campaignTable.endDate,
      totalBudget: campaignTable.price,
      paymentStatus: campaignTable.paymentStatus,
      paymentDate: campaignTable.createdAt,
      advertiser: businessOwnerTable.businessName,
      email: userTable.email,
      phone: userTable.phone,
      colorPallete: campaignTable.colorPallete,
      companyLogo: campaignTable.companyLogo,
      uploadedImages: campaignTable.uploadedImages,
      mainMessage: campaignTable.mainMessage,
      slogan: campaignTable.slogan,
      callToAction: campaignTable.callToAction,
      responseOnSeeingBanner: campaignTable.responseOnSeeingBanner,
      assignedVehicles: count(driverCampaignTable.id),
      noOfDrivers: campaignTable.noOfDrivers,
    })
      .from(campaignTable)
      .where(eq(campaignTable.id, campaignId))
      .leftJoin(userTable, eq(userTable.id, campaignTable.userId))
      .leftJoin(businessOwnerTable, eq(businessOwnerTable.userId, userTable.id))
      .leftJoin(
        driverCampaignTable,
        and(
          eq(driverCampaignTable.campaignId, campaignId),
          eq(driverCampaignTable.campaignStatus, 'approved'),
        ),
      )
      .groupBy(
        campaignTable.id,
        businessOwnerTable.businessName,
        userTable.email,
        userTable.phone,
      );

    return campaign;
  }

  async listAllAssignedDriversForCampaign(campaignId: string) {
    const drivers = await this.DbProvider.select()
      .from(driverCampaignTable)
      .where(
        and(
          eq(driverCampaignTable.campaignId, campaignId),
          ne(driverCampaignTable.campaignStatus, 'rejected'),
        ),
      );

    return drivers;
  }

  async listAllCreatedCampaignsByBusinessOwners(userId: string) {
    const campaigns = await this.DbProvider.select({
      campaignTitle: campaignTable.campaignName, 
      campaignId: campaignTable.id,
      duration: campaignTable.duration,
      vehicles: count(driverCampaignTable.campaignId),
      amount: campaignTable.price,
      status: campaignTable.statusType,
      active: campaignTable.active,
      startDate: campaignTable.startDate,
      endDate: campaignTable.endDate,
    })
      .from(campaignTable)
      .where(eq(campaignTable.userId, userId))
      .leftJoin(
        driverCampaignTable,
        eq(driverCampaignTable.campaignId, campaignTable.id),
      )
      .groupBy(campaignTable.id);

    return campaigns;
  }

  async createCampaignDesigns(
    data: UploadCampaignDesignDto,
    campaignId: string,
  ) {
    const [campaign] = await this.DbProvider.insert(campaignDesignsTable)
      .values({
        campaignId: campaignId,
        designs: data.designs,
        comment: data.comment,
      })
      .returning();

    return campaign;
  }
  async updateCampaignDesigns(
    data: UploadCampaignDesignDto,
    campaignId: string,
  ) {
    const campaign = await this.DbProvider.update(campaignDesignsTable).set({
      campaignId: campaignId,
      designs: data.designs,
      comment: data.comment,
    });

    return campaign;
  }

  async getDesignsForCampaign(campaignId: string) {
    const designs = await this.DbProvider.select()
      .from(campaignDesignsTable)
      .where(eq(campaignDesignsTable.campaignId, campaignId));

    return designs;
  }

  async approveCampaign(data: ApproveCampaignDto, campaignId: string) {
    const [campaign] = await this.DbProvider.update(campaignTable)
      .set({
        statusType: data.approveCampaignType,
        printHousePhoneNo: data.printHousePhoneNo,
      })
      .where(eq(campaignTable.id, campaignId))
      .returning();

    return campaign;
  }

  async listAllAvailableCampaigns(query: QueryCampaignDto) {
    const conditions = [];
    if (query.active) conditions.push(eq(campaignTable.active, query.active));
    if (query.status)
      conditions.push(eq(campaignTable.statusType, query.status));
    const campaigns = await this.DbProvider.select({
      id: campaignTable.id,
      campaignTitle: campaignTable.campaignName,
      startDate: campaignTable.startDate,
      endDate: campaignTable.endDate,
      duration: campaignTable.duration,
      location: campaignTable.state,
      vehicles: count(driverCampaignTable.userId),
      budget: campaignTable.price,
      status: campaignTable.statusType,
      active: campaignTable.active,
    })
      .from(campaignTable)
      .where(
        and(
          // ne(campaignTable.statusType, 'draft'),
          // eq(campaignTable.paymentStatus, 'spent'),

          ...conditions,
        ),
      )
      .leftJoin(
        driverCampaignTable,
        eq(driverCampaignTable.campaignId, campaignTable.id),
      )
      .groupBy(campaignTable.id);

    return { campaigns };
  }

  async listCampaignDriverApplications(campaignId?: string) {

    const conditions = [];

    if(campaignId) conditions.push(eq(driverCampaignTable.campaignId, campaignId));
    console.log(campaignId);
    const applications = await this.DbProvider.select({
      driverId: driverTable.userId, 
      campaignId: campaignTable.id, 
      campaign: campaignTable.campaignName,
      driverFirstName: driverTable.firstname,
      driverLastName: driverTable.lastname,
      phone: userTable.phone,
      appliedDate: driverCampaignTable.createdAt,
      status: driverCampaignTable.campaignStatus,
      budget: campaignTable.price,
      location: campaignTable.state,
      duration: campaignTable.duration,
    })
      .from(driverCampaignTable)
      .where(and(...conditions))
      .leftJoin(
        campaignTable,
        eq(campaignTable.id, driverCampaignTable.campaignId),
      )
      .innerJoin(
        driverTable,
        eq(driverTable.userId, driverCampaignTable.userId),
      )
      .innerJoin(userTable, eq(userTable.id, driverTable.userId));

    return applications;
  }

  async listAllAsignedCampaignsForDriver(userId: string) {
    const campaigns = await this.DbProvider.select({
      campaignId: campaignTable.id,
      campaignName: campaignTable.campaignName,
      expires: campaignTable.endDate,
      campaignStatus: driverCampaignTable.campaignStatus,
      isActive: driverCampaignTable.active,
    })
      .from(driverCampaignTable)
      .where(
        and(
          eq(driverCampaignTable.userId, userId),
          or(eq(driverCampaignTable.campaignStatus, 'approved'), eq(driverCampaignTable.campaignStatus, 'completed')),
        ),
      )
      .leftJoin(
        campaignTable,
        eq(campaignTable.id, driverCampaignTable.campaignId),
      );

    return campaigns;
  }
}
