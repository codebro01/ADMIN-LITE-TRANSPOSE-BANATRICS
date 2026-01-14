import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateCampaignDesignDto {
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
    example: 'First design made',
    description: "A simple comment on the design"
  })
  @IsNotEmpty()
  @IsString()
  comment: string;
}