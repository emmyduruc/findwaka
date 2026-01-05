import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../../entities/conversation.entity';
import { Message } from '../../entities/message.entity';
import { User } from '../../entities/user.entity';
import { FirebaseUser } from '../../guards/firebase-auth.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { ConversationResponseDto, ConversationListItemDto } from './dto/conversation-response.dto';
import { PushNotificationsService } from '../push-notifications/push-notifications.service';
import { PushNotificationType } from '../push-notifications/push-notification-types.enum';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(PushNotificationsService)
    private pushNotificationsService: PushNotificationsService,
  ) {}

  async getOrCreateConversation(
    firebaseUser: FirebaseUser,
    otherUserId: string,
  ): Promise<Conversation> {
    if (!firebaseUser.localUserId) {
      throw new NotFoundException('User not bootstrapped');
    }

    const currentUserId = firebaseUser.localUserId;

    if (currentUserId === otherUserId) {
      throw new ForbiddenException('Cannot create conversation with yourself');
    }

    let conversation = await this.conversationRepository.findOne({
      where: [
        { participant1Id: currentUserId, participant2Id: otherUserId },
        { participant1Id: otherUserId, participant2Id: currentUserId },
      ],
      relations: ['participant1', 'participant2'],
    });

    if (!conversation) {
      conversation = this.conversationRepository.create({
        participant1Id: currentUserId,
        participant2Id: otherUserId,
      });
      conversation = await this.conversationRepository.save(conversation);
    }

    return conversation;
  }

  async getConversations(firebaseUser: FirebaseUser): Promise<ConversationListItemDto[]> {
    if (!firebaseUser.localUserId) {
      throw new NotFoundException('User not bootstrapped');
    }

    const userId = firebaseUser.localUserId;

    const conversations = await this.conversationRepository.find({
      where: [
        { participant1Id: userId },
        { participant2Id: userId },
      ],
      relations: ['participant1', 'participant2'],
      order: { updatedAt: 'DESC' },
    });

    const result: ConversationListItemDto[] = [];

    for (const conv of conversations) {
      const otherParticipant =
        conv.participant1Id === userId ? conv.participant2 : conv.participant1;

      const lastMessage = await this.messageRepository.findOne({
        where: { conversationId: conv.id },
        order: { createdAt: 'DESC' },
      });

      const unreadCount = await this.messageRepository.count({
        where: {
          conversationId: conv.id,
          senderId: otherParticipant.id,
          isRead: false,
        },
      });

      result.push({
        id: conv.id,
        participantId: otherParticipant.id,
        participantName: otherParticipant.displayName || 'User',
        participantAvatar: otherParticipant.photoUrl,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              conversationId: lastMessage.conversationId,
              senderId: lastMessage.senderId,
              content: lastMessage.content,
              isRead: lastMessage.isRead,
              createdAt: lastMessage.createdAt,
            }
          : null,
        lastMessageAt: conv.lastMessageAt,
        unreadCount,
        updatedAt: conv.updatedAt,
      });
    }

    return result;
  }

  async getConversation(
    firebaseUser: FirebaseUser,
    conversationId: string,
  ): Promise<ConversationResponseDto> {
    if (!firebaseUser.localUserId) {
      throw new NotFoundException('User not bootstrapped');
    }

    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participant1', 'participant2'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (
      conversation.participant1Id !== firebaseUser.localUserId &&
      conversation.participant2Id !== firebaseUser.localUserId
    ) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    const messages = await this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });

    return {
      id: conversation.id,
      participant1Id: conversation.participant1Id,
      participant2Id: conversation.participant2Id,
      messages: messages.map((msg) => ({
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        content: msg.content,
        isRead: msg.isRead,
        createdAt: msg.createdAt,
      })),
    };
  }

  async createMessage(
    firebaseUser: FirebaseUser,
    dto: CreateMessageDto,
  ): Promise<MessageResponseDto> {
    if (!firebaseUser.localUserId) {
      throw new NotFoundException('User not bootstrapped');
    }

    const conversation = await this.conversationRepository.findOne({
      where: { id: dto.conversationId },
      relations: ['participant1', 'participant2'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (
      conversation.participant1Id !== firebaseUser.localUserId &&
      conversation.participant2Id !== firebaseUser.localUserId
    ) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    const message = this.messageRepository.create({
      conversationId: dto.conversationId,
      senderId: firebaseUser.localUserId,
      content: dto.content,
      isRead: false,
    });

    const savedMessage = await this.messageRepository.save(message);

    conversation.lastMessageId = savedMessage.id;
    conversation.lastMessageAt = savedMessage.createdAt;
    await this.conversationRepository.save(conversation);

    const otherParticipantId =
      conversation.participant1Id === firebaseUser.localUserId
        ? conversation.participant2Id
        : conversation.participant1Id;

    const otherUser = await this.userRepository.findOne({
      where: { id: otherParticipantId },
    });

    if (otherUser?.pushNotificationToken) {
      await this.pushNotificationsService.sendNotificationToToken({
        token: otherUser.pushNotificationToken,
        type: PushNotificationType.MESSAGE,
        data: {
          conversationId: conversation.id,
          senderId: firebaseUser.localUserId,
          messageId: savedMessage.id,
        },
        customTitle: otherUser?.displayName || 'New message',
        customBody: dto.content,
      });
    }

    return {
      id: savedMessage.id,
      conversationId: savedMessage.conversationId,
      senderId: savedMessage.senderId,
      content: savedMessage.content,
      isRead: savedMessage.isRead,
      createdAt: savedMessage.createdAt,
    };
  }

  async markMessagesAsRead(
    firebaseUser: FirebaseUser,
    conversationId: string,
  ): Promise<void> {
    if (!firebaseUser.localUserId) {
      throw new NotFoundException('User not bootstrapped');
    }

    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (
      conversation.participant1Id !== firebaseUser.localUserId &&
      conversation.participant2Id !== firebaseUser.localUserId
    ) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    await this.messageRepository.update(
      {
        conversationId,
        senderId: conversation.participant1Id === firebaseUser.localUserId
          ? conversation.participant2Id
          : conversation.participant1Id,
        isRead: false,
      },
      { isRead: true },
    );
  }
}

