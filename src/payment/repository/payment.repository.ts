import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreatePaymentDto } from '@src/payment/dto/createPaymentDto';
import {
  businessOwnerTable,
  campaignTable,
  driverTable,
  paymentTable,
  userTable,
} from '@src/db';
import crypto from 'crypto';
import { eq, and, sql, gte, lt } from 'drizzle-orm';
import { CampaignRepository } from '@src/campaign/repository/campaign.repository';
import { CatchErrorService } from '@src/catch-error/catch-error.service';
import {
  CategoryType,
  StatusType,
  VariantType,
} from '@src/notification/dto/createNotificationDto';
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

  async savePayment(
    data: CreatePaymentDto & {
      paymentMethod: string;
      paymentStatus: PaymentStatusType;
      reference: string;
      transactionType: string;
    },
    userId: string,
    trx?: typeof this.DbProvider,
  ) {
    const DbTrx = trx || this.DbProvider;
    const [payment] = await DbTrx.insert(paymentTable)
      .values({ userId, ...data })
      .returning();

    if (!payment)
      throw new InternalServerErrorException(
        'An error occured, saving payment',
      );

    return { message: 'success', data: payment };
  }
  async updatePaymentStatus(
    data: {
      reference: string;
      status: PaymentStatusType;
    },
    userId: string,
    trx?: typeof this.DbProvider,
  ) {
    const DbTrx = trx || this.DbProvider;
    const { reference, status } = data;
    const [payment] = await DbTrx.update(paymentTable)
      .set({ paymentStatus: status })
      .where(
        and(
          eq(paymentTable.reference, reference),
          eq(paymentTable.userId, userId),
        ),
      )
      .returning();

    if (!payment)
      throw new InternalServerErrorException(
        'An error occured, saving payment',
      );

    return { message: 'success', data: payment };
  }
  async updateBalance(
    data: {
      amount: number;
    },
    userId: string,
    trx?: any,
  ) {
    const DbTrx = trx || this.DbProvider;

    const { amount } = data;
    const [payment] = await DbTrx.update(businessOwnerTable)
      .set({ balance: sql`${businessOwnerTable.balance} + ${amount}` })
      .where(and(eq(businessOwnerTable.userId, userId)))
      .returning();

    if (!payment)
      throw new InternalServerErrorException(
        'An error occured, updating payment',
      );

    return { message: 'success', data: payment };
  }

  async getPayments(userId: string) {
    const payments = await this.DbProvider.select()
      .from(userTable)
      .where(eq(userTable.id, userId));

    if (!payments) {
      throw new InternalServerErrorException(
        'An error occured fetching payments',
      );
    }

    return { message: 'succcess', payments };
  }

  async getBalance(userId: string) {
    try {
      const [balance] = await this.DbProvider.select({
        balance: businessOwnerTable.balance,
      })
        .from(businessOwnerTable)
        .where(eq(businessOwnerTable.userId, userId));
      return balance;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async moveMoneyFromBalanceToPending(
    data: {
      campaignId: string;
    },
    userId: string,
  ) {
    try {
      const { campaignId } = data;
      // console.log(campaignId, amount);

      // ! Perform money move transactions
      const Trx = await this.executeInTransaction(async (trx) => {
        // ! get campaign amount from db

        const [getAmount] = await trx
          .select({ amount: campaignTable.price })
          .from(campaignTable)
          .where(
            and(
              eq(campaignTable.userId, userId),
              eq(campaignTable.id, campaignId),
            ),
          );

        const amount = getAmount.amount;

        // ! check balanace before performing performing money move trx to prevent negative value on balance

        const [businessOwner] = await trx
          .select({
            balance: businessOwnerTable.balance,
          })
          .from(businessOwnerTable)
          .where(eq(businessOwnerTable.userId, userId));

        if (!businessOwner) {
          throw new NotFoundException('Business owner not found');
        }

        if (Number(businessOwner.balance) < amount) {
          throw new BadRequestException(
            `Insufficient balance. Available: ${businessOwner.balance.toFixed(2)}, Required: ${amount}`,
          );
        }

        await trx
          .update(businessOwnerTable)
          .set({
            balance: sql`${businessOwnerTable.balance} - ${amount}`,
            pending: sql`${businessOwnerTable.pending} + ${amount}`,
          })
          .where(eq(businessOwnerTable.userId, userId));

        const updateCampaignResult = await trx
          .update(campaignTable)
          .set({ paymentStatus: 'pending' })
          .where(
            and(
              eq(campaignTable.id, campaignId),
              eq(campaignTable.userId, userId),
              eq(campaignTable.statusType, 'pending'),
            ),
          )
          .returning();

        if (updateCampaignResult.length === 0) {
          throw new Error(
            'Campaign not found or not in pending status. Only campaigns with status "pending" can be paid for.',
          );
        }

        const [currentData] = await trx
          .select({
            balance: businessOwnerTable.balance,
            pending: businessOwnerTable.pending,
          })
          .from(businessOwnerTable)
          .where(eq(businessOwnerTable.userId, userId));

        return {
          currentData: {
            balance: currentData?.balance.toFixed(2),
            pending: currentData?.pending.toFixed(2),
          },
          updateCampaignResult,
        };
      });
      // console.log(
      //   'updateCampaignResult',
      //   Trx.updateCampaignResult,
      //   Trx.currentData,
      // );
      if (
        !Trx.currentData ||
        !Trx.currentData.pending ||
        !Trx.currentData.balance
      )
        throw new InternalServerErrorException(
          'An error occured fetching current payment data, please try again',
        );
      return {
        currentBalance: Trx.currentData.balance,
        currentPending: Trx.currentData.pending,
      };
    } catch (error) {
      // console.log(error);
      throw new Error(error);
    }
  }
  async moveMoneyFromPendingToTotalAmountSpent(
    data: {
      campaignId: string;
    },
    userId: string,
  ) {
    try {
      const { campaignId } = data;

      const Trx = await this.executeInTransaction(async (trx) => {
        const [getAmount] = await trx
          .select({ amount: campaignTable.price })
          .from(campaignTable)
          .where(
            and(
              eq(campaignTable.userId, userId),
              eq(campaignTable.id, campaignId),
            ),
          );

        const amount = getAmount.amount;

        const [businessOwner] = await trx
          .select({
            balance: businessOwnerTable.pending,
          })
          .from(businessOwnerTable)
          .where(eq(businessOwnerTable.userId, userId));

        if (!businessOwner) {
          throw new NotFoundException('Business owner not found');
        }

        if (Number(businessOwner.pending) < amount) {
          throw new BadRequestException(
            `Insufficient pending balance. Available: ${businessOwner.pending.toFixed(2)}, Required: ${amount}`,
          );
        }

        await trx
          .update(businessOwnerTable)
          .set({
            pending: sql`${businessOwnerTable.pending} - ${amount}`,
            // moneySpent: sql`${businessOwnerTable.moneySpent} + ${amount}`,
          })
          .where(eq(businessOwnerTable.userId, userId));

        const updateCampaignResult = await trx
          .update(campaignTable)
          .set({
            paymentStatus: 'spent',
            statusType: 'completed',
            spentAt: new Date(),
          })
          .where(
            and(
              eq(campaignTable.id, campaignId),
              eq(campaignTable.userId, userId),
              eq(campaignTable.statusType, 'pending'),
              eq(campaignTable.paymentStatus, 'pending'),
            ),
          )
          .returning();

        await this.notificationRepository.createNotification(
          {
            title: `Campaign charge`,
            message: `${amount} has been successfully dedecuted to settle the campaign charge`,
            variant: VariantType.SUCCESS,
            category: CategoryType.CAMPAIGN,
            priority: '',
            status: StatusType.UNREAD,
          },
          userId,
          trx,
        );

        // console.log('updateCampaignResult', updateCampaignResult);

        if (updateCampaignResult.length === 0) {
          throw new Error(
            'Campaign not found or not in pending status. Only campaigns with status "pending" can be paid for.',
          );
        }

        const [currentData] = await trx
          .select({
            pending: businessOwnerTable.pending,
            balance: businessOwnerTable.balance,
          })
          .from(businessOwnerTable)
          .where(eq(businessOwnerTable.userId, userId));

        return { currentData };
      });
      // console.log('currentData', Trx.currentData);
      if (
        !Trx.currentData ||
        !Trx.currentData.pending ||
        !Trx.currentData.balance
      )
        throw new InternalServerErrorException(
          'An error occured fetching current payment data, please try again',
        );

      return {
        currentBalance: Trx.currentData.balance.toFixed(2),
        currentPending: Trx.currentData.pending.toFixed(2),
      };
    } catch (error) {
      // console.log(error);
      throw new Error(error);
    }
  }

  async findByReference(reference: string) {
    const [payment] = await this.DbProvider.select()
      .from(paymentTable)
      .where(eq(paymentTable.reference, reference))
      .limit(1);

    return payment;
  }

  async listTransactions(userId: string) {
    try {
      const transactions = await this.DbProvider.select({
        invoiceId: paymentTable.invoiceId,
        amount: paymentTable.amount,
        paymentMethod: paymentTable.paymentMethod,
        status: paymentTable.paymentStatus,
      })
        .from(paymentTable)
        .where(eq(paymentTable.userId, userId));
      // if(!transactions) throw new NotFoundException('Transactions could not be fetched')
      return transactions;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async paymentDashboard(userId: string) {
    try {
      const allTimeDashboardData = await this.DbProvider.select({
        balance: businessOwnerTable.balance,
        pending: businessOwnerTable.pending,
      })
        .from(businessOwnerTable)
        .where(eq(businessOwnerTable.userId, userId));

      // ! get monthly spendings

      const year = new Date().getFullYear();
      const month = new Date().getMonth();

      const startOfMonth = new Date(year, month, 1); // month is 0-indexed
      const startOfNextMonth = new Date(year, month + 1, 1);

      const getTotalSpent = await this.DbProvider.select({
        totalSpent: sql<number>`SUM(${campaignTable.price})`,
      })
        .from(campaignTable)
        .where(
          and(
            eq(campaignTable.userId, userId),
            eq(campaignTable.paymentStatus, 'spent'),
          ),
        );

      const totalSpent = getTotalSpent[0]?.totalSpent || 0;

      const getTotalSpentThisMonth = await this.DbProvider.select({
        totalSpent: sql<number>`SUM(${campaignTable.price})`,
      })
        .from(campaignTable)
        .where(
          and(
            eq(campaignTable.userId, userId),
            eq(campaignTable.paymentStatus, 'spent'),
            gte(campaignTable.spentAt, startOfMonth),
            lt(campaignTable.spentAt, startOfNextMonth),
          ),
        );

      const totalSpentThisMonth = getTotalSpentThisMonth[0]?.totalSpent || 0;

      return {
        ...allTimeDashboardData[0],
        totalSpentThisMonth,
        totalSpent,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async listAllWithdrawals() {
    const withdrawals = await this.DbProvider.select({
      userId: earningsTable.userId,
      firstname: driverTable.firstname,
      lastname: driverTable.lastname,
      campaign: campaignTable.campaignName,
      amount: earningsTable.amount,
      proofStatus: earningsTable.paymentStatus,
      date: earningsTable.createdAt,
    })
      .from(earningsTable)
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
      .groupBy(sql`DATE(${earningsTable.createdAt})`)
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
