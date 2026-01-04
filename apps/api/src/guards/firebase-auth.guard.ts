import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { getFirebaseApp } from '../config/firebase.config';
import * as admin from 'firebase-admin';

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
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    try {
      const app = getFirebaseApp();
      const decodedToken = await app.auth().verifyIdToken(token);

      const user: FirebaseUser = {
        firebaseUid: decodedToken.uid,
        email: decodedToken.email || null,
        phone: decodedToken.phone_number || null,
        name: decodedToken.name || null,
        roles: [],
      };

      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }
}

