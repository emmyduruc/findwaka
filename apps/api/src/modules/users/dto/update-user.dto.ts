import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  photoUrl?: string;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firebaseUid: string;

  @ApiProperty()
  role: string;

  @ApiProperty({ required: false })
  email: string | null;

  @ApiProperty({ required: false })
  phone: string | null;

  @ApiProperty()
  displayName: string;

  @ApiProperty({ required: false })
  photoUrl: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

