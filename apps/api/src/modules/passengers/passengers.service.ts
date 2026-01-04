import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PassengerProfile } from '../../entities/passenger-profile.entity';
import { User } from '../../entities/user.entity';
import { UserRole } from '@waka/shared';
import { FirebaseUser } from '../../guards/firebase-auth.guard';
import { UpdatePassengerDto, PassengerResponseDto } from './dto/update-passenger.dto';

@Injectable()
export class PassengersService {
  constructor(
    @InjectRepository(PassengerProfile)
    private passengerProfileRepository: Repository<PassengerProfile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getMe(firebaseUser: FirebaseUser): Promise<PassengerResponseDto> {
    if (!firebaseUser.localUserId) {
      throw new NotFoundException('User not bootstrapped');
    }

    const user = await this.userRepository.findOne({
      where: { id: firebaseUser.localUserId },
      relations: ['passengerProfile'],
    });

    if (!user || user.role !== UserRole.PASSENGER) {
      throw new ForbiddenException('User is not a passenger');
    }

    if (!user.passengerProfile) {
      throw new NotFoundException('Passenger profile not found');
    }

    return {
      id: user.passengerProfile.id,
      userId: user.passengerProfile.userId,
      defaultCommunity: user.passengerProfile.defaultCommunity,
      createdAt: user.passengerProfile.createdAt,
      updatedAt: user.passengerProfile.updatedAt,
    };
  }

  async updateMe(
    firebaseUser: FirebaseUser,
    dto: UpdatePassengerDto,
  ): Promise<PassengerResponseDto> {
    if (!firebaseUser.localUserId) {
      throw new NotFoundException('User not bootstrapped');
    }

    const user = await this.userRepository.findOne({
      where: { id: firebaseUser.localUserId },
      relations: ['passengerProfile'],
    });

    if (!user || user.role !== UserRole.PASSENGER) {
      throw new ForbiddenException('User is not a passenger');
    }

    if (!user.passengerProfile) {
      throw new NotFoundException('Passenger profile not found');
    }

    if (dto.defaultCommunity !== undefined) {
      user.passengerProfile.defaultCommunity = dto.defaultCommunity;
      await this.passengerProfileRepository.save(user.passengerProfile);
    }

    return this.getMe(firebaseUser);
  }
}

