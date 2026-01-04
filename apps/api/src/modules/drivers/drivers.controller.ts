import { Controller, Get, Post, Patch, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { FirebaseAuthGuard } from '../../guards/firebase-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../guards/roles.guard';
import { UserRole } from '@waka/shared';
import { CurrentUser } from '../../decorators/user.decorator';
import { FirebaseUser } from '../../guards/firebase-auth.guard';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { DriverResponseDto, PublicDriverResponseDto } from './dto/driver-response.dto';
import { PublicDriversQueryDto } from './dto/public-drivers-query.dto';

@ApiTags('drivers')
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post('me')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create driver profile' })
  @ApiResponse({ status: 201, type: DriverResponseDto })
  async createMe(
    @CurrentUser() firebaseUser: FirebaseUser,
    @Body() dto: CreateDriverDto,
  ): Promise<DriverResponseDto> {
    return this.driversService.createMe(firebaseUser, dto);
  }

  @Get('me')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current driver profile' })
  @ApiResponse({ status: 200, type: DriverResponseDto })
  async getMe(@CurrentUser() firebaseUser: FirebaseUser): Promise<DriverResponseDto> {
    return this.driversService.getMe(firebaseUser);
  }

  @Patch('me')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current driver profile' })
  @ApiResponse({ status: 200, type: DriverResponseDto })
  async updateMe(
    @CurrentUser() firebaseUser: FirebaseUser,
    @Body() dto: UpdateDriverDto,
  ): Promise<DriverResponseDto> {
    return this.driversService.updateMe(firebaseUser, dto);
  }

  @Get('public')
  @ApiOperation({ summary: 'Get public driver list for discovery' })
  @ApiResponse({ status: 200 })
  async getPublic(@Query() query: PublicDriversQueryDto) {
    return this.driversService.getPublic(query);
  }
}

