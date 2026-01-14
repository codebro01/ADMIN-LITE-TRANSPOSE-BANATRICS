import { Injectable } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoicesRepository } from '@src/invoices/repository/invoices.repository';

@Injectable()
export class InvoicesService {
  constructor(private readonly invoiceRepository: InvoicesRepository) {}
  async create(data: CreateInvoiceDto) {

    const invoice_id = 'inv-id';
    return await this.invoiceRepository.create({
      ...data,
      invoiceId: invoice_id, 
      date: new Date(data.date),
      dueDate: new Date(data.dueDate),
    });
  }

  async getInvoiceDashboardCards() {
    return await this.invoiceRepository.getInvoiceDashboardCards();
  }
  async listInvoicesWithTheirInfos() {
    return await this.invoiceRepository.listInvoicesWithTheirInfos();
  }
}
