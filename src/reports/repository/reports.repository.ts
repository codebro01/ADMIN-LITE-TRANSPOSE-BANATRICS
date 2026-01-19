import { Inject, Injectable } from '@nestjs/common';
import { campaignTable, driverCampaignTable, driverTable, paymentTable, UserApprovalStatusType } from '@src/db';
import { PaymentStatusType } from '@src/payment/dto/paystackMetadataDto';
import { eq, sum, count, avg, sql, gte } from 'drizzle-orm';

import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class ReportsRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  async reportsDashboardCards() {
    const [
      [totalRevenue],
      [totalDrivers],
      [activeCampaigns],
      [avgCampaignCost],
    ] = await Promise.all([
      this.DbProvider.select({ total: sum(paymentTable.amount) })
        .from(paymentTable)
        .where(eq(paymentTable.paymentStatus, PaymentStatusType.SUCCESS)),
      this.DbProvider.select({ total: count(driverTable.id) })
        .from(driverTable)
        .where(eq(driverTable.approvedStatus, UserApprovalStatusType.APPROVED)),
      this.DbProvider.select({ total: count(campaignTable.id) })
        .from(campaignTable)
        .where(eq(campaignTable.active, true)),
      this.DbProvider.select({ avg: avg(campaignTable.price) }).from(
        campaignTable,
      ),
    ]);

    return {
      totalRevenue,
      totalDrivers,
      activeCampaigns,
      avgCampaignCost,
    };
  }

  async monthlyRevenueTrend() {
    const payments = await this.DbProvider.select({
      month: sql<string>`TO_CHAR(${paymentTable.createdAt}, 'Mon')`.as('month'),
      amount: sql<number>`COALESCE(SUM(${paymentTable.amount}), 0)`.as(
        'amount',
      ),
    })
      .from(paymentTable)
      .where(eq(paymentTable.paymentStatus, PaymentStatusType.SUCCESS))
      .groupBy(
        sql`TO_CHAR(${paymentTable.createdAt}, 'Mon')`,
        sql`EXTRACT(MONTH FROM ${paymentTable.createdAt})`,
      )
      .orderBy(sql`EXTRACT(MONTH FROM ${paymentTable.createdAt})`);

    return payments;
  }

  async getDriverActivityTrend() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trend = await this.DbProvider.select({
      month: sql`TO_CHAR(DATE_TRUNC('month', ${driverCampaignTable.createdAt}), 'Mon')`,
      activeCount: sql<number>`COUNT(*) FILTER (WHERE ${driverCampaignTable.active} = true)`,
      inactiveCount: sql<number>`COUNT(*) FILTER (WHERE ${driverCampaignTable.active} = false)`,
    })
      .from(driverCampaignTable)
      .where(gte(driverCampaignTable.createdAt, sixMonthsAgo))
      .groupBy(sql`DATE_TRUNC('month', ${driverCampaignTable.createdAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${driverCampaignTable.createdAt})`);

    return trend;
  }
}
