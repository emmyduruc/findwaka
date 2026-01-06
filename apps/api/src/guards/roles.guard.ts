import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import 'reflect-metadata';
import { UserRole } from '@waka/shared';
import { FirebaseUser } from './firebase-auth.guard';
import { User } from '../entities/user.entity';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get metadata directly using reflect-metadata
    const handler = context.getHandler();
    const controller = context.getClass();
    
    // Try to get from handler first, then from controller
    let requiredRoles = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[] | undefined;
    if (!requiredRoles) {
      requiredRoles = Reflect.getMetadata(ROLES_KEY, controller) as UserRole[] | undefined;
    }

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: FirebaseUser = request.user;

    if (!user || !user.localUserId) {
      throw new ForbiddenException('User not found or not bootstrapped');
    }

    const dbUser = await this.userRepository.findOne({
      where: { id: user.localUserId },
    });

    if (!dbUser) {
      throw new ForbiddenException('User not found');
    }

    if (!requiredRoles.includes(dbUser.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    user.roles = [dbUser.role];
    return true;
  }
}

