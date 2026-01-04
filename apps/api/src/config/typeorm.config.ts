import { TypeOrmModuleOptions } from '@nestjs/typeorm';
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

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
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
  logging: process.env.NODE_ENV === 'development',
};

