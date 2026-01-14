import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";

export enum GraphQueryOption {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}


export class GraphQueryDto {
@ApiProperty({
    example: 'weekly', 
    description: 'This queries a graph based on the time set, i.e weekly, monthly, or yearly'
})
  @IsEnum(GraphQueryOption, {message: 'only weekly, monthly and yearly are the accepted values '})
  option: GraphQueryOption;
}