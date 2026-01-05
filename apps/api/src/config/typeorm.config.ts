import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { PassengerProfile } from '../entities/passenger-profile.entity';
import { DriverProfile } from '../entities/driver-profile.entity';
import { DriverDocument } from '../entities/driver-document.entity';
import { DriverPresence } from '../entities/driver-presence.entity';
import { DriverLocationHistory } from '../entities/driver-location-history.entity';
import { Community } from '../entities/community.entity';
import { Review } from '../entities/review.entity';
import { AuditEvent } from '../entities/audit-event.entity';
import { Conversation } from '../entities/conversation.entity';
import { Message } from '../entities/message.entity';

export const typeOrmConfigFactory = (configService: ConfigService): TypeOrmModuleOptions => {
  const databaseUrl = configService.get<string>('DATABASE_URL');
  
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set in environment variables');
    throw new Error('DATABASE_URL is required');
  }

  return {
    type: 'postgres',
    url: databaseUrl,
    entities: [
      User,
      PassengerProfile,
      DriverProfile,
      DriverDocument,
      DriverPresence,
      DriverLocationHistory,
      Community,
      Review,
      AuditEvent,
      Conversation,
      Message,
    ],
    migrations: ['apps/api/src/migrations/*.ts'],
    synchronize: false,
    logging: configService.get<string>('NODE_ENV') === 'development',
  };
};

