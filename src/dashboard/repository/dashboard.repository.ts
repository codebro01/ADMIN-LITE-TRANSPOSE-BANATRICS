import { Injectable, Inject } from '@nestjs/common';
import {
  businessOwnerTable,
  campaignTable,
  driverTable,
  paymentTable,
} from '@src/db';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, sql, and, sum, count, ne, gte } from 'drizzle-orm';
import { earningsTable } from '@src/db/earnings';

@Injectable()
export class HomeDashboardsRepository {
  constructor(
    @Inject('DB') private DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  async overviewDashboard() {
    const [
      [totalBalance],
      [totalAdvertisers],
      [totalDrivers],
      [activeCampaigns],
      [totalCampaigns],
      [pendingPayouts],
      [pendingKycs],
    ] = await Promise.all([
      this.DbProvider.select({
        total: sum(businessOwnerTable.balance),
      }).from(businessOwnerTable),
      this.DbProvider.select({
        total: count(),
      }).from(businessOwnerTable),
      this.DbProvider.select({
        total: count(),
      })
        .from(driverTable)
        .where(eq(driverTable.approvedStatus, true)),
      this.DbProvider.select({
        total: count(),
      })
        .from(campaignTable)
        .where(eq(campaignTable.statusType, 'active')),
      this.DbProvider.select({
        total: count(),
      })
        .from(campaignTable)
        .where(ne(campaignTable.statusType, 'draft')),
      this.DbProvider.select({
        total: sum(earningsTable.amount),
      })
        .from(earningsTable)
        .where(eq(earningsTable.approved, 'UNAPPROVED')),
      this.DbProvider.select({
        total: count(),
      })
        .from(driverTable)
        .where(eq(driverTable.approvedStatus, false)),
    ]);

    // ! works for selected year
    // async function getMonthlyRevenue(year: number) {
    //   const monthlyRevenue = await this.DbProvider.select({
    //     month: sql<string>`TO_CHAR(${paymentTable.createdAt}, 'YYYY-MM')`.as(
    //       'month',
    //     ),
    //     monthName:
    //       sql<string>`TO_CHAR(${paymentTable.createdAt}, 'Mon YYYY')`.as(
    //         'month_name',
    //       ),
    //     totalRevenue:
    //       sql<number>`CAST(SUM(${paymentTable.amount}) AS DECIMAL(10,2))`.as(
    //         'total_revenue',
    //       ),
    //     transactionCount: sql<number>`COUNT(*)`.as('transaction_count'),
    //     avgTransaction:
    //       sql<number>`CAST(AVG(${paymentTable.amount}) AS DECIMAL(10,2))`.as(
    //         'avg_transaction',
    //       ),
    //   })
    //     .from(paymentTable)
    //     .where(
    //       and(
    //         eq(paymentTable.paymentStatus, 'success'), // or 'completed' - whatever you use
    //         sql`EXTRACT(YEAR FROM ${paymentTable.createdAt}) = ${year}`,
    //       ),
    //     )
    //     .groupBy(sql`TO_CHAR(${paymentTable.createdAt}, 'YYYY-MM')`)
    //     .orderBy(sql`TO_CHAR(${paymentTable.createdAt}, 'YYYY-MM')`);

    //   return monthlyRevenue;
    // }

    const [last6months] = await this.getMonthlyRevenueLast6Months();
    const [sevenDays] = await this.get7DaysGrowth();
    const [sixMonths] = await this.get6MonthsGrowth();
    const [fiveYears] = await this.get5YearsGrowth();

    // console.log(last6months, sevenDays, sixMonths, fiveYears);

    return {
      totalBalance: String(Number(totalBalance.total).toFixed(2)),
      totalAdvertisers: String(totalAdvertisers.total),
      totalDrivers: String(totalDrivers.total),
      activeCampaigns: String(activeCampaigns.total),
      totalCampaigns: String(totalCampaigns.total),
      pendingPayouts: pendingPayouts.total,
      pendingKycs: String(pendingKycs.total),
      monthlyRevenue: last6months,
      campaignGrowth: {
        sevenDays,
        sixMonths,
        fiveYears,
      },
    };
  }

  async getMonthlyRevenueLast6Months() {
    const monthlyRevenue = await this.DbProvider.select({
      month:
        sql<string>`TO_CHAR(DATE_TRUNC('month', ${paymentTable.createdAt}), 'YYYY-MM')`.as(
          'month',
        ),
      monthName:
        sql<string>`TO_CHAR(DATE_TRUNC('month', ${paymentTable.createdAt}), 'Mon YYYY')`.as(
          'month_name',
        ),
      totalRevenue:
        sql<number>`CAST(SUM(${paymentTable.amount}) AS DECIMAL(10,2))`.as(
          'total_revenue',
        ),
      // transactionCount: sql<number>`COUNT(*)`.as('transaction_count'),
      // avgTransaction:
      //   sql<number>`CAST(AVG(${paymentTable.amount}) AS DECIMAL(10,2))`.as(
      //     'avg_transaction',
      //   ),
    })
      .from(paymentTable)
      .where(
        and(
          eq(paymentTable.paymentStatus, 'success'),
          sql`${paymentTable.createdAt} >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')`,
        ),
      )
      .groupBy(sql`DATE_TRUNC('month', ${paymentTable.createdAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${paymentTable.createdAt})`);

    return monthlyRevenue;
  }

  // 7 Days Growth - Daily breakdown (Day 1 to Day 7)
  async get7DaysGrowth() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return await this.DbProvider.select({
      date: sql<string>`TO_CHAR(DATE_TRUNC('day', ${campaignTable.createdAt}), 'Day DD')`,
      dayNumber: sql<number>`EXTRACT(DAY FROM DATE_TRUNC('day', ${campaignTable.createdAt}))`,
      totalCampaigns: sql<number>`count(*)`,
      // activeCampaigns: sql<number>`count(*) filter (where ${campaignTable.statusType} = 'active')`,
      // completedCampaigns: sql<number>`count(*) filter (where ${campaignTable.statusType} = 'completed')`,
      // pendingCampaigns: sql<number>`count(*) filter (where ${campaignTable.statusType} = 'pending')`,
      // totalSpent: sql<number>`coalesce(sum(${campaignTable.price}) filter (where ${campaignTable.paymentStatus} = 'spent'), 0)`,
    })
      .from(campaignTable)
      .where(
        and(
          gte(campaignTable.createdAt, sevenDaysAgo),
          sql`${campaignTable.statusType} != 'draft'`,
        ),
      )
      .groupBy(sql`DATE_TRUNC('day', ${campaignTable.createdAt})`)
      .orderBy(sql`DATE_TRUNC('day', ${campaignTable.createdAt}) ASC`);
  }

