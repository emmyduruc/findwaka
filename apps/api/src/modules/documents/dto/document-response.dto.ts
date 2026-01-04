import { ApiProperty } from '@nestjs/swagger';
import { DocumentType, DocumentStatus } from '@waka/shared';

export class DocumentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  driverProfileId: string;

  @ApiProperty({ enum: DocumentType })
  docType: DocumentType;

  @ApiProperty()
  fileUrl: string;

  @ApiProperty({ enum: DocumentStatus })
  status: DocumentStatus;

  @ApiProperty({ required: false })
  reviewedByUserId: string | null;

  @ApiProperty({ required: false })
  reviewedAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

