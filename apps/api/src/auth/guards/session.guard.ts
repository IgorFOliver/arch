import {
  CanActivate,
  ExecutionContext,
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

    request.user = user;
    return true;
  }
}
