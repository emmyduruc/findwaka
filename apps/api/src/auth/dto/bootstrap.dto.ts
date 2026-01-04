import { ApiProperty } from '@nestjs/swagger';

export class BootstrapResponseDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  firebaseUid: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  displayName: string;
}

