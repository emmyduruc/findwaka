import { Controller, Post, Body, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from '../../guards/firebase-auth.guard';
import { CurrentUser } from '../../decorators/user.decorator';
import { FirebaseUser } from '../../guards/firebase-auth.guard';
import { BootstrapDto, BootstrapResponseDto } from './dto/bootstrap.dto';

@ApiTags('auth')
@Controller('auth')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth()
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('initialize')
  @ApiOperation({ summary: 'Initialize user account (sign in or sign up)' })
  @ApiResponse({ status: 200, type: BootstrapResponseDto })
  async initializeUser(
    @CurrentUser() firebaseUser: FirebaseUser,
    @Body() dto: BootstrapDto,
  ): Promise<BootstrapResponseDto> {
    return this.authService.initializeUser(firebaseUser, dto.role);
  }
}

