import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { FirebaseUser } from '../../guards/firebase-auth.guard';
import { UpdateUserDto, UserResponseDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
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

    await this.userRepository.save(user);

    return this.getMe(firebaseUser);
  }
}

