import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
export enum InvoiceStatusType {
  SUCCESS = 'success',
  PENDING = 'pending',
  OVERDUE = 'overdue',
  FAILED = 'failed',
}

export class CreateInvoiceDto {
  @ApiProperty({
    description: 'Campaign ID associated with the invoice',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  campaignId: string;

  @ApiProperty({
    description: 'Driver/User ID associated with the invoice',
    example: '123e4567-e89b-12d3-a456-426614174001',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Invoice amount',
    example: 15000.5,
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0, { message: 'Amount must be greater than or equal to 0' })
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional({
    description: 'Invoice status',
    enum: InvoiceStatusType,
    default: InvoiceStatusType.PENDING,
    example: InvoiceStatusType.PENDING,
  })
  @IsOptional()
  @IsEnum(InvoiceStatusType, {
    message: 'Status must be one of: PENDING, PAID, OVERDUE, CANCELLED',
  })
  status?: InvoiceStatusType;

  @ApiPropertyOptional({
    description: 'Invoice due date',
    example: '2026-02-15T00:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({
    description: 'Invoice date',
    example: '2026-01-08T00:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  date: string;
}