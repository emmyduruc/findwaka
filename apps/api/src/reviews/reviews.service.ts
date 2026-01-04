import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { DriverProfile } from '../entities/driver-profile.entity';
import { User } from '../entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { RequestUser } from '../common/guards/auth.guard';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(DriverProfile)
    private driverProfileRepository: Repository<DriverProfile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async create(
    driverId: string,
    user: RequestUser,
    dto: CreateReviewDto,
  ): Promise<Review> {
    const driverProfile = await this.driverProfileRepository.findOne({
      where: { id: driverId },
    });

    if (!driverProfile) {
      throw new NotFoundException('Driver not found');
    }

    const localUser = await this.userRepository.findOne({
      where: { firebaseUid: user.firebaseUid },
    });

    if (!localUser) {
      throw new NotFoundException('User not found');
    }

    return this.dataSource.transaction(async (manager) => {
      const review = manager.create(Review, {
        driverProfileId: driverId,
        passengerUserId: localUser.id,
        rating: dto.rating,
        comment: dto.comment,
      });

      const savedReview = await manager.save(review);

      const reviews = await manager.find(Review, {
        where: { driverProfileId: driverId },
      });

      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / reviews.length;
      const ratingCount = reviews.length;

      await manager.update(DriverProfile, driverId, {
        averageRating: Math.round(averageRating * 10) / 10,
        ratingCount,
      });

      return savedReview;
    });
  }

  async findAll(driverId: string): Promise<Review[]> {
    const driverProfile = await this.driverProfileRepository.findOne({
      where: { id: driverId },
    });

    if (!driverProfile) {
      throw new NotFoundException('Driver not found');
    }

    return this.reviewRepository.find({
      where: { driverProfileId: driverId },
      relations: ['passenger'],
      order: { createdAt: 'DESC' },
    });
  }
}

