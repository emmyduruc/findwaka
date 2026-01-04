import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestUser } from '../common/guards/auth.guard';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { firebaseUid } });
  }

  async updateMe(user: RequestUser, dto: UpdateUserDto): Promise<User> {
    const localUser = await this.findByFirebaseUid(user.firebaseUid);
    if (!localUser) {
      throw new NotFoundException('User not found');
    }

    if (dto.displayName !== undefined) {
      localUser.displayName = dto.displayName;
    }
    if (dto.photoUrl !== undefined) {
      localUser.photoUrl = dto.photoUrl;
    }

    return this.userRepository.save(localUser);
  }

  async getMe(user: RequestUser): Promise<User> {
    const localUser = await this.findByFirebaseUid(user.firebaseUid);
    if (!localUser) {
      throw new NotFoundException('User not found');
    }
    return localUser;
  }
}

