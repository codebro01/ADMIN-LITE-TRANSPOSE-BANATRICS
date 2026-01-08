import { ApiProperty } from '@nestjs/swagger';
import {

  IsOptional, 
  IsNumber, 
  Min,
  IsEnum,
  IsUUID,
} from 'class-validator';

import { Type } from 'class-transformer';
import { WeeklyProofStatus } from '@src/weekly-proofs/dto/create-weekly-proof.dto';


// export enum userStatusType {
//     ACTIVE = 'active', 
//     PENDING = 'pending', 
//     SUSPENDED='suspended'
// }

export enum userEnumType {
    DRIVERS = 'drivers', 
    BUSINESSOWNERS = 'businessOwners', 
}

export enum WeekQueryType  {
    CURRENT_WEEK = 'current_week', 
    LAST_WEEK = 'last_week', 
    TWO_WEEKS_AGO = 'two_weeks'
}

export class QueryWeeklyProofDto {
  @ApiProperty({
    description: 'Query weekly proof by campaign',
    example: '537a3daf-4c50-48ba-bcfe-5f39d2b444de',
  })
  @IsOptional()
  @IsUUID()
  campaignId?: string;

  @ApiProperty({
    description: 'The status of the weekly proof you want to query',
    example: 'pending',
  })
  @IsOptional()
  @IsEnum(WeeklyProofStatus)
  status?: WeeklyProofStatus;

  @ApiProperty({
    example: 'current_week',
    description: 'Week query type', 
    required: false, 
  })
  @IsOptional()
  @IsEnum(WeekQueryType)
  week?: WeekQueryType;

  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
