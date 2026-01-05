import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  conversationId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;
}

