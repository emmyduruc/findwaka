import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PresenceController } from './presence.controller';
import { PresenceService } from './presence.service';
import { DriverPresence } from '../entities/driver-presence.entity';
import { DriverProfile } from '../entities/driver-profile.entity';
import { DriverLocationHistory } from '../entities/driver-location-history.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DriverPresence,
      DriverProfile,
      DriverLocationHistory,
      User,
    ]),
  ],
  controllers: [PresenceController],
  providers: [PresenceService],
})
export class PresenceModule {}

