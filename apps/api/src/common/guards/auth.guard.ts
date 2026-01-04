import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firebaseAdmin } from '../../app/firebase-admin';
import { User } from '../../entities/user.entity';
import { UserRole } from '@findwaka/shared';

export interface RequestUser {
  firebaseUid: string;
  email?: string;
  phone?: string;
  name?: string;
  roles?: string[];
  localUserId?: string;
  role?: UserRole;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      if (!firebaseAdmin.apps.length) {
        throw new Error('Firebase Admin not initialized');
      }

      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);

      const localUser = await this.userRepository.findOne({
        where: { firebaseUid: decodedToken.uid },
      });

      const user: RequestUser = {
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        phone: decodedToken.phone_number,
        name: decodedToken.name,
        roles: decodedToken.roles || [],
        localUserId: localUser?.id,
        role: localUser?.role,
      };

      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
