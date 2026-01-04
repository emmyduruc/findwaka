import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional } from 'class-validator';
import { VehicleType } from '@waka/shared';

export class CreateDriverDto {
  @ApiProperty({ enum: VehicleType })
  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @ApiProperty()
  @IsString()
  communityHome: string;
}

