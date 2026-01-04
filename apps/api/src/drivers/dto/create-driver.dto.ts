import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { VehicleType } from '@findwaka/shared';

export class CreateDriverDto {
  @ApiProperty({ enum: VehicleType })
  @IsEnum(VehicleType)
  @IsNotEmpty()
  vehicleType: VehicleType;

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

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  communityHome: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bio?: string;
}

