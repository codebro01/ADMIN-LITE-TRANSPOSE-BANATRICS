import { Inject, Injectable } from '@nestjs/common';
import {
  businessOwnerTable,
  campaignTable,
  invoicesInsertType,
  invoicesTable,
  paymentTable,
} from '@src/db';
import { InvoiceStatusType } from '@src/invoices/dto/create-invoice.dto';
import { PaymentStatusType } from '@src/payment/dto/paystackMetadataDto';
import { and, count, eq, sum } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class InvoicesRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}
  async create(data: invoicesInsertType) {
    const invoice = await this.DbProvider.insert(invoicesTable)
      .values(data)
      .returning();

    return invoice;
  }

  async getInvoiceDashboardCards() {
    const [[totalRevenue], [paidInvoices], [pending]] = await Promise.all([
      this.DbProvider.select({ total: sum(paymentTable.amount) })
        .from(paymentTable)
        .where(eq(paymentTable.paymentStatus, PaymentStatusType.SUCCESS)),
      this.DbProvider.select({ total: count() })
        .from(invoicesTable)
        .where(eq(invoicesTable.status, InvoiceStatusType.SUCCESS)),
      this.DbProvider.select({
        total: sum(invoicesTable.amount),
      })
        .from(invoicesTable)
        .where(eq(invoicesTable.status, InvoiceStatusType.PENDING)),
    ]);

    return {
      totalRevenue,
      paidInvoices,
      pending,
    };
  }

  async listInvoicesWithTheirInfos() {
    const invoices = await this.DbProvider.select({
      invoiceId: invoicesTable.invoiceId,
      advertiser: businessOwnerTable.businessName,
      campaign: campaignTable.campaignName,
      amount: invoicesTable.amount,
      date: invoicesTable.createdAt,
      dueDate: invoicesTable.dueDate,
      status: invoicesTable.status,
    })
      .from(invoicesTable)
      .groupBy(
        invoicesTable.invoiceId,
        campaignTable.campaignName,
        businessOwnerTable.businessName,
        invoicesTable.amount,
        invoicesTable.createdAt,
        invoicesTable.dueDate,
        invoicesTable.status,
      )
      .leftJoin(campaignTable, eq(campaignTable.id, invoicesTable.campaignId))
      .leftJoin(
        businessOwnerTable,
        eq(businessOwnerTable.userId, invoicesTable.userId),
      );

    return invoices;
  }


  async getInvoice(campaignId: string, userId: string, trx?:any) {
    const Trx = trx || this.DbProvider
    const invoice = await Trx.select()
      .from(invoicesTable)
      .where(
        and(
          eq(invoicesTable.userId, userId),
          eq(invoicesTable.campaignId, campaignId),
        ),
      );

    return invoice;
  }
  async updateInvoiceStatus(status: InvoiceStatusType, campaignId: string, userId: string, trx?:any) {
    const Trx = trx || this.DbProvider
    const invoice = await Trx.update(invoicesTable)
      .set({
        status
      })
      .where(
        and(
          eq(invoicesTable.userId, userId),
          eq(invoicesTable.campaignId, campaignId),
        ),
      );

    return invoice;
  }
}
