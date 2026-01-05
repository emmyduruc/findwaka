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
    const authHeader = request.headers.authorization || request.headers.Authorization;

    console.log('FirebaseAuthGuard - Received headers:', {
      authorization: request.headers.authorization,
      Authorization: request.headers.Authorization,
      allHeaders: Object.keys(request.headers),
    });

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('FirebaseAuthGuard - Missing or invalid authorization header');
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    console.log('FirebaseAuthGuard - Token received (first 50 chars):', token.substring(0, 50) + '...');

    try {
      const app = getFirebaseApp();
      if (!app) {
        console.error('FirebaseAuthGuard - Firebase app is not initialized');
        throw new UnauthorizedException('Firebase not initialized');
      }
      const decodedToken = await app.auth().verifyIdToken(token);
      console.log('FirebaseAuthGuard - Token verified successfully for user:', decodedToken.uid);

      const user: FirebaseUser = {
        firebaseUid: decodedToken.uid,
        email: decodedToken.email || null,
        phone: decodedToken.phone_number || null,
        name: decodedToken.name || null,
        roles: [],
      };

      request.user = user;
      return true;
    } catch (error: any) {
      console.error('FirebaseAuthGuard - Token verification failed:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Error code:', error.code);
      
      // Check if Firebase is properly initialized
      try {
        const app = getFirebaseApp();
        if (!app) {
          throw new UnauthorizedException('Firebase Admin SDK not initialized');
        }
      } catch (initError: any) {
        console.error('Firebase initialization check failed:', initError.message);
        throw new UnauthorizedException(`Firebase not properly configured: ${initError.message}`);
      }
      
      throw new UnauthorizedException(`Invalid Firebase token: ${error.message}`);
    }
  }
}

