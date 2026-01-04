import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRole } from '@findwaka/shared';
import { RequestUser } from '../common/guards/auth.guard';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async bootstrap(user: RequestUser): Promise<User> {
    let localUser = await this.userRepository.findOne({
      where: { firebaseUid: user.firebaseUid },
    });

    if (!localUser) {
      localUser = this.userRepository.create({
        firebaseUid: user.firebaseUid,
        email: user.email,
        phone: user.phone,
        displayName: user.name || user.email || user.phone || 'User',
        role: UserRole.PASSENGER,
        isActive: true,
      });

      localUser = await this.userRepository.save(localUser);
    } else {
      if (user.email && localUser.email !== user.email) {
        localUser.email = user.email;
      }
      if (user.phone && localUser.phone !== user.phone) {
        localUser.phone = user.phone;
      }
      if (user.name && localUser.displayName !== user.name) {
        localUser.displayName = user.name;
      }

      localUser = await this.userRepository.save(localUser);
    }

    return localUser;
  }
}

