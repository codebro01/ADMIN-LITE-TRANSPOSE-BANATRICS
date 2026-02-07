import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  businessOwnerTable,
  campaignTable,
  driverTable,
  paymentTable,
} from '@src/db';
import crypto from 'crypto';
import { eq, and, sql, gte } from 'drizzle-orm';
import { CampaignRepository } from '@src/campaign/repository/campaign.repository';
import { CatchErrorService } from '@src/catch-error/catch-error.service';
import { NotificationRepository } from '@src/notification/repository/notification.repository';
import { PaymentStatusType } from '@src/payment/dto/paystackMetadataDto';
import { earningsTable } from '@src/db/earnings';

export const generateSecureInvoiceId = () => {
  const randomHex = crypto.randomUUID().substring(0, 8);
  return `INV-${randomHex}`;
};
export const generateSecureRef = () => {
  const randomAlphanumeric = crypto
    .randomUUID()
    .replace(/-/g, '')
    .substring(0, 8)
    .toUpperCase();
  return `BNT-${Date.now()}-${randomAlphanumeric}`;
};

@Injectable()
export class PaymentRepository {
  constructor(
    @Inject('DB') private DbProvider: NodePgDatabase<typeof import('@src/db')>,
    private campaignRepository: CampaignRepository,
    private catchErrorService: CatchErrorService,
    private notificationRepository: NotificationRepository,
  ) {}

  // ! Transaction wrapper
  async executeInTransaction<T>(
    callback: (trx: any) => Promise<T>,
  ): Promise<T> {
    return await this.DbProvider.transaction(async (trx) => {
      return await callback(trx);
    });
  }



  async listAllWithdrawals() {
    const withdrawals = await this.DbProvider.select({
      id: earningsTable.id,
      userId: earningsTable.userId,
      campaignId: earningsTable.campaignId,
      firstname: driverTable.firstname,
      lastname: driverTable.lastname,
      campaign: campaignTable.campaignName,
      amount: earningsTable.amount,
      proofStatus: earningsTable.paymentStatus,
      date: earningsTable.createdAt,
    })
      .from(earningsTable)
      .where(eq(earningsTable.approved, 'UNAPPROVED'))
      .leftJoin(driverTable, eq(driverTable.userId, earningsTable.userId))
      .leftJoin(campaignTable, eq(campaignTable.id, earningsTable.campaignId));

    return withdrawals;
  }

  async listAllPayments() {
    const payments = await this.DbProvider.select({
      advertiser: businessOwnerTable.businessName,
      amount: paymentTable.amount,
      date: paymentTable.createdAt,
      method: paymentTable.paymentMethod,
      invoiceId: paymentTable.invoiceId,
    })
      .from(paymentTable)
      .where(eq(paymentTable.paymentStatus, PaymentStatusType.SUCCESS))
      .leftJoin(
        businessOwnerTable,
        eq(businessOwnerTable.userId, paymentTable.userId),
      );
    return payments;
  }

