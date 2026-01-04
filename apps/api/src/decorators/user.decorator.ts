import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FirebaseUser } from '../guards/firebase-auth.guard';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): FirebaseUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

