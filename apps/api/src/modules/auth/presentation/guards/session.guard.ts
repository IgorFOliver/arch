import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ValidateSessionUseCase } from '../../application/use-cases/validate-session.use-case';
import { readSessionCookie } from '../../infrastructure/cookies/session-cookie';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly validateSessionUseCase: ValidateSessionUseCase,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = readSessionCookie(request);

    if (!token) {
      throw new UnauthorizedException('No active session.');
    }

    const user = await this.validateSessionUseCase.execute(token);
    if (!user) {
      throw new UnauthorizedException('Session expired or invalid.');
    }

    // A deactivated account's session is otherwise still valid (not
    // expired), so this must be checked separately from session validity:
    // it blocks every already-authenticated request, not just new logins.
    if (!user.active) {
      throw new ForbiddenException('Your account has been blocked.');
    }

    request.user = user;
    return true;
  }
}
