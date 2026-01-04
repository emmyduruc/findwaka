import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverPresence } from '../../entities/driver-presence.entity';
import { DriverLocationHistory } from '../../entities/driver-location-history.entity';
import { DriverProfile } from '../../entities/driver-profile.entity';
import { User } from '../../entities/user.entity';
import { UserRole } from '@waka/shared';
import { FirebaseUser } from '../../guards/firebase-auth.guard';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class PresenceService {
  constructor(
    @InjectRepository(DriverPresence)
    private driverPresenceRepository: Repository<DriverPresence>,
    @InjectRepository(DriverLocationHistory)
    private driverLocationHistoryRepository: Repository<DriverLocationHistory>,
    @InjectRepository(DriverProfile)
    private driverProfileRepository: Repository<DriverProfile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async setOnline(firebaseUser: FirebaseUser): Promise<void> {
    const driverProfile = await this.getDriverProfile(firebaseUser);

    let presence = await this.driverPresenceRepository.findOne({
      where: { driverProfileId: driverProfile.id },
    });

    if (!presence) {
      presence = this.driverPresenceRepository.create({
        driverProfileId: driverProfile.id,
        isOnline: true,
        lastSeenAt: new Date(),
      });
    } else {
      presence.isOnline = true;
      presence.lastSeenAt = new Date();
    }

    await this.driverPresenceRepository.save(presence);
  }

  async setOffline(firebaseUser: FirebaseUser): Promise<void> {
    const driverProfile = await this.getDriverProfile(firebaseUser);

    const presence = await this.driverPresenceRepository.findOne({
      where: { driverProfileId: driverProfile.id },
    });

    if (!presence) {
      throw new NotFoundException('Presence not found');
    }

    presence.isOnline = false;
    presence.lastSeenAt = new Date();
    await this.driverPresenceRepository.save(presence);
  }

  async updateLocation(firebaseUser: FirebaseUser, dto: UpdateLocationDto): Promise<void> {
    const driverProfile = await this.getDriverProfile(firebaseUser);

    let presence = await this.driverPresenceRepository.findOne({
      where: { driverProfileId: driverProfile.id },
    });

    if (!presence) {
      presence = this.driverPresenceRepository.create({
        driverProfileId: driverProfile.id,
        isOnline: true,
        lastSeenAt: new Date(),
        lastLat: dto.lat,
        lastLng: dto.lng,
        lastAccuracyM: dto.accuracyM || null,
        lastHeading: dto.heading || null,
        lastSpeedMps: dto.speedMps || null,
      });
    } else {
      presence.lastSeenAt = new Date();
      presence.lastLat = dto.lat;
      presence.lastLng = dto.lng;
      presence.lastAccuracyM = dto.accuracyM || null;
      presence.lastHeading = dto.heading || null;
      presence.lastSpeedMps = dto.speedMps || null;
    }

    await this.driverPresenceRepository.save(presence);

    const history = this.driverLocationHistoryRepository.create({
      driverProfileId: driverProfile.id,
      lat: dto.lat,
      lng: dto.lng,
      accuracyM: dto.accuracyM || null,
      heading: dto.heading || null,
      speedMps: dto.speedMps || null,
      recordedAt: new Date(),
    });
    await this.driverLocationHistoryRepository.save(history);
  }

  private async getDriverProfile(firebaseUser: FirebaseUser): Promise<DriverProfile> {
    if (!firebaseUser.localUserId) {
      throw new NotFoundException('User not bootstrapped');
    }

    const user = await this.userRepository.findOne({
      where: { id: firebaseUser.localUserId },
      relations: ['driverProfile'],
    });

    if (!user || user.role !== UserRole.DRIVER) {
      throw new ForbiddenException('User is not a driver');
    }

    if (!user.driverProfile) {
      throw new NotFoundException('Driver profile not found');
    }

    return user.driverProfile;
  }
}

