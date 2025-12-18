import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class UpdateAdminUserDto {
  @ApiProperty({
    description: 'Full name of the admin user',
    example: 'Ahmed Musa',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;
}