  async totalMonthlyIncomeGraph() {
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

  async totalWeeklyIncomeGraph() {
    const payments = await this.DbProvider.select({
      day: sql<string>`TO_CHAR(${paymentTable.createdAt}, 'Dy')`.as('day'),
      date: sql<string>`TO_CHAR(${paymentTable.createdAt}, 'YYYY-MM-DD')`.as(
        'date',
      ),
      amount: sql<number>`COALESCE(SUM(${paymentTable.amount}), 0)`.as(
        'amount',
      ),
    })
      .from(paymentTable)
      .where(
        and(
          eq(paymentTable.paymentStatus, PaymentStatusType.SUCCESS),
          gte(paymentTable.createdAt, sql`NOW() - INTERVAL '7 days'`),
        ),
      )
      .groupBy(
        sql`TO_CHAR(${paymentTable.createdAt}, 'Dy')`,
        sql`TO_CHAR(${paymentTable.createdAt}, 'YYYY-MM-DD')`,
      )
      .orderBy(sql`TO_CHAR(${paymentTable.createdAt}, 'YYYY-MM-DD')`);

    return payments;
  }

  async totalYearlyIncomeGraph() {
    const payments = await this.DbProvider.select({
      year: sql<number>`EXTRACT(YEAR FROM ${paymentTable.createdAt})`.as(
        'year',
      ),
      amount: sql<number>`COALESCE(SUM(${paymentTable.amount}), 0)`.as(
        'amount',
      ),
    })
      .from(paymentTable)
      .where(eq(paymentTable.paymentStatus, PaymentStatusType.SUCCESS))
      .groupBy(sql`EXTRACT(YEAR FROM ${paymentTable.createdAt})`)
      .orderBy(sql`EXTRACT(YEAR FROM ${paymentTable.createdAt})`);

    return payments;
  }

  async totalDriverPayoutsWeekly() {
    const payouts = await this.DbProvider.select({
      day: sql<string>`TO_CHAR(${earningsTable.createdAt}, 'Dy')`.as('day'), // Mon, Tue, Wed, etc.
      date: sql<string>`DATE(${earningsTable.createdAt})`.as('date'),
      amount: sql<number>`COALESCE(SUM(${earningsTable.amount}), 0)`.as(
        'amount',
      ),
    })
      .from(earningsTable)
      .where(
        and(
          eq(earningsTable.approved, 'APPROVED'),
          eq(earningsTable.paymentStatus, PaymentStatusType.SUCCESS),
          gte(earningsTable.createdAt, sql`CURRENT_DATE - INTERVAL '6 days'`),
        ),
      )
      .groupBy(
        sql`DATE(${earningsTable.createdAt})`,
        sql`TO_CHAR(${earningsTable.createdAt}, 'Dy')`,
      )
      .orderBy(sql`DATE(${earningsTable.createdAt})`);

    return payouts;
  }

  async totalDriverPayoutsMonthly() {
    const payouts = await this.DbProvider.select({
      month: sql<string>`TO_CHAR(${earningsTable.createdAt}, 'Mon')`.as(
        'month',
      ),
      amount: sql<number>`COALESCE(SUM(${earningsTable.amount}), 0)`.as(
        'amount',
      ),
    })
      .from(earningsTable)
      .where(
        and(
          eq(earningsTable.approved, 'APPROVED'),
          eq(earningsTable.paymentStatus, PaymentStatusType.SUCCESS),
        ),
      )
      .groupBy(
        sql`TO_CHAR(${earningsTable.createdAt}, 'Mon')`,
        sql`EXTRACT(MONTH FROM ${earningsTable.createdAt})`,
      )
      .orderBy(sql`EXTRACT(MONTH FROM ${earningsTable.createdAt})`);
    return payouts;
  }

  async totalDriverPayoutsYearly() {
    const payouts = await this.DbProvider.select({
      year: sql<number>`EXTRACT(YEAR FROM ${earningsTable.createdAt})`.as(
        'year',
      ),
      amount: sql<number>`COALESCE(SUM(${earningsTable.amount}), 0)`.as(
        'amount',
      ),
    })
      .from(earningsTable)
      .where(
        and(
          eq(earningsTable.approved, 'APPROVED'),
          eq(earningsTable.paymentStatus, PaymentStatusType.SUCCESS),
        ),
      )
      .groupBy(sql`EXTRACT(YEAR FROM ${earningsTable.createdAt})`)
      .orderBy(sql`EXTRACT(YEAR FROM ${earningsTable.createdAt})`);

    return payouts;
  }

  // 7 Days - Simpler version
  async netProfitWeekly() {
    const netProfit = await this.DbProvider.execute(sql`
    WITH income AS (
      SELECT 
        DATE(created_at) as date,
        TO_CHAR(created_at, 'Dy') as day,
        SUM(amount) as total_income
      FROM ${paymentTable}
      WHERE payment_status = ${PaymentStatusType.SUCCESS}
        AND created_at >= CURRENT_DATE - INTERVAL '6 days'
      GROUP BY DATE(created_at), TO_CHAR(created_at, 'Dy')
    ),
    expenses AS (
      SELECT 
        DATE(created_at) as date,
        SUM(amount) as total_expenses
      FROM ${earningsTable}
      WHERE approved = 'APPROVED'
        AND payment_status = 'PAID'
        AND created_at >= CURRENT_DATE - INTERVAL '6 days'
      GROUP BY DATE(created_at)
    )
    SELECT 
      COALESCE(i.day, TO_CHAR(e.date, 'Dy')) as day,
      COALESCE(i.date, e.date)::text as date,
      COALESCE(i.total_income, 0) as income,
      COALESCE(e.total_expenses, 0) as expenses,
      COALESCE(i.total_income, 0) - COALESCE(e.total_expenses, 0) as net_profit
    FROM income i
    FULL OUTER JOIN expenses e ON i.date = e.date
    ORDER BY COALESCE(i.date, e.date)
  `);

    return netProfit.rows;
  }

  // Monthly
  async netProfitMonthly() {
    const netProfit = await this.DbProvider.execute(sql`
    WITH income AS (
      SELECT 
        EXTRACT(MONTH FROM created_at) as month_num,
        TO_CHAR(created_at, 'Mon') as month,
        SUM(amount) as total_income
      FROM ${paymentTable}
      WHERE payment_status = ${PaymentStatusType.SUCCESS}
        AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY EXTRACT(MONTH FROM created_at), TO_CHAR(created_at, 'Mon')
    ),
    expenses AS (
      SELECT 
        EXTRACT(MONTH FROM created_at) as month_num,
        SUM(amount) as total_expenses
      FROM ${earningsTable}
      WHERE approved = 'APPROVED'
        AND payment_status = 'PAID'
        AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY EXTRACT(MONTH FROM created_at)
    )
    SELECT 
      i.month,
      COALESCE(i.total_income, 0) as income,
      COALESCE(e.total_expenses, 0) as expenses,
      COALESCE(i.total_income, 0) - COALESCE(e.total_expenses, 0) as net_profit
    FROM income i
    LEFT JOIN expenses e ON i.month_num = e.month_num
    ORDER BY i.month_num
  `);

    return netProfit.rows;
  }

  // Yearly
  async netProfitYearly() {
    const netProfit = await this.DbProvider.execute(sql`
    WITH income AS (
      SELECT 
        EXTRACT(YEAR FROM created_at) as year,
        SUM(amount) as total_income
      FROM ${paymentTable}
      WHERE payment_status = ${PaymentStatusType.SUCCESS}
      GROUP BY EXTRACT(YEAR FROM created_at)
    ),
    expenses AS (
      SELECT 
        EXTRACT(YEAR FROM created_at) as year,
        SUM(amount) as total_expenses
      FROM ${earningsTable}
      WHERE approved = 'APPROVED'
        AND payment_status = 'PAID'
      GROUP BY EXTRACT(YEAR FROM created_at)
    )
    SELECT 
      COALESCE(i.year, e.year) as year,
      COALESCE(i.total_income, 0) as income,
      COALESCE(e.total_expenses, 0) as expenses,
      COALESCE(i.total_income, 0) - COALESCE(e.total_expenses, 0) as net_profit
    FROM income i
    FULL OUTER JOIN expenses e ON i.year = e.year
    ORDER BY COALESCE(i.year, e.year)
  `);

    return netProfit.rows;
  }
}
