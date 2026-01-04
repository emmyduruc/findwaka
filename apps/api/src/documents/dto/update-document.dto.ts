import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateDocumentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  fileUrl?: string;
}

