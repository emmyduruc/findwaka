import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Review } from '../../entities/review.entity';
import { DriverProfile } from '../../entities/driver-profile.entity';
import { User } from '../../entities/user.entity';
import { UserRole } from '@waka/shared';
import { FirebaseUser } from '../../guards/firebase-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';

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
    firebaseUser: FirebaseUser,
    driverId: string,
    dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    if (!firebaseUser.localUserId) {
      throw new NotFoundException('User not bootstrapped');
    }

    const user = await this.userRepository.findOne({
      where: { id: firebaseUser.localUserId },
    });

    if (!user || user.role !== UserRole.PASSENGER) {
      throw new ForbiddenException('Only passengers can create reviews');
    }

    const driverProfile = await this.driverProfileRepository.findOne({
      where: { id: driverId },
    });

    if (!driverProfile) {
      throw new NotFoundException('Driver profile not found');
    }

    const existingReview = await this.reviewRepository.findOne({
      where: {
        driverProfileId: driverId,
        passengerUserId: user.id,
      },
      order: { createdAt: 'DESC' },
    });

    if (existingReview) {
      const daysSinceReview =
        (Date.now() - existingReview.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceReview < 30) {
        throw new BadRequestException('Can only review once per 30 days');
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const review = this.reviewRepository.create({
        driverProfileId: driverId,
        passengerUserId: user.id,
        rating: dto.rating,
        comment: dto.comment || null,
      });

      const saved = await queryRunner.manager.save(review);

      const allReviews = await queryRunner.manager.find(Review, {
        where: { driverProfileId: driverId },
      });

      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / allReviews.length;
      const ratingCount = allReviews.length;

      driverProfile.averageRating = Number(averageRating.toFixed(1));
      driverProfile.ratingCount = ratingCount;

      await queryRunner.manager.save(driverProfile);

      await queryRunner.commitTransaction();

      return {
        id: saved.id,
        driverProfileId: saved.driverProfileId,
        passengerUserId: saved.passengerUserId,
        passengerDisplayName: user.displayName,
        rating: saved.rating,
        comment: saved.comment,
        createdAt: saved.createdAt,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(driverId: string): Promise<ReviewResponseDto[]> {
    const driverProfile = await this.driverProfileRepository.findOne({
      where: { id: driverId },
    });

    if (!driverProfile) {
      throw new NotFoundException('Driver profile not found');
    }

    const reviews = await this.reviewRepository.find({
      where: { driverProfileId: driverId },
      relations: ['passengerUser'],
      order: { createdAt: 'DESC' },
    });

    return reviews.map((review) => ({
      id: review.id,
      driverProfileId: review.driverProfileId,
      passengerUserId: review.passengerUserId,
      passengerDisplayName: review.passengerUser.displayName,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    }));
  }
}

