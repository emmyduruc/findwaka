import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PresenceController } from './presence.controller';
import { PresenceService } from './presence.service';
import { RolesGuard } from '../../guards/roles.guard';
import { DriverPresence } from '../../entities/driver-presence.entity';
import { DriverLocationHistory } from '../../entities/driver-location-history.entity';
import { DriverProfile } from '../../entities/driver-profile.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DriverPresence,
      DriverLocationHistory,
      DriverProfile,
      User,
    ]),
  ],
  controllers: [PresenceController],
  providers: [PresenceService, RolesGuard],
  exports: [PresenceService],
})
export class PresenceModule {}

