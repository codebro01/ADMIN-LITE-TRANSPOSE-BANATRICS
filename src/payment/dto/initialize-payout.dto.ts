// dto/initialize-payment.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsBoolean } from 'class-validator';

export class InitializePayoutDto {
  @ApiPropertyOptional({
    description: 'This is the reason for the transfer',
    example: 'Earning for campaign Big Cola Africa',
    maxLength: 200,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Reason must be a string' })
  @MaxLength(200, { message: 'Reference cannot exceed 200 characters' })
  reason: string;

  @ApiPropertyOptional({
    description: 'This is the reason for the transfer',
    example: 'Earning for campaign Big Cola Africa',
    maxLength: 200,
    type: String,
  })
  @IsBoolean()
  approve: boolean;
}
