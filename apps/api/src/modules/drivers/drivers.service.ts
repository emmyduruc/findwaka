import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverProfile } from '../../entities/driver-profile.entity';
import { DriverPresence } from '../../entities/driver-presence.entity';
import { User } from '../../entities/user.entity';
import { UserRole, VehicleType } from '@waka/shared';
import { FirebaseUser } from '../../guards/firebase-auth.guard';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { DriverResponseDto, PublicDriverResponseDto } from './dto/driver-response.dto';
import { PublicDriversQueryDto } from './dto/public-drivers-query.dto';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(DriverProfile)
    private driverProfileRepository: Repository<DriverProfile>,
    @InjectRepository(DriverPresence)
    private driverPresenceRepository: Repository<DriverPresence>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createMe(firebaseUser: FirebaseUser, dto: CreateDriverDto): Promise<DriverResponseDto> {
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

    if (user.driverProfile) {
      throw new BadRequestException('Driver profile already exists');
    }

    const driverProfile = this.driverProfileRepository.create({
      userId: user.id,
      vehicleType: dto.vehicleType,
      communityHome: dto.communityHome,
      isVerified: false,
      averageRating: 0,
      ratingCount: 0,
    });

    const saved = await this.driverProfileRepository.save(driverProfile);

    const presence = this.driverPresenceRepository.create({
      driverProfileId: saved.id,
      isOnline: false,
      lastSeenAt: new Date(),
    });
    await this.driverPresenceRepository.save(presence);

    return this.getMe(firebaseUser);
  }

  async getMe(firebaseUser: FirebaseUser): Promise<DriverResponseDto> {
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

    return {
      id: user.driverProfile.id,
      userId: user.driverProfile.userId,
      vehicleType: user.driverProfile.vehicleType,
      vehicleBrand: user.driverProfile.vehicleBrand,
      vehicleColor: user.driverProfile.vehicleColor,
      licensePlate: user.driverProfile.licensePlate,
      communityHome: user.driverProfile.communityHome,
      bio: user.driverProfile.bio,
      isVerified: user.driverProfile.isVerified,
      averageRating: Number(user.driverProfile.averageRating),
      ratingCount: user.driverProfile.ratingCount,
      createdAt: user.driverProfile.createdAt,
      updatedAt: user.driverProfile.updatedAt,
    };
  }

  async updateMe(
    firebaseUser: FirebaseUser,
    dto: UpdateDriverDto,
  ): Promise<DriverResponseDto> {
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

    if (dto.vehicleType !== undefined) {
      user.driverProfile.vehicleType = dto.vehicleType;
    }
    if (dto.vehicleBrand !== undefined) {
      user.driverProfile.vehicleBrand = dto.vehicleBrand;
    }
    if (dto.vehicleColor !== undefined) {
      user.driverProfile.vehicleColor = dto.vehicleColor;
    }
    if (dto.licensePlate !== undefined) {
      user.driverProfile.licensePlate = dto.licensePlate;
    }
    if (dto.communityHome !== undefined) {
      user.driverProfile.communityHome = dto.communityHome;
    }
    if (dto.bio !== undefined) {
      user.driverProfile.bio = dto.bio;
    }
    if (dto.areasOfOperation !== undefined) {
      user.driverProfile.areasOfOperation = dto.areasOfOperation;
    }

    await this.driverProfileRepository.save(user.driverProfile);

    return this.getMe(firebaseUser);
  }

  async getPublic(query: PublicDriversQueryDto): Promise<{
    drivers: PublicDriverResponseDto[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const queryBuilder = this.driverProfileRepository
      .createQueryBuilder('driver')
      .leftJoinAndSelect('driver.user', 'user')
      .leftJoinAndSelect('driver.presence', 'presence')
      .where('driver.isVerified = :isVerified', { isVerified: true });

    if (query.community) {
      queryBuilder.andWhere('driver.communityHome = :community', {
        community: query.community,
      });
    }

    if (query.vehicleType) {
      queryBuilder.andWhere('driver.vehicleType = :vehicleType', {
        vehicleType: query.vehicleType,
      });
    }

    if (query.online !== undefined) {
      queryBuilder.andWhere('presence.isOnline = :online', { online: query.online });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .select([
        'driver.id',
        'driver.vehicleType',
        'driver.vehicleBrand',
        'driver.vehicleColor',
        'driver.communityHome',
        'driver.averageRating',
        'driver.ratingCount',
        'user.id',
        'user.displayName',
        'user.photoUrl',
        'presence.isOnline',
        'presence.lastSeenAt',
        'presence.lastLat',
        'presence.lastLng',
      ])
      .orderBy('presence.lastSeenAt', 'DESC')
      .skip(query.offset || 0)
      .take(query.limit || 20);

    const results = await queryBuilder.getMany();

    const drivers: PublicDriverResponseDto[] = results.map((driver) => ({
      id: driver.id,
      userId: driver.user.id,
      displayName: driver.user.displayName,
      photoUrl: driver.user.photoUrl,
      vehicleType: driver.vehicleType,
      vehicleBrand: driver.vehicleBrand,
      vehicleColor: driver.vehicleColor,
      communityHome: driver.communityHome,
      averageRating: Number(driver.averageRating),
      ratingCount: driver.ratingCount,
      isOnline: driver.presence?.isOnline || false,
      lastSeenAt: driver.presence?.lastSeenAt || new Date(),
      lastLat: driver.presence?.lastLat || null,
      lastLng: driver.presence?.lastLng || null,
    }));

    return {
      drivers,
      total,
      limit: query.limit || 20,
      offset: query.offset || 0,
    };
  }
}

