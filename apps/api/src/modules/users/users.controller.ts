import { Controller, Get, Patch, Post, Body, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { FirebaseAuthGuard } from '../../guards/firebase-auth.guard';
import { CurrentUser } from '../../decorators/user.decorator';
import { FirebaseUser } from '../../guards/firebase-auth.guard';
import { UpdateUserDto, UserResponseDto } from './dto/update-user.dto';
import { SwitchRoleDto } from './dto/switch-role.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async getMe(@CurrentUser() firebaseUser: FirebaseUser): Promise<UserResponseDto> {
    return this.usersService.getMe(firebaseUser);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async updateMe(
    @CurrentUser() firebaseUser: FirebaseUser,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateMe(firebaseUser, dto);
  }

  @Post('me/switch-role')
  @ApiOperation({ summary: 'Switch user role (irreversible from passenger to driver)' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async switchRole(
    @CurrentUser() firebaseUser: FirebaseUser,
    @Body() dto: SwitchRoleDto,
  ): Promise<UserResponseDto> {
    return this.usersService.switchRole(firebaseUser, dto.role);
  }
}

