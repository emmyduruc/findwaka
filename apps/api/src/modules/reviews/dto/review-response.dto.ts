import { ApiProperty } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  driverProfileId: string;

  @ApiProperty()
  passengerUserId: string;

  @ApiProperty()
  passengerDisplayName: string;

  @ApiProperty()
  rating: number;

  @ApiProperty({ required: false })
  comment: string | null;

  @ApiProperty()
  createdAt: Date;
}

