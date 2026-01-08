import { IsNotEmpty, IsString, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UploadCampaignDesignDto {
  @ApiProperty({
    example: {
      secure_url: 'https://example.com/media/logo.jpg',
      public_id: 'logo_abc123',
    },
    description:
      'The secure url and the public id of the image',
  })
  @IsNotEmpty()
  designs: {
    secure_url: string;
    public_id: string;
  };



  @ApiProperty({
    example: '6893204b-4b24-4c97-82e7-af78f9d76cbb',
    description: "The campaign id that owns the image"
  })
  @IsNotEmpty()
  @IsUUID()
  campaignId: string;


  @ApiProperty({
    example: 'First design made',
    description: "A simple comment on the design"
  })
  @IsNotEmpty()
  @IsString()
  comment: string;
}