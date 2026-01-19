import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum GraphQueryInterval {
  SEVENDAYS = 'seven_days',
  SIXMONTHS = 'six_months',
  FIVEYEARS = 'five_years',
}

export class GraphQueryDto {
  @ApiProperty({
    description: "This query's the campaign growth based on interval",
    example: 'seven_days',
  })
  @IsNotEmpty()
  @IsEnum(GraphQueryInterval, {message: "only allowed value are seven_days, six_months, and five_years"})
  interval: GraphQueryInterval;
}
