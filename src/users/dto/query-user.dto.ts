import { ApiProperty } from '@nestjs/swagger';
import {

  IsOptional, 
  IsNumber, 
  Min,
  IsEnum,
  IsBoolean,
} from 'class-validator';

import { Type } from 'class-transformer';


// export enum userStatusType {
//     ACTIVE = 'active', 
//     PENDING = 'pending', 
//     SUSPENDED='suspended'
// }

export enum userEnumType {
    DRIVERS = 'drivers', 
    BUSINESSOWNERS = 'businessOwners', 
}

export class QueryUserDto {
  @ApiProperty({
    description: 'status of the user',
    example: 'active',
  })
  @IsBoolean()
  status: boolean;

  @ApiProperty({
    description: 'status of the user',
    example: 'active',
  })
  @IsEnum(userEnumType)
  userType: userEnumType;

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
