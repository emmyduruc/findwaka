import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { firebaseAdmin } from './firebase-admin';

@Injectable()
export class AuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization?.split('Bearer ')[1];

        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        try {
            if (!firebaseAdmin.apps.length) {
                throw new Error("Firebase Admin not initialized");
            }
            const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
            request['user'] = decodedToken;
            return true;
        } catch (error) {
            console.error(error);
            throw new UnauthorizedException('Invalid token');
        }
    }
}
