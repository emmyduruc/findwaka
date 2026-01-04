import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(): { message: string; status: string } {
    return { message: 'LocalRide Hub API', status: 'ok' };
  }
}
