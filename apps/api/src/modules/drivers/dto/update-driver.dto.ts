import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional } from 'class-validator';
import { VehicleType } from '@waka/shared';

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

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  areasOfOperation?: string[];
}

