import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { Conversation } from '../../entities/conversation.entity';
import { Message } from '../../entities/message.entity';
import { User } from '../../entities/user.entity';
import { PushNotificationsModule } from '../push-notifications/push-notifications.module';
import { PresenceModule } from '../presence/presence.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message, User]),
    PushNotificationsModule,
    forwardRef(() => PresenceModule),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}

