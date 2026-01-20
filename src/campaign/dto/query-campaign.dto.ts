import { ApiPropertyOptional } from "@nestjs/swagger";
import { StatusType } from "@src/campaign/dto/publishCampaignDto";
import { IsEnum, IsOptional } from "class-validator";


export class QueryCampaignDto {
  @ApiPropertyOptional({
    example: 'approved',
    description: 'This is the status of the campaign',
  })
  @IsOptional()
  @IsEnum(StatusType)
  status?: StatusType;

  @ApiPropertyOptional({
    example: true,
    description: 'This is the active state of the campaign',
  })
  @IsOptional()
  active?: boolean;
}