import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUrl } from 'class-validator';
import { DocumentType } from '@waka/shared';

export class CreateDocumentDto {
  @ApiProperty({ enum: DocumentType })
  @IsEnum(DocumentType)
  docType: DocumentType;

  @ApiProperty()
  @IsUrl()
  fileUrl: string;
}

