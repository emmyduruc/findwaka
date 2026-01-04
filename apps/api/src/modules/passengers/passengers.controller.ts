import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PassengersService } from './passengers.service';
import { FirebaseAuthGuard } from '../../guards/firebase-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../guards/roles.guard';
import { UserRole } from '@waka/shared';
import { CurrentUser } from '../../decorators/user.decorator';
import { FirebaseUser } from '../../guards/firebase-auth.guard';
import { UpdatePassengerDto, PassengerResponseDto } from './dto/update-passenger.dto';

@ApiTags('passengers')
@Controller('passengers')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PassengersController {
  constructor(private readonly passengersService: PassengersService) {}

  @Get('me')
  @Roles(UserRole.PASSENGER)
  @ApiOperation({ summary: 'Get current passenger profile' })
  @ApiResponse({ status: 200, type: PassengerResponseDto })
  async getMe(@CurrentUser() firebaseUser: FirebaseUser): Promise<PassengerResponseDto> {
    return this.passengersService.getMe(firebaseUser);
  }

  @Patch('me')
  @Roles(UserRole.PASSENGER)
  @ApiOperation({ summary: 'Update current passenger profile' })
  @ApiResponse({ status: 200, type: PassengerResponseDto })
  async updateMe(
    @CurrentUser() firebaseUser: FirebaseUser,
    @Body() dto: UpdatePassengerDto,
  ): Promise<PassengerResponseDto> {
    return this.passengersService.updateMe(firebaseUser, dto);
  }
}

