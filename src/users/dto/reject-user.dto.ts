import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

enum RoleType {
  DRIVER = 'driver',
  BUSINESS_OWNER = 'businessOwner',
}

export class RejectUserDto {

  @ApiProperty({
    description: 'The role type to reject',
    enum: RoleType,
    example: 'driver',
  })
  @IsNotEmpty()
  @IsEnum(RoleType, {
    message: 'roleType must be either driver or businessOwner',
  })
  roleType: 'driver' | 'businessOwner';
}
