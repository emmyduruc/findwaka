import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '@waka/shared';
import { FirebaseUser } from './firebase-auth.guard';
import { User } from '../entities/user.entity';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

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

