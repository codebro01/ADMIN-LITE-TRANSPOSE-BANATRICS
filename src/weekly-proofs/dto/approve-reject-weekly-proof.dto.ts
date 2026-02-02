import { ApiProperty } from '@nestjs/swagger';
import { WeeklyProofStatus } from '@src/weekly-proofs/dto/create-weekly-proof.dto';
import { IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';




export class ApproveOrRejectWeeklyProofDto {
  @ApiProperty({
    example: 'approved',
    description:
      'Weekly proof status',
  })
  @IsNotEmpty()
  @IsEnum(WeeklyProofStatus)
  statusType: WeeklyProofStatus;

  @ApiProperty({
    example: 'Well captured',
    description: 'The comment of the admin with respect to the submitted weekly proof',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
