import { Controller, Get, Post, Param, Body, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { FirebaseAuthGuard } from '../../guards/firebase-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../guards/roles.guard';
import { UserRole } from '@waka/shared';
import { CurrentUser } from '../../decorators/user.decorator';
import { FirebaseUser } from '../../guards/firebase-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';

@ApiTags('reviews')
@Controller('drivers')
export class ReviewsController {
  constructor(@Inject(ReviewsService) private readonly reviewsService: ReviewsService) {}

  @Post(':driverId/reviews')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.PASSENGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create review for driver' })
  @ApiResponse({ status: 201, type: ReviewResponseDto })
  async create(
    @CurrentUser() firebaseUser: FirebaseUser,
    @Param('driverId') driverId: string,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.create(firebaseUser, driverId, dto);
  }

  @Get(':driverId/reviews')
  @ApiOperation({ summary: 'Get reviews for driver' })
  @ApiResponse({ status: 200, type: [ReviewResponseDto] })
  async findAll(@Param('driverId') driverId: string): Promise<ReviewResponseDto[]> {
    return this.reviewsService.findAll(driverId);
  }
}

