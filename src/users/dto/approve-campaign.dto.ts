import { IsNotEmpty, IsUUID, IsString, Matches, IsEnum } from "class-validator";
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
    example: '6893204b-4b24-4c97-82e7-af78f9d76cbb',
    description: 'The campaign id that owns the image',
  })
  @IsNotEmpty()
  @IsUUID()
  campaignId: string;

  @ApiProperty({
    example: 'reject',
    description: 'The status which can either be approve or rejected',
  })
  @IsNotEmpty()
  @IsEnum(approveCampaignType)
  approveCampaignType: approveCampaignType;
}