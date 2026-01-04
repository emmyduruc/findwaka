import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdatePassengerDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  defaultCommunity?: string;
}

export class PassengerResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ required: false })
  defaultCommunity: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

