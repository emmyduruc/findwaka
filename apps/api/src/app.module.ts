import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfigFactory } from './config/typeorm.config';
import './config/firebase.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PassengersModule } from './modules/passengers/passengers.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { PresenceModule } from './modules/presence/presence.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { AdminModule } from './modules/admin/admin.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { PushNotificationsModule } from './modules/push-notifications/push-notifications.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env', '../../.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeOrmConfigFactory,
    }),
    AuthModule,
    UsersModule,
    PassengersModule,
    DriversModule,
    PresenceModule,
    DocumentsModule,
    AdminModule,
    ReviewsModule,
    PushNotificationsModule,
    ChatModule,
  ],
})
export class AppModule {
  constructor() {
    // Firebase is initialized automatically when firebase.config.ts is imported
  }
}

