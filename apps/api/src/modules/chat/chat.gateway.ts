import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatService } from './chat.service';
import { PresenceService } from '../presence/presence.service';
import { User } from '../../entities/user.entity';
import { getFirebaseApp } from '../../config/firebase.config';
import * as admin from 'firebase-admin';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  firebaseUid?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private userSockets = new Map<string, string>();

  constructor(
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    @Inject(forwardRef(() => PresenceService))
    private readonly presenceService: PresenceService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    if (!this.presenceService) {
      this.logger.error('PresenceService failed to inject in constructor');
    } else {
      this.logger.log('PresenceService successfully injected');
    }
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const app = getFirebaseApp();
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      client.firebaseUid = decodedToken.uid;
      
      const user = await this.userRepository.findOne({
        where: { firebaseUid: decodedToken.uid },
      });
      
      if (user) {
        client.userId = user.id;
        this.userSockets.set(user.id, client.id);
        this.logger.log(`Client connected: ${user.id} (${decodedToken.uid})`);
      } else {
        this.logger.warn(`User not found in database: ${decodedToken.uid}`);
        client.disconnect();
      }
    } catch (error) {
      this.logger.error('Authentication failed', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.userSockets.delete(client.userId);
      this.logger.log(`Client disconnected: ${client.userId}`);
    }
  }

  @SubscribeMessage('message:send')
  async handleMessage(
    @MessageBody() data: { conversationId: string; content: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    try {
      const firebaseUser = {
        firebaseUid: client.firebaseUid!,
        localUserId: client.userId,
      };

      const message = await this.chatService.createMessage(firebaseUser as any, {
        conversationId: data.conversationId,
        content: data.content,
      });

      const conversation = await this.chatService.getConversation(firebaseUser as any, data.conversationId);
      
      const otherParticipantId =
        conversation.participant1Id === client.userId
          ? conversation.participant2Id
          : conversation.participant1Id;

      const otherSocketId = this.userSockets.get(otherParticipantId);
      if (otherSocketId) {
        this.server.to(otherSocketId).emit('message:received', message);
      }

      return { success: true, message };
    } catch (error) {
      this.logger.error('Error sending message', error);
      return { error: error.message };
    }
  }

  @SubscribeMessage('location:update')
  async handleLocationUpdate(
    @MessageBody() data: { lat: number; lng: number; accuracyM?: number; heading?: number; speedMps?: number },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    try {
      if (!this.presenceService) {
        this.logger.error('PresenceService is not available');
        return { error: 'PresenceService not available' };
      }
      
      const firebaseUser = {
        firebaseUid: client.firebaseUid!,
        localUserId: client.userId,
      };

      await this.presenceService.updateLocation(firebaseUser as any, {
        lat: data.lat,
        lng: data.lng,
        accuracyM: data.accuracyM,
        heading: data.heading,
        speedMps: data.speedMps,
      });

      return { success: true };
    } catch (error) {
      this.logger.error('Error updating location', error);
      return { error: error.message };
    }
  }

  @SubscribeMessage('message:read')
  async handleMessageRead(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    try {
      const firebaseUser = {
        firebaseUid: client.firebaseUid!,
        localUserId: client.userId,
      };

      await this.chatService.markMessagesAsRead(firebaseUser as any, data.conversationId);

      return { success: true };
    } catch (error) {
      this.logger.error('Error marking messages as read', error);
      return { error: error.message };
    }
  }
}

