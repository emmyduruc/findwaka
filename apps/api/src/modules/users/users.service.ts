import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { DriverProfile } from '../../entities/driver-profile.entity';
import { DriverPresence } from '../../entities/driver-presence.entity';
import { FirebaseUser } from '../../guards/firebase-auth.guard';
import { UpdateUserDto, UserResponseDto } from './dto/update-user.dto';
import { UserRole } from '@waka/shared';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(DriverProfile)
    private driverProfileRepository: Repository<DriverProfile>,
    @InjectRepository(DriverPresence)
    private driverPresenceRepository: Repository<DriverPresence>,
  ) {}

  async getMe(firebaseUser: FirebaseUser): Promise<UserResponseDto> {
    if (!firebaseUser.localUserId) {
      throw new NotFoundException('User not bootstrapped');
    }

    const user = await this.userRepository.findOne({
      where: { id: firebaseUser.localUserId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      role: user.role,
      email: user.email,
      phone: user.phone,
      displayName: user.displayName,
      photoUrl: user.photoUrl,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateMe(
    firebaseUser: FirebaseUser,
    dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    if (!firebaseUser.localUserId) {
      throw new NotFoundException('User not bootstrapped');
    }

    const user = await this.userRepository.findOne({
      where: { id: firebaseUser.localUserId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.displayName !== undefined) {
      user.displayName = dto.displayName;
    }
    if (dto.photoUrl !== undefined) {
      user.photoUrl = dto.photoUrl;
    }
    if (dto.pushNotificationToken !== undefined) {
      user.pushNotificationToken = dto.pushNotificationToken;
    }

    await this.userRepository.save(user);

    return this.getMe(firebaseUser);
  }

  async updateFCMToken(
    firebaseUser: FirebaseUser,
    token: string,
  ): Promise<UserResponseDto> {
    if (!firebaseUser.localUserId) {
      throw new NotFoundException('User not bootstrapped');
    }

    const user = await this.userRepository.findOne({
      where: { id: firebaseUser.localUserId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.pushNotificationToken = token;
    await this.userRepository.save(user);

    return this.getMe(firebaseUser);
  }

  async clearFCMToken(firebaseUser: FirebaseUser): Promise<UserResponseDto> {
    if (!firebaseUser.localUserId) {
      throw new NotFoundException('User not bootstrapped');
    }

    const user = await this.userRepository.findOne({
      where: { id: firebaseUser.localUserId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.pushNotificationToken = null;
    await this.userRepository.save(user);

    return this.getMe(firebaseUser);
  }

  async switchRole(
    firebaseUser: FirebaseUser,
    newRole: UserRole,
  ): Promise<UserResponseDto> {
    let user: User | null = null;

    if (firebaseUser.localUserId) {
      user = await this.userRepository.findOne({
        where: { id: firebaseUser.localUserId },
      });
    } else {
      user = await this.userRepository.findOne({
        where: { firebaseUid: firebaseUser.firebaseUid },
      });
      
      if (user) {
        firebaseUser.localUserId = user.id;
      }
    }

    if (!user) {
      throw new NotFoundException('User not found. Please complete sign up first.');
    }

    if (user.role === newRole) {
      return this.getMe(firebaseUser);
    }

    if (newRole === UserRole.DRIVER && user.role === UserRole.PASSENGER) {
      const driverProfile = await this.driverProfileRepository.findOne({
        where: { userId: user.id },
      });

      if (!driverProfile) {
        user.role = newRole;
        await this.userRepository.save(user);
        firebaseUser.localUserId = user.id;
        return this.getMe(firebaseUser);
      }
    }

    user.role = newRole;
    await this.userRepository.save(user);

    return this.getMe(firebaseUser);
  }
}

