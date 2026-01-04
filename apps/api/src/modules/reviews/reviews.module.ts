import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { RolesGuard } from '../../guards/roles.guard';
import { Review } from '../../entities/review.entity';
import { DriverProfile } from '../../entities/driver-profile.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, DriverProfile, User])],
  controllers: [ReviewsController],
  providers: [ReviewsService, RolesGuard],
  exports: [ReviewsService],
})
export class ReviewsModule {}

