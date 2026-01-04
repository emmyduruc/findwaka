import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePassengerDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  defaultCommunity?: string;
}

