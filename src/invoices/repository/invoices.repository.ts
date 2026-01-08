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
import { count, eq, sum } from 'drizzle-orm';
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
      .groupBy(invoicesTable.invoiceId, campaignTable.campaignName)
      .leftJoin(campaignTable, eq(campaignTable.id, invoicesTable.campaignId))
      .leftJoin(
        businessOwnerTable,
        eq(businessOwnerTable.userId, invoicesTable.userId),
      );

      return invoices
  }
}
