import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from '@src/payment/payment.service';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { PaymentRepository } from '@src/payment/repository/payment.repository';

import { NotificationService } from '@src/notification/notification.service';

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
  @Get('list-all-transactions')
  @ApiOperation({
    summary: 'List all transactions from Paystack',
    description:
      'Retrieves all transactions from Paystack API. Returns a comprehensive list of all payment transactions across the platform.',
  })
  async listTransactions() {
    const result = await this.paymentService.listAllTransactions();
    return result;
  }

  
}
