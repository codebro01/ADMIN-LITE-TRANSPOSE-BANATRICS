import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
      'Retrieves all transactions from Paystack API. Returns a comprehensive list of all payment transactions across the platform.',
  })
  async listTransactions() {
    const result = await this.paymentService.listAllTransactions();
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
  @Get('payments')
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
  @Get('payments')
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Provides graph data for total income',
    description: 'Provides graph data for total income',
  })
  async totalIncomGraph(@Query() query: GraphQueryDto) {
    const result = await this.paymentService.totalIncomGraph(query);
    return result;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('payments')
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Provides graph data for total driver payouts',
    description: 'Provides graph data for total driver payouts',
  })
  async totalDriverPayouts(@Query() query: GraphQueryDto) {
    const result = await this.paymentService.totalDriverPayouts(query);
    return result;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('payments')
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Provides graph data for net profit',
    description: 'Provides graph data for net profit',
  })
  async netProfit(@Query() query: GraphQueryDto) {
    const result = await this.paymentService.netProfit(query);
    return result;
  }
}
