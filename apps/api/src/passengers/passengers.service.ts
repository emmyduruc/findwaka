import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PassengerProfile } from '../entities/passenger-profile.entity';
import { User } from '../entities/user.entity';
import { UpdatePassengerDto } from './dto/update-passenger.dto';
import { RequestUser } from '../common/guards/auth.guard';

@Injectable()
export class PassengersService {
  constructor(
    @InjectRepository(PassengerProfile)
    private passengerProfileRepository: Repository<PassengerProfile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getMe(user: RequestUser): Promise<PassengerProfile> {
    const localUser = await this.userRepository.findOne({
      where: { firebaseUid: user.firebaseUid },
      relations: ['passengerProfile'],
    });

    if (!localUser) {
      throw new Error('User not found');
    }

    if (!localUser.passengerProfile) {
      const profile = this.passengerProfileRepository.create({
        userId: localUser.id,
      });
      return this.passengerProfileRepository.save(profile);
    }

    return localUser.passengerProfile;
  }

  async updateMe(
    user: RequestUser,
    dto: UpdatePassengerDto,
  ): Promise<PassengerProfile> {
    const profile = await this.getMe(user);

    if (dto.defaultCommunity !== undefined) {
      profile.defaultCommunity = dto.defaultCommunity;
    }

    return this.passengerProfileRepository.save(profile);
  }
}

