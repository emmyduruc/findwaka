import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { initializeFirebase } from './config/firebase.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PassengersModule } from './modules/passengers/passengers.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { PresenceModule } from './modules/presence/presence.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { AdminModule } from './modules/admin/admin.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { PushNotificationsModule } from './modules/push-notifications/push-notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    UsersModule,
    PassengersModule,
    DriversModule,
    PresenceModule,
    DocumentsModule,
    AdminModule,
    ReviewsModule,
    PushNotificationsModule,
  ],
})
export class AppModule {
  constructor() {
    try {
      initializeFirebase();
    } catch (error) {
      console.error('Failed to initialize Firebase in AppModule:', error.message);
    }
  }
}

