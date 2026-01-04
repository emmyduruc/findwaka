import { Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from '../common/decorators/user.decorator';
import { RequestUser } from '../common/guards/auth.guard';
import { BootstrapResponseDto } from './dto/bootstrap.dto';

@ApiTags('Auth')
@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('bootstrap')
  @ApiOperation({ summary: 'Bootstrap user account' })
  @ApiResponse({ type: BootstrapResponseDto })
  async bootstrap(@CurrentUser() user: RequestUser): Promise<BootstrapResponseDto> {
    const localUser = await this.authService.bootstrap(user);
    return {
      userId: localUser.id,
      firebaseUid: localUser.firebaseUid,
      role: localUser.role,
      email: localUser.email,
      phone: localUser.phone,
      displayName: localUser.displayName,
    };
  }
}

