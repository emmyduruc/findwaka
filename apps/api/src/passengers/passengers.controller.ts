import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PassengersService } from './passengers.service';
import { UpdatePassengerDto } from './dto/update-passenger.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { RequestUser } from '../common/guards/auth.guard';
import { UserRole } from '@findwaka/shared';
import { PassengerProfile } from '../entities/passenger-profile.entity';

@ApiTags('Passengers')
@Controller('passengers')
@UseGuards(RoleGuard)
@ApiBearerAuth()
export class PassengersController {
  constructor(private readonly passengersService: PassengersService) {}

  @Get('me')
  @Roles(UserRole.PASSENGER)
  @ApiOperation({ summary: 'Get current passenger profile' })
  @ApiResponse({ type: PassengerProfile })
  async getMe(@CurrentUser() user: RequestUser): Promise<PassengerProfile> {
    return this.passengersService.getMe(user);
  }

  @Patch('me')
  @Roles(UserRole.PASSENGER)
  @ApiOperation({ summary: 'Update current passenger profile' })
  @ApiResponse({ type: PassengerProfile })
  async updateMe(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdatePassengerDto,
  ): Promise<PassengerProfile> {
    return this.passengersService.updateMe(user, dto);
  }
}