  // 6 Months Growth - Monthly breakdown (Jan, Feb, Mar, etc.)
  async get6MonthsGrowth() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return await this.DbProvider.select({
      month: sql<string>`TO_CHAR(DATE_TRUNC('month', ${campaignTable.createdAt}), 'Mon')`,
      year: sql<number>`EXTRACT(YEAR FROM DATE_TRUNC('month', ${campaignTable.createdAt}))`,
      totalCampaigns: sql<number>`count(*)`,
      // activeCampaigns: sql<number>`count(*) filter (where ${campaignTable.statusType} = 'active')`,
      // completedCampaigns: sql<number>`count(*) filter (where ${campaignTable.statusType} = 'completed')`,
      // pendingCampaigns: sql<number>`count(*) filter (where ${campaignTable.statusType} = 'pending')`,
      // totalSpent: sql<number>`coalesce(sum(${campaignTable.price}) filter (where ${campaignTable.paymentStatus} = 'spent'), 0)`,
    })
      .from(campaignTable)
      .where(
        and(
          gte(campaignTable.createdAt, sixMonthsAgo),
          sql`${campaignTable.statusType} != 'draft'`,
        ),
      )
      .groupBy(sql`DATE_TRUNC('month', ${campaignTable.createdAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${campaignTable.createdAt}) ASC`);
  }

  // 5 Years Growth - Yearly breakdown (2020, 2021, 2022, etc.)
  async get5YearsGrowth() {
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

    return await this.DbProvider.select({
      year: sql<number>`EXTRACT(YEAR FROM DATE_TRUNC('year', ${campaignTable.createdAt}))`,
      totalCampaigns: sql<number>`count(*)`,
      // activeCampaigns: sql<number>`count(*) filter (where ${campaignTable.statusType} = 'active')`,
      // completedCampaigns: sql<number>`count(*) filter (where ${campaignTable.statusType} = 'completed')`,
      // pendingCampaigns: sql<number>`count(*) filter (where ${campaignTable.statusType} = 'pending')`,
      // totalSpent: sql<number>`coalesce(sum(${campaignTable.price}) filter (where ${campaignTable.paymentStatus} = 'spent'), 0)`,
    })
      .from(campaignTable)
      .where(
        and(
          gte(campaignTable.createdAt, fiveYearsAgo),
          sql`${campaignTable.statusType} != 'draft'`,
        ),
      )
      .groupBy(sql`DATE_TRUNC('year', ${campaignTable.createdAt})`)
      .orderBy(sql`DATE_TRUNC('year', ${campaignTable.createdAt}) ASC`);
  }

  async get6MonthsEarnings() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return await this.DbProvider.select({
      month: sql<string>`TO_CHAR(DATE_TRUNC('month', ${earningsTable.dateInitiated}), 'Mon')`,
      year: sql<number>`EXTRACT(YEAR FROM DATE_TRUNC('month', ${earningsTable.dateInitiated}))`,
      totalPaidOut: sql<number>`coalesce(sum(${earningsTable.amount}) filter (where ${earningsTable.paymentStatus} = 'PAID'), 0)`,
      // totalUnpaid: sql<number>`coalesce(sum(${earningsTable.amount}) filter (where ${earningsTable.paymentStatus} = 'UNPAID'), 0)`,
      // totalApproved: sql<number>`coalesce(sum(${earningsTable.amount}) filter (where ${earningsTable.approved} = 'APPROVED'), 0)`,
      // totalRejected: sql<number>`coalesce(sum(${earningsTable.amount}) filter (where ${earningsTable.approved} = 'REJECTED'), 0)`,
      // paymentCount: sql<number>`count(*) filter (where ${earningsTable.paymentStatus} = 'PAID')`,
    })
      .from(earningsTable)
      .where(gte(earningsTable.dateInitiated, sixMonthsAgo))
      .groupBy(sql`DATE_TRUNC('month', ${earningsTable.dateInitiated})`)
      .orderBy(sql`DATE_TRUNC('month', ${earningsTable.dateInitiated}) ASC`);
  }
}
