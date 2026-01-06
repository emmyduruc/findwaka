import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getFirebaseApp } from '../config/firebase.config';
import * as admin from 'firebase-admin';
import { User } from '../entities/user.entity';

export interface FirebaseUser {
  firebaseUid: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  roles: string[];
  localUserId?: string;
}

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization || request.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.error('Missing or invalid authorization header');
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    this.logger.debug(`Token received (first 50 chars): ${token.substring(0, 50)}...`);

    try {
      const app = getFirebaseApp();
      if (!app) {
        this.logger.error('Firebase app is not initialized');
        throw new UnauthorizedException('Firebase not initialized');
      }
      const decodedToken = await app.auth().verifyIdToken(token);
      this.logger.log(`Token verified successfully for user: ${decodedToken.uid}`);

      // Fetch local user from database
      const localUser = await this.userRepository.findOne({
        where: { firebaseUid: decodedToken.uid },
      });

      const user: FirebaseUser = {
        firebaseUid: decodedToken.uid,
        email: decodedToken.email || null,
        phone: decodedToken.phone_number || null,
        name: decodedToken.name || null,
        roles: [],
      };

      if (localUser) {
        user.localUserId = localUser.id;
        user.roles = [localUser.role];
      }

      request.user = user;
      return true;
    } catch (error: any) {
      this.logger.error(`Token verification failed: ${error.message}`, error.stack);
      this.logger.debug(`Error code: ${error.code}`);
      
      // Check if Firebase is properly initialized
      try {
        const app = getFirebaseApp();
        if (!app) {
          throw new UnauthorizedException('Firebase Admin SDK not initialized');
        }
      } catch (initError: any) {
        this.logger.error(`Firebase initialization check failed: ${initError.message}`);
        throw new UnauthorizedException(`Firebase not properly configured: ${initError.message}`);
      }
      
      throw new UnauthorizedException(`Invalid Firebase token: ${error.message}`);
    }
  }
}

