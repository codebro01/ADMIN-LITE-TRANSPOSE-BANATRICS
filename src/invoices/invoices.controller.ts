import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Create an invoice',
    description: 'Enpoint creates an invoice',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createInvoiceDto: CreateInvoiceDto) {
    const invoice  = await this.invoicesService.create(createInvoiceDto);

     return {
       success: true,
       data: invoice,
     };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('cards')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Get the invoice dashbaord cards info',
    description:
      'Get invoice dashboard cards such as total revenue, paid invoices, etc',
  })
  @HttpCode(HttpStatus.OK)
  async getInvoiceDashboardCards() {
    const cards = await this.invoicesService.getInvoiceDashboardCards();

    return {
      success: true, 
      data: cards, 
    }
  }


  @Roles('admin')
  @Get()
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'List  invoices',
    description:
      'List all existing  invoices alongside their information',
  })
  @HttpCode(HttpStatus.OK)
 async listInvoicesWithTheirInfos() {
    const invoices = await this.invoicesService.listInvoicesWithTheirInfos();
     return {
       success: true,
       data: invoices,
     };
  }
}
