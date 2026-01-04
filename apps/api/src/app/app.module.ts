import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { PassengersModule } from '../passengers/passengers.module';
import { DriversModule } from '../drivers/drivers.module';
import { PresenceModule } from '../presence/presence.module';
import { DocumentsModule } from '../documents/documents.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { AdminModule } from '../admin/admin.module';
import { User } from '../entities/user.entity';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../common/guards/auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false,
      migrations: ['dist/migrations/*.js'],
      migrationsRun: false,
    }),
    TypeOrmModule.forFeature([User]),
    AuthModule,
    UsersModule,
    PassengersModule,
    DriversModule,
    PresenceModule,
    DocumentsModule,
    ReviewsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
