import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserRole } from '@waka/shared';

export class BootstrapDto {
  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole, { message: 'Role must be one of: PASSENGER, DRIVER, ADMIN' })
  role: UserRole;
}

export class BootstrapResponseDto {
  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ required: false })
  passengerProfileId?: string;

  @ApiProperty({ required: false })
  driverProfileId?: string;
}

