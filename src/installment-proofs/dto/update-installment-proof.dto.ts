import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsEnum, IsString,IsOptional } from "class-validator";

export enum InstallmentProofStatusType {
    APPROVED = 'approved', 
    REJECTED = 'rejected', 
}

export class UpdateInstallmentProofDto {
  @ApiProperty({
    example: 'approved',
    description: 'Status of the weekly proof',
  })
  @IsEnum(InstallmentProofStatusType)
  @IsNotEmpty()
  statusType: InstallmentProofStatusType;

  @ApiPropertyOptional({
    example: 'The picture is not clear',
    description: 'Rejection reason of the installment proof',
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}