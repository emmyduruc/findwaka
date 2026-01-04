import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { VehicleType } from '@findwaka/shared';

export class UpdateDriverDto {
  @ApiProperty({ required: false, enum: VehicleType })
  @IsOptional()
  @IsEnum(VehicleType)
  vehicleType?: VehicleType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  vehicleBrand?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  vehicleColor?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  licensePlate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  communityHome?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bio?: string;
}

