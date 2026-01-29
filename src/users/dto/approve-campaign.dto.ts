import { IsNotEmpty, IsString, Matches, IsEnum, IsNumber, Min,  } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum approveCampaignType  {
    APPROVE = 'approved', 
    REJECT = 'rejected'
}

export class ApproveCampaignDto {
  @ApiProperty({
    description: 'Phone number with country code',
    example: '+2348012345678',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in valid international format',
  })
  printHousePhoneNo: string;

  

  @ApiProperty({
    example: 'reject',
    description: 'The status which can either be approve or rejected',
  })
  @IsNotEmpty()
  @IsEnum(approveCampaignType)
  approveCampaignType: approveCampaignType;


  @ApiProperty({
    example: 45000,
    description: 'The amount that will be paid to each driver after the completion of the campaign',
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  pricePerDriver: number;
}