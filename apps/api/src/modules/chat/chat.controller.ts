import { Controller, Get, Post, Body, Param, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { FirebaseAuthGuard } from '../../guards/firebase-auth.guard';
import { CurrentUser } from '../../decorators/user.decorator';
import { FirebaseUser } from '../../guards/firebase-auth.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { ConversationResponseDto, ConversationListItemDto } from './dto/conversation-response.dto';

@ApiTags('chat')
@Controller('chat')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(@Inject(ChatService) private readonly chatService: ChatService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations for current user' })
  @ApiResponse({ status: 200, type: [ConversationListItemDto] })
  async getConversations(
    @CurrentUser() firebaseUser: FirebaseUser,
  ): Promise<ConversationListItemDto[]> {
    return this.chatService.getConversations(firebaseUser);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get conversation with messages' })
  @ApiResponse({ status: 200, type: ConversationResponseDto })
  async getConversation(
    @CurrentUser() firebaseUser: FirebaseUser,
    @Param('id') id: string,
  ): Promise<ConversationResponseDto> {
    return this.chatService.getConversation(firebaseUser, id);
  }

  @Post('conversations/:otherUserId')
  @ApiOperation({ summary: 'Get or create conversation with another user' })
  @ApiResponse({ status: 200 })
  async getOrCreateConversation(
    @CurrentUser() firebaseUser: FirebaseUser,
    @Param('otherUserId') otherUserId: string,
  ) {
    const conversation = await this.chatService.getOrCreateConversation(firebaseUser, otherUserId);
    return { id: conversation.id };
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a message' })
  @ApiResponse({ status: 201, type: MessageResponseDto })
  async createMessage(
    @CurrentUser() firebaseUser: FirebaseUser,
    @Body() dto: CreateMessageDto,
  ): Promise<MessageResponseDto> {
    return this.chatService.createMessage(firebaseUser, dto);
  }

  @Post('conversations/:id/read')
  @ApiOperation({ summary: 'Mark messages as read' })
  @ApiResponse({ status: 200 })
  async markAsRead(
    @CurrentUser() firebaseUser: FirebaseUser,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    await this.chatService.markMessagesAsRead(firebaseUser, id);
    return { success: true };
  }
}

