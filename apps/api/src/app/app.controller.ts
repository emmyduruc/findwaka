import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('health')
  getHealth() {
    return { status: 'ok' };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getMe(@Request() req) {
    return req.user;
  }
}
