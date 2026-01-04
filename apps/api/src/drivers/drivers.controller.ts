import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { PublicDriverDto } from './dto/public-driver.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { RequestUser } from '../common/guards/auth.guard';
import { UserRole, VehicleType } from '@findwaka/shared';
import { DriverProfile } from '../entities/driver-profile.entity';

@ApiTags('Drivers')
@Controller('drivers')
@UseGuards(AuthGuard)
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post('me')
  @UseGuards(RoleGuard)
  @Roles(UserRole.DRIVER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create driver profile' })
  @ApiResponse({ type: DriverProfile })
  async createProfile(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateDriverDto,
  ): Promise<DriverProfile> {
    return this.driversService.createProfile(user, dto);
  }

  @Get('me')
  @UseGuards(RoleGuard)
  @Roles(UserRole.DRIVER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current driver profile' })
  @ApiResponse({ type: DriverProfile })
  async getMe(@CurrentUser() user: RequestUser): Promise<DriverProfile> {
    return this.driversService.getMe(user);
  }

  @Patch('me')
  @UseGuards(RoleGuard)
  @Roles(UserRole.DRIVER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current driver profile' })
  @ApiResponse({ type: DriverProfile })
  async updateMe(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateDriverDto,
  ): Promise<DriverProfile> {
    return this.driversService.updateMe(user, dto);
  }

  @Get('public')
  @ApiOperation({ summary: 'Get public driver list for discovery' })
  @ApiResponse({ type: [PublicDriverDto] })
  @ApiQuery({ name: 'community', required: false })
  @ApiQuery({ name: 'vehicleType', required: false, enum: VehicleType })
  @ApiQuery({ name: 'online', required: false, type: Boolean })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async findPublic(
    @Query('community') community?: string,
    @Query('vehicleType') vehicleType?: VehicleType,
    @Query('online') online?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset = 0,
  ): Promise<PublicDriverDto[]> {
    return this.driversService.findPublic(
      community,
      vehicleType,
      online === 'true' ? true : online === 'false' ? false : undefined,
      limit,
      offset,
    );
  }
}

