import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from '../../guards/firebase-auth.guard';
import { User } from '../../entities/user.entity';
import { PassengerProfile } from '../../entities/passenger-profile.entity';
import { DriverProfile } from '../../entities/driver-profile.entity';
import { DriverPresence } from '../../entities/driver-presence.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PassengerProfile, DriverProfile, DriverPresence]),
  ],
  controllers: [AuthController],
  providers: [AuthService, FirebaseAuthGuard],
  exports: [AuthService],
})
export class AuthModule {}

