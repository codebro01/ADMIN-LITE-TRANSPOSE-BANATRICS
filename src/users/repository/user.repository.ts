import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import {
  bankDetailsTable,
  campaignTable,
  driverCampaignTable,
  paymentTable,
  vehicleDetailsTable,
} from '@src/db';
import { earningsTable } from '@src/db/earnings';
import {
  userInsertType,
  userTable,
  adminTable,
  adminInsertType,
  driverTable,
  businessOwnerTable,
} from '@src/db/users';

import { eq, or, count, and, sql, avg } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { bankDetails } from 'drizzle/schema';

@Injectable()
export class UserRepository {
  constructor(
    @Inject('DB') private DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  async createUser(
    data: Pick<
      userInsertType,
      'email' | 'password' | 'phone' | 'role' | 'emailVerified'
    >,
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;
    const [user] = await Trx.insert(userTable).values(data).returning();

    return user;
  }

  async createAdmin(data: adminInsertType, trx?: any) {
    const Trx = trx || this.DbProvider;
    const admin = await Trx.insert(adminTable).values(data).returning();
    return admin;
  }

  async updateAdmin(data: Pick<adminInsertType, 'fullName'>, userId: string) {
    const userIsExisting = await this.findUserById(userId);
    if (!userIsExisting) throw new NotFoundException('Invalid Request');
    const admin = await this.DbProvider.update(adminTable)
      .set({ ...data, userId, updatedAt: new Date() })
      .where(eq(adminTable.userId, userId))
      .returning();

    return admin;
  }

  async findUserById(userId: string) {
    const user = await this.DbProvider.select()
      .from(userTable)
      .where(eq(userTable.id, userId));
    return user;
  }

  async getAdminProfile(userId: string) {
    const [user, admin] = await Promise.all([
      this.DbProvider.select({ email: userTable.email })
        .from(userTable)
        .where(eq(userTable.id, userId)),
      this.DbProvider.select({ fullName: adminTable.fullName })
        .from(adminTable)
        .where(eq(adminTable.userId, userId)),
    ]);

    return { ...user, ...admin };
  }

  async findByEmailOrPhone(data: { email?: string; phone?: string }) {
    const condition = [];

    if (data.email) {
      condition.push(eq(userTable.email, data.email));
    }
    if (data.phone) {
      condition.push(eq(userTable.phone, data.phone));
    }
    const [user] = await this.DbProvider.select({
      id: userTable.id,
      email: userTable.email,
      phone: userTable.phone,
      role: userTable.role,
    })
      .from(userTable)
      .where(or(...condition));

    return user;
  }

  async updateUserToken(token: string, userId: string) {
    const [user] = await this.DbProvider.update(userTable)
      .set({ refreshToken: token })
      .where(eq(userTable.id, userId))
      .returning();

    return user;
  }

  async updateByUserId(
    data: Partial<userInsertType>,
    userId: string,
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;
    const [user] = await Trx.update(userTable)
      .set(data)
      .where(eq(userTable.id, userId))
      .returning({
        id: userTable.id,
        email: userTable.email,
        phone: userTable.phone,
      });

    return user;
  }

  async getStoredPassword(userId: string) {
    const [storedPassword] = await this.DbProvider.select({
      password: userTable.password,
    })
      .from(userTable)
      .where(eq(userTable.id, userId));

    return storedPassword;
  }

  async listAllDrivers(status: boolean, limit: number, offset: number) {
    const users = await this.DbProvider.select({
      id: userTable.id,
      lastname: driverTable.lastname,
      firstname: driverTable.firstname,
      phone: userTable.phone,
      totalCampaign: count(driverCampaignTable.id),
      totalEarnings: sql<number>`COALESCE(SUM(${earningsTable.amount}), 0)`, // Sum earnings, default to 0
    })
      .from(driverTable)
      .leftJoin(userTable, eq(userTable.id, driverTable.userId))
      .leftJoin(
        driverCampaignTable,
        and(
          eq(driverCampaignTable.userId, userTable.id),
          eq(driverCampaignTable.campaignStatus, 'completed'),
          eq(driverTable.approvedStatus, status),
        ),
      )
      .leftJoin(earningsTable, eq(earningsTable.userId, driverTable.userId))
      .groupBy(driverTable.id)
      .limit(limit)
      .offset(offset);

    return users;
  }

  async listAllBusinessOwners(status: boolean, limit: number, offset: number) {
    const user = await this.DbProvider.select({
      id: userTable.id,
      businessName: businessOwnerTable.businessName,
      phone: userTable.phone,
      email: userTable.email,
      totalBalance: businessOwnerTable.balance,
      status: businessOwnerTable.status,
      totalSpent: sql<number>`COALESCE(SUM(${paymentTable.amount}), 0)`, // Sum earnings, default to 0
      campaigns: count(campaignTable.statusType),
    })
      .from(businessOwnerTable)
      .where(
        and(
          eq(businessOwnerTable.status, status),
          eq(paymentTable.userId, businessOwnerTable.userId),
        ),
      )
      .leftJoin(userTable, eq(userTable.id, businessOwnerTable.userId))
      .leftJoin(
        paymentTable,
        eq(paymentTable.userId, businessOwnerTable.userId),
      )
      .leftJoin(
        campaignTable,
        eq(campaignTable.userId, businessOwnerTable.userId),
      )
      .groupBy(businessOwnerTable.id)
      .limit(limit)
      .offset(offset);

    return user;
  }

  async getFullDriverInformation(userId: string) {
    const user = await this.DbProvider.select({
      id: userTable.id,
      phone: userTable.phone,
      kycStatus: driverTable.approvedStatus,
      city: driverTable.state,
      registrationDate: userTable.createdAt,
      bankName: bankDetails.bankCode,
      accountNumber: bankDetails.accountNumber,
      accountName: bankDetails.accountName,
      vehiclePhoto: vehicleDetailsTable.vehiclePhotos,
      driverLicense: driverTable.driverLicense,
      vehiclePapers: driverTable.owershipDocument,
      totalEarnings: sql<number>`COALESCE(SUM(${earningsTable.amount}), 0)`,
    })
      .from(userTable)
      .where(eq(userTable.id, userId))
      .leftJoin(driverTable, eq(driverTable.userId, userTable.id))
      .leftJoin(bankDetailsTable, eq(bankDetailsTable.userId, userTable.id))
      .leftJoin(
        vehicleDetailsTable,
        eq(vehicleDetailsTable.userId, userTable.id),
      )
      .leftJoin(earningsTable, eq(earningsTable.userId, userTable.id))
      .groupBy(
        userTable.id,
        driverTable.id,
        bankDetailsTable.id,
        vehicleDetailsTable.id,
      );

    return user[0];
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
      .where(eq(driverCampaignTable.userId, userId))
      .leftJoin(
        campaignTable,
        eq(campaignTable.id, driverCampaignTable.campaignId),
      );

    return campaigns;
  }

  async getFullBusinessOwnerInformation(userId: string) {
    const user = await this.DbProvider.select({
      id: userTable.id,
      email: userTable.email,
      totalCampaigns: count(campaignTable.userId),
      phone: userTable.phone,
      totalSpent: sql<number>`COALESCE(SUM(${paymentTable.amount}), 0)`,
      averagePerCampaign: avg(paymentTable.amount),
    })
      .from(userTable)
      .where(and(eq(userTable.id, userId)));

    return user;
  }


}
