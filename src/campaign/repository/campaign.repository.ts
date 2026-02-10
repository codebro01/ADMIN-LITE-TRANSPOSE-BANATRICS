import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq, ne, lt, count, lte, gt, or } from 'drizzle-orm';
import { campaignTable } from '@src/db/campaigns';
import {
  businessOwnerTable,
  campaignDesignsTable,
  driverCampaignTable,
  driverTable,
  installmentProofTable,
  userTable,
} from '@src/db';

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

@Injectable()
export class CampaignRepository {
  constructor(
    @Inject('DB')
    private DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  async executeInTransaction<T>(
    callback: (trx: any) => Promise<T>,
  ): Promise<T> {
    return await this.DbProvider.transaction(async (trx) => {
      return await callback(trx);
    });
  }

  // ! ============================ admin section ===============================

  async findCampaignByUserId(userId: string) {
    const [campaigns] = await this.DbProvider.select()
      .from(campaignTable)
      .where(and(eq(campaignTable.userId, userId)));

    return campaigns;
  }
  // async findCampaignByCampaignId(campaignId: string) {
  //   const [campaigns] = await this.DbProvider.select()
  //     .from(campaignTable)
  //     .where(and(eq(campaignTable.id, campaignId)));

  //   return campaigns;
  // }
  async findCampaignByCampaignId(campaignId: string) {
    const [campaigns] = await this.DbProvider.select({
      userId: campaignTable.userId,
      duration: campaignTable.duration,
      price: campaignTable.price,
      campaignTitle: campaignTable.campaignName,
      earningPerDriver: campaignTable.earningPerDriver,
      statusType: campaignTable.statusType,
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
  async updateCampaignPaymentStatus(
    campaignId: string,
    userId: string,
    paymentStatus: boolean,
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;
    const now = new Date();

    const result = await Trx.update(campaignTable)
      .set({
        paymentStatus: paymentStatus,
        updatedAt: now,
      })
      .where(
        and(
          eq(campaignTable.active, false),
          eq(campaignTable.id, campaignId),
          eq(campaignTable.userId, userId),
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

  async updatePricePerDriverPerCampaign(
    amount: number,
    campaignId: string,
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;
    const [campaign] = await Trx.update(campaignTable)
      .set({ earningPerDriver: amount })
      .where(eq(campaignTable.id, campaignId))
      .returning({
        campaignId: campaignTable.id,
        amount: campaignTable.price,
        userId: campaignTable.userId,
        statusType: campaignTable.statusType,
      });
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

  async startDriverCampaign(campaignId: string, userId: string) {
    const [campaign] = await this.DbProvider.update(driverCampaignTable)
      .set({
        startDate: new Date(),
        active: true,
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
    const drivers = await this.DbProvider.select({
      id: driverCampaignTable.id,
      userId: driverCampaignTable.userId,
      campaignId: driverCampaignTable.campaignId,
      campaignStatus: driverCampaignTable.campaignStatus,
      paid: driverCampaignTable.paid,
      active: driverCampaignTable.active,
      startDate: driverCampaignTable.startDate,
      createdAt: driverCampaignTable.createdAt,
      updatedAt: driverCampaignTable.updatedAt,
      firstName: driverTable.firstname,
      lastname: driverTable.lastname,
      installmentProofStatus: installmentProofTable.statusType,
    })
      .from(driverCampaignTable)
      .where(
        and(
          eq(driverCampaignTable.campaignId, campaignId),
          eq(driverCampaignTable.campaignStatus, 'approved'),
        ),
      )
      .leftJoin(driverTable, eq(driverTable.userId, driverCampaignTable.userId))
      .leftJoin(
        installmentProofTable,
        eq(installmentProofTable.campaignId, campaignId),
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

  async approveCampaign(
    data: ApproveCampaignDto,
    campaignId: string,
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;
    const [campaign] = await Trx.update(campaignTable)
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
      packageType: campaignTable.packageType,
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

    if (campaignId)
      conditions.push(eq(driverCampaignTable.campaignId, campaignId));
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
      installmentProofStatus: installmentProofTable.statusType,
    })
      .from(driverCampaignTable)
      .where(
        and(
          eq(driverCampaignTable.userId, userId),
          or(
            eq(driverCampaignTable.campaignStatus, 'approved'),
            eq(driverCampaignTable.campaignStatus, 'completed'),
          ),
        ),
      )
      .leftJoin(
        campaignTable,
        eq(campaignTable.id, driverCampaignTable.campaignId),
      )
      .leftJoin(
        installmentProofTable,
        and(
          eq(installmentProofTable.userId, driverCampaignTable.userId),
          eq(installmentProofTable.campaignId, driverCampaignTable.campaignId),
        ),
      );

    return campaigns;
  }

  async getApprovedDriverCampaign(userId: string) {
    const [driverCampaign] = await this.DbProvider.select()
      .from(driverCampaignTable)
      .where(
        and(
          eq(driverCampaignTable.userId, userId),
          eq(driverCampaignTable.campaignStatus, 'approved'),
        ),
      );

      return driverCampaign
  }
}
