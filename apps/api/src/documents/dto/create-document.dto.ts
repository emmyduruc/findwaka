import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { DocumentType } from '@findwaka/shared';

export class CreateDocumentDto {
  @ApiProperty({ enum: DocumentType })
  @IsEnum(DocumentType)
  @IsNotEmpty()
  docType: DocumentType;

  @ApiProperty()
  @IsUrl()
  @IsNotEmpty()
  fileUrl: string;
}

