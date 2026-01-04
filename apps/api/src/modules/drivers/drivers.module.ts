import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { RolesGuard } from '../../guards/roles.guard';
import { DriverProfile } from '../../entities/driver-profile.entity';
import { DriverPresence } from '../../entities/driver-presence.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DriverProfile, DriverPresence, User])],
  controllers: [DriversController],
  providers: [DriversService, RolesGuard],
  exports: [DriversService],
})
export class DriversModule {}

