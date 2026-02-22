import { ApiProperty } from "@nestjs/swagger";
import { DriverCampaignStatusType } from "@src/campaign/dto/create-driver-campaign.dto";
import { IsNotEmpty, IsString, IsEnum, IsOptional } from "class-validator";


export class ApproveDriverApplicationDto {
  @ApiProperty({
    description: 'The status of the campaign',
    example: 'rejected',
  })
  @IsEnum(DriverCampaignStatusType)
  @IsNotEmpty()
  status: DriverCampaignStatusType;


  @ApiProperty({
    description: 'The reason for rejecting campaign application',
    example: 'Not eligible',
  })
  @IsString()
  @IsOptional()
  rejectionReason?: string;

  //   @ApiProperty({
  //     description: 'Driver id that applied for the campaign',
  //     example: '563e4b6d-e67d-4b46-829a-6fe4edc085c0',
  //   })
  //   @IsUUID()
  //   @IsNotEmpty()
  //   userId: string;
}