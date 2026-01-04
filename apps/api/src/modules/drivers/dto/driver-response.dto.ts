import { ApiProperty } from '@nestjs/swagger';
import { VehicleType } from '@waka/shared';

export class DriverResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: VehicleType })
  vehicleType: VehicleType;

  @ApiProperty({ required: false })
  vehicleBrand: string | null;

  @ApiProperty({ required: false })
  vehicleColor: string | null;

  @ApiProperty({ required: false })
  licensePlate: string | null;

  @ApiProperty()
  communityHome: string;

  @ApiProperty({ required: false })
  bio: string | null;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  averageRating: number;

  @ApiProperty()
  ratingCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PublicDriverResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty({ enum: VehicleType })
  vehicleType: VehicleType;

  @ApiProperty({ required: false })
  vehicleBrand: string | null;

  @ApiProperty({ required: false })
  vehicleColor: string | null;

  @ApiProperty()
  communityHome: string;

  @ApiProperty()
  averageRating: number;

  @ApiProperty()
  ratingCount: number;

  @ApiProperty()
  isOnline: boolean;

  @ApiProperty()
  lastSeenAt: Date;

  @ApiProperty({ required: false })
  lastLat: number | null;

  @ApiProperty({ required: false })
  lastLng: number | null;
}

