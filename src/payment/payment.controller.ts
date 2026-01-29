import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { PaymentService } from '@src/payment/payment.service';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { PaymentRepository } from '@src/payment/repository/payment.repository';

import { NotificationService } from '@src/notification/notification.service';
import { GraphQueryDto } from '@src/payment/dto/graph-query.dto';
import { InitializePayoutDto } from '@src/payment/dto/initialize-payout.dto';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly paymentRepository: PaymentRepository,
    private readonly notificationService: NotificationService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('transactions')
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all transactions from Paystack',
    description:
      'This enpoint is used to approve or reject a driver withdrawal request',
  })
  async listTransactions() {
    const result = await this.paymentService.listAllTransactions();
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':userId/earnings/:earningId/campaigns/:campaignId/approval')
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approves or reject an approval',
    description:
      'Retrieves all transactions from Paystack API. Returns a comprehensive list of all payment transactions across the platform.',
  })
  async approveWithdrawal(
    @Body() body: InitializePayoutDto,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('earningId', ParseUUIDPipe) earningId: string,
    @Param('campaignId', ParseUUIDPipe) campaignId: string,
  ) {
    const result = await this.paymentService.initializePayout(
      body,
      earningId,
      campaignId,
      userId,
    );
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('unapproved-withdrawals')
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all withdrawals',
    description: 'List all pendinging withdrawals by drivers',
  })
  async listAllWithdrawals() {
    const result = await this.paymentService.listAllWithdrawals();
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all payments irrespective of status',
    description: 'List all existing payments',
  })
  async listAllPayments() {
    const result = await this.paymentService.listAllPayments();
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('income')
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Provides graph data for total income',
    description: 'Provides graph data for total income',
  })
  async totalIncomGraph(@Query() query: GraphQueryDto) {
    const result = await this.paymentService.totalIncomGraph(query);
    return { success: true, data: result };
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('payouts')
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Provides graph data for total driver payouts',
    description: 'Provides graph data for total driver payouts',
  })
  async totalDriverPayouts(@Query() query: GraphQueryDto) {
    const result = await this.paymentService.totalDriverPayouts(query);
    return {success: true, data: result}
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('net-profit')
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Provides graph data for net profit',
    description: 'Provides graph data for net profit',
  })
  async netProfit(@Query() query: GraphQueryDto) {
    const result = await this.paymentService.netProfit(query);
    return {success: true, data: result}
  }
}
