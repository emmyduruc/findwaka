import { ApiProperty } from '@nestjs/swagger';

export class PublicDriverDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  vehicleType: string;

  @ApiProperty()
  communityHome: string;

  @ApiProperty()
  averageRating: number;

  @ApiProperty()
  ratingCount: number;

  @ApiProperty()
  isOnline: boolean;

  @ApiProperty({ required: false })
  lastSeenAt?: Date;

  @ApiProperty({ required: false })
  lastLat?: number;

  @ApiProperty({ required: false })
  lastLng?: number;
}

