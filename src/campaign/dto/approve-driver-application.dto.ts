import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";


export class ApproveDriverApplicationDto {
  @ApiProperty({
    description: 'Campaign id of the campaign',
    example: '98e64b6d-e67d-4b46-829a-6fe4edc085c0',
  })
  @IsUUID()
  @IsNotEmpty()
  campaignId: string;

//   @ApiProperty({
//     description: 'Driver id that applied for the campaign',
//     example: '563e4b6d-e67d-4b46-829a-6fe4edc085c0',
//   })
//   @IsUUID()
//   @IsNotEmpty()
//   userId: string;
}