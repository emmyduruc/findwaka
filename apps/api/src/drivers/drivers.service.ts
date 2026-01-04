import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverProfile } from '../entities/driver-profile.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '@findwaka/shared';
import { DriverPresence } from '../entities/driver-presence.entity';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { PublicDriverDto } from './dto/public-driver.dto';
import { RequestUser } from '../common/guards/auth.guard';
import { VehicleType } from '@findwaka/shared';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(DriverProfile)
    private driverProfileRepository: Repository<DriverProfile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(DriverPresence)
    private driverPresenceRepository: Repository<DriverPresence>,
  ) {}

  async createProfile(user: RequestUser, dto: CreateDriverDto): Promise<DriverProfile> {
    const localUser = await this.userRepository.findOne({
      where: { firebaseUid: user.firebaseUid },
    });

    if (!localUser) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.driverProfileRepository.findOne({
      where: { userId: localUser.id },
    });

    if (existing) {
      throw new Error('Driver profile already exists');
    }

    localUser.role = UserRole.DRIVER;
    await this.userRepository.save(localUser);

    const profile = this.driverProfileRepository.create({
      userId: localUser.id,
      ...dto,
    });

    const savedProfile = await this.driverProfileRepository.save(profile);

    const presence = this.driverPresenceRepository.create({
      driverProfileId: savedProfile.id,
      isOnline: false,
      lastSeenAt: new Date(),
    });
    await this.driverPresenceRepository.save(presence);

    return savedProfile;
  }

  async getMe(user: RequestUser): Promise<DriverProfile> {
    const localUser = await this.userRepository.findOne({
      where: { firebaseUid: user.firebaseUid },
      relations: ['driverProfile'],
    });

    if (!localUser || !localUser.driverProfile) {
      throw new NotFoundException('Driver profile not found');
    }

    return localUser.driverProfile;
  }

  async updateMe(
    user: RequestUser,
    dto: UpdateDriverDto,
  ): Promise<DriverProfile> {
    const profile = await this.getMe(user);

    const updateFields: Array<keyof UpdateDriverDto> = [
      'vehicleType',
      'vehicleBrand',
      'vehicleColor',
      'licensePlate',
      'communityHome',
      'bio',
    ];

    const updates = updateFields.reduce((acc, field) => {
      const value = dto[field];
      if (value !== undefined) {
        acc[field] = value;
      }
      return acc;
    }, {} as Record<string, unknown>);

    Object.assign(profile, updates);

    return this.driverProfileRepository.save(profile);
  }

  async findPublic(
    community?: string,
    vehicleType?: VehicleType,
    online?: boolean,
    limit = 20,
    offset = 0,
  ): Promise<PublicDriverDto[]> {
    const query = this.driverProfileRepository
      .createQueryBuilder('profile')
      .innerJoinAndSelect('profile.user', 'user')
      .leftJoinAndSelect('profile.presence', 'presence')
      .where('user.isActive = :isActive', { isActive: true })
      .andWhere('profile.isVerified = :isVerified', { isVerified: true });

    if (community) {
      query.andWhere('profile.communityHome = :community', { community });
    }

    if (vehicleType) {
      query.andWhere('profile.vehicleType = :vehicleType', { vehicleType });
    }

    if (online !== undefined) {
      query.andWhere('presence.isOnline = :online', { online });
    }

    const profiles = await query
      .orderBy('presence.lastSeenAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany();

    return profiles.map((profile) => ({
      id: profile.id,
      displayName: profile.user.displayName,
      vehicleType: profile.vehicleType,
      communityHome: profile.communityHome,
      averageRating: Number(profile.averageRating),
      ratingCount: profile.ratingCount,
      isOnline: profile.presence?.isOnline || false,
      lastSeenAt: profile.presence?.lastSeenAt,
      lastLat: profile.presence?.lastLat,
      lastLng: profile.presence?.lastLng,
    }));
  }
}

