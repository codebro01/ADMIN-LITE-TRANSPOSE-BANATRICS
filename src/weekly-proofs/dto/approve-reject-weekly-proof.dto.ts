import { ApiProperty } from '@nestjs/swagger';
import { WeeklyProofStatus } from '@src/weekly-proofs/dto/create-weekly-proof.dto';
import { IsEnum, IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';




export class ApproveOrRejectWeeklyProofDto {
  @ApiProperty({
    example: 'approved',
    description: 'Weekly proof status',
  })
  @IsNotEmpty()
  @IsEnum(WeeklyProofStatus)
  statusType: WeeklyProofStatus;

  @ApiProperty({
    example: 'Well captured',
    description:
      'The comment of the admin with respect to the submitted weekly proof',
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({
    example: '39b847ff-97c6-48e8-b348-698179e79f1d',
    description:
      'id of the weekly proof to be approved',
  })
  @IsNotEmpty()
  @IsUUID()
  weeklyProofId: string;
}
