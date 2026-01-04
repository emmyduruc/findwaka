import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { DriverProfile } from '../entities/driver-profile.entity';
import { User } from '../entities/user.entity';
import { DriverPresence } from '../entities/driver-presence.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DriverProfile, User, DriverPresence])],
  controllers: [DriversController],
  providers: [DriversService],
  exports: [DriversService],
})
export class DriversModule {}

