import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsBoolean, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { VehicleType } from '@waka/shared';

export class PublicDriversQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  community?: string;

  @ApiProperty({ required: false, enum: VehicleType })
  @IsOptional()
  @IsEnum(VehicleType)
  vehicleType?: VehicleType;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  online?: boolean;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}

