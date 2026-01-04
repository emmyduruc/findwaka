import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassengersController } from './passengers.controller';
import { PassengersService } from './passengers.service';
import { PassengerProfile } from '../entities/passenger-profile.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PassengerProfile, User])],
  controllers: [PassengersController],
  providers: [PassengersService],
})
export class PassengersModule {}

