import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverPresence } from '../entities/driver-presence.entity';
import { DriverProfile } from '../entities/driver-profile.entity';
import { DriverLocationHistory } from '../entities/driver-location-history.entity';
import { User } from '../entities/user.entity';
import { UpdateLocationDto } from './dto/update-location.dto';
import { RequestUser } from '../common/guards/auth.guard';

@Injectable()
export class PresenceService {
  constructor(
    @InjectRepository(DriverPresence)
    private driverPresenceRepository: Repository<DriverPresence>,
    @InjectRepository(DriverProfile)
    private driverProfileRepository: Repository<DriverProfile>,
    @InjectRepository(DriverLocationHistory)
    private locationHistoryRepository: Repository<DriverLocationHistory>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getDriverProfile(user: RequestUser): Promise<DriverProfile> {
    const localUser = await this.userRepository.findOne({
      where: { firebaseUid: user.firebaseUid },
      relations: ['driverProfile'],
    });

    if (!localUser || !localUser.driverProfile) {
      throw new NotFoundException('Driver profile not found');
    }

    return localUser.driverProfile;
  }

  async setOnline(user: RequestUser): Promise<DriverPresence> {
    const profile = await this.getDriverProfile(user);
    let presence = await this.driverPresenceRepository.findOne({
      where: { driverProfileId: profile.id },
    });

    if (!presence) {
      presence = this.driverPresenceRepository.create({
        driverProfileId: profile.id,
        isOnline: true,
        lastSeenAt: new Date(),
      });
    } else {
      presence.isOnline = true;
      presence.lastSeenAt = new Date();
    }

    return this.driverPresenceRepository.save(presence);
  }

  async setOffline(user: RequestUser): Promise<DriverPresence> {
    const profile = await this.getDriverProfile(user);
    let presence = await this.driverPresenceRepository.findOne({
      where: { driverProfileId: profile.id },
    });

    if (!presence) {
      presence = this.driverPresenceRepository.create({
        driverProfileId: profile.id,
        isOnline: false,
        lastSeenAt: new Date(),
      });
    } else {
      presence.isOnline = false;
      presence.lastSeenAt = new Date();
    }

    return this.driverPresenceRepository.save(presence);
  }

  async updateLocation(
    user: RequestUser,
    dto: UpdateLocationDto,
  ): Promise<DriverPresence> {
    const profile = await this.getDriverProfile(user);
    let presence = await this.driverPresenceRepository.findOne({
      where: { driverProfileId: profile.id },
    });

    if (!presence) {
      presence = this.driverPresenceRepository.create({
        driverProfileId: profile.id,
        isOnline: true,
        lastSeenAt: new Date(),
      });
    }

    presence.lastSeenAt = new Date();
    presence.lastLat = dto.lat;
    presence.lastLng = dto.lng;
    presence.lastAccuracyM = dto.accuracyM;
    presence.lastHeading = dto.heading;
    presence.lastSpeedMps = dto.speedMps;

    const saved = await this.driverPresenceRepository.save(presence);

    const history = this.locationHistoryRepository.create({
      driverProfileId: profile.id,
      lat: dto.lat,
      lng: dto.lng,
      accuracyM: dto.accuracyM,
      heading: dto.heading,
      speedMps: dto.speedMps,
      recordedAt: new Date(),
    });
    await this.locationHistoryRepository.save(history);

    return saved;
  }
}

