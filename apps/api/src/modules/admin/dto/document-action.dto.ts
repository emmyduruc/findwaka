import { ApiProperty } from '@nestjs/swagger';

export class DocumentActionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  reviewedByUserId: string;

  @ApiProperty()
  reviewedAt: Date;
}

