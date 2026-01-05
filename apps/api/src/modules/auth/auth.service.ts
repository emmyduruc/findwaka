import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { PassengerProfile } from '../../entities/passenger-profile.entity';
import { DriverProfile } from '../../entities/driver-profile.entity';
import { DriverPresence } from '../../entities/driver-presence.entity';
import { UserRole } from '@waka/shared';
import { FirebaseUser } from '../../guards/firebase-auth.guard';
import { BootstrapResponseDto } from './dto/bootstrap.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PassengerProfile)
    private passengerProfileRepository: Repository<PassengerProfile>,
    @InjectRepository(DriverProfile)
    private driverProfileRepository: Repository<DriverProfile>,
    @InjectRepository(DriverPresence)
    private driverPresenceRepository: Repository<DriverPresence>,
  ) {}

  async initializeUser(firebaseUser: FirebaseUser, role: UserRole): Promise<BootstrapResponseDto> {
    let user = await this.userRepository.findOne({
      where: { firebaseUid: firebaseUser.firebaseUid },
    });

    if (!user) {
      user = this.userRepository.create({
        firebaseUid: firebaseUser.firebaseUid,
        role,
        email: firebaseUser.email,
        phone: firebaseUser.phone,
        displayName: firebaseUser.name || 'User',
        photoUrl: null,
        isActive: true,
      });
      user = await this.userRepository.save(user);
    } else {
      if (user.role !== role) {
        user.role = role;
        await this.userRepository.save(user);
      }
    }

    firebaseUser.localUserId = user.id;
    firebaseUser.roles = [user.role];

    const response: BootstrapResponseDto = {
      userId: user.id,
      role: user.role,
    };

    if (role === UserRole.PASSENGER) {
      let passengerProfile = await this.passengerProfileRepository.findOne({
        where: { userId: user.id },
      });

      if (!passengerProfile) {
        passengerProfile = this.passengerProfileRepository.create({
          userId: user.id,
          defaultCommunity: null,
        });
        passengerProfile = await this.passengerProfileRepository.save(passengerProfile);
      }

      response.passengerProfileId = passengerProfile.id;
    } else if (role === UserRole.DRIVER) {
      let driverProfile = await this.driverProfileRepository.findOne({
        where: { userId: user.id },
      });

      if (!driverProfile) {
        driverProfile = this.driverProfileRepository.create({
          userId: user.id,
          vehicleType: null as any,
          communityHome: '',
          isVerified: false,
          averageRating: 0,
          ratingCount: 0,
        });
        driverProfile = await this.driverProfileRepository.save(driverProfile);

        const presence = this.driverPresenceRepository.create({
          driverProfileId: driverProfile.id,
          isOnline: false,
          lastSeenAt: new Date(),
        });
        await this.driverPresenceRepository.save(presence);
      }

      response.driverProfileId = driverProfile.id;
    }

    return response;
  }
}

