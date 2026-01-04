import { ApiProperty } from '@nestjs/swagger';
import { IsUrl, IsOptional } from 'class-validator';

export class UpdateDocumentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  fileUrl?: string;
}

