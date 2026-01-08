import { ApiProperty } from "@nestjs/swagger";
import {IsString, IsNotEmpty} from 'class-validator';


export enum PaymentStatusType {
  SUCCESS = 'success',
  REVERSED = 'reversed',
  FAILED = 'failed', 
  PENDING = 'pending',
  CANCELLED = 'cancelled', 
}
export enum PaymentMethodType {
    CARD = 'card', 
    TRANSFER = 'transfer'
}

export class PaystackMetedataDto {
  @ApiProperty({
    example: 'Advertisement of Cocoa Export',
    description: 'Insert campaign name or title here',
  })
  @IsString()
  @IsNotEmpty()
  campaignId: string;
}