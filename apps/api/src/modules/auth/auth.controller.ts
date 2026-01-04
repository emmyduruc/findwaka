import { Controller, Post, Body, UseGuards } from '@nestjs/common';
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
  constructor(private readonly authService: AuthService) {}

  @Post('bootstrap')
  @ApiOperation({ summary: 'Bootstrap user account' })
  @ApiResponse({ status: 200, type: BootstrapResponseDto })
  async bootstrap(
    @CurrentUser() firebaseUser: FirebaseUser,
    @Body() dto: BootstrapDto,
  ): Promise<BootstrapResponseDto> {
    return this.authService.bootstrap(firebaseUser, dto.role);
  }
}

