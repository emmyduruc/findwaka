import { Controller, Put, Body, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PresenceService } from './presence.service';
import { FirebaseAuthGuard } from '../../guards/firebase-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../guards/roles.guard';
import { UserRole } from '@waka/shared';
import { CurrentUser } from '../../decorators/user.decorator';
import { FirebaseUser } from '../../guards/firebase-auth.guard';
import { UpdateLocationDto } from './dto/update-location.dto';

@ApiTags('presence')
@Controller('presence')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PresenceController {
  constructor(@Inject(PresenceService) private readonly presenceService: PresenceService) {}

  @Put('me/online')
  @Roles(UserRole.DRIVER)
  @ApiOperation({ summary: 'Set driver online' })
  @ApiResponse({ status: 200 })
  async setOnline(@CurrentUser() firebaseUser: FirebaseUser): Promise<{ success: boolean }> {
    await this.presenceService.setOnline(firebaseUser);
    return { success: true };
  }

  @Put('me/offline')
  @Roles(UserRole.DRIVER)
  @ApiOperation({ summary: 'Set driver offline' })
  @ApiResponse({ status: 200 })
  async setOffline(@CurrentUser() firebaseUser: FirebaseUser): Promise<{ success: boolean }> {
    await this.presenceService.setOffline(firebaseUser);
    return { success: true };
  }

  @Put('me/location')
  @Roles(UserRole.DRIVER)
  @ApiOperation({ summary: 'Update driver location' })
  @ApiResponse({ status: 200 })
  async updateLocation(
    @CurrentUser() firebaseUser: FirebaseUser,
    @Body() dto: UpdateLocationDto,
  ): Promise<{ success: boolean }> {
    await this.presenceService.updateLocation(firebaseUser, dto);
    return { success: true };
  }
}

