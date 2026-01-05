import { ApiProperty } from '@nestjs/swagger';
import { MessageResponseDto } from './message-response.dto';

export class ConversationListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  participantId: string;

  @ApiProperty()
  participantName: string;

  @ApiProperty({ required: false })
  participantAvatar: string | null;

  @ApiProperty({ required: false })
  lastMessage: MessageResponseDto | null;

  @ApiProperty()
  lastMessageAt: Date | null;

  @ApiProperty()
  unreadCount: number;

  @ApiProperty()
  updatedAt: Date;
}

export class ConversationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  participant1Id: string;

  @ApiProperty()
  participant2Id: string;

  @ApiProperty({ type: [MessageResponseDto] })
  messages: MessageResponseDto[];
}

