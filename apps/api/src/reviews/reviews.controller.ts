import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { RequestUser } from '../common/guards/auth.guard';
import { UserRole } from '@findwaka/shared';
import { Review } from '../entities/review.entity';

@ApiTags('Reviews')
@Controller('drivers/:driverId/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.PASSENGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create review for driver' })
  @ApiResponse({ type: Review })
  async create(
    @Param('driverId') driverId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateReviewDto,
  ): Promise<Review> {
    return this.reviewsService.create(driverId, user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reviews for driver' })
  @ApiResponse({ type: [Review] })
  async findAll(@Param('driverId') driverId: string): Promise<Review[]> {
    return this.reviewsService.findAll(driverId);
  }
}

