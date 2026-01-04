import { Controller, Put, Body, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PresenceService } from './presence.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { RequestUser } from '../common/guards/auth.guard';
import { UserRole } from '@findwaka/shared';
import { DriverPresence } from '../entities/driver-presence.entity';

@ApiTags('Presence')
@Controller('presence')
@UseGuards(RoleGuard)
@Roles(UserRole.DRIVER)
@ApiBearerAuth()
export class PresenceController {
  constructor(private readonly presenceService: PresenceService) {}

  @Put('me/online')
  @ApiOperation({ summary: 'Set driver online' })
  @ApiResponse({ type: DriverPresence })
  async setOnline(@CurrentUser() user: RequestUser): Promise<DriverPresence> {
    return this.presenceService.setOnline(user);
  }

  @Put('me/offline')
  @ApiOperation({ summary: 'Set driver offline' })
  @ApiResponse({ type: DriverPresence })
  async setOffline(@CurrentUser() user: RequestUser): Promise<DriverPresence> {
    return this.presenceService.setOffline(user);
  }

  @Put('me/location')
  @ApiOperation({ summary: 'Update driver location' })
  @ApiResponse({ type: DriverPresence })
  async updateLocation(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateLocationDto,
  ): Promise<DriverPresence> {
    return this.presenceService.updateLocation(user, dto);
  }
}

