import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SessionService } from '../session.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.sessionService.readCookie(request);

    if (!token) {
      throw new UnauthorizedException('No active session.');
    }

    const user = await this.sessionService.validate(token);
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
