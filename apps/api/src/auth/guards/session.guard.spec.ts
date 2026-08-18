import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '@prisma/client';
import { SessionGuard } from './session.guard';
import { SessionService } from '../session.service';

describe('SessionGuard', () => {
  let sessionService: jest.Mocked<SessionService>;
  let guard: SessionGuard;

  const user: User = {
    id: 'user-1',
    email: 'dev@example.com',
    passwordHash: null,
    name: 'Dev User',
    company: null,
    role: 'USER',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const contextFor = (token: string | undefined): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: (): Partial<Request> & { user?: User } => ({
          cookies: token ? { arch_session: token } : {},
        }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    sessionService = {
      readCookie: jest.fn(),
      validate: jest.fn(),
    } as unknown as jest.Mocked<SessionService>;
    guard = new SessionGuard(sessionService);
  });

  it('denies access when there is no session cookie', async () => {
    sessionService.readCookie.mockReturnValue(undefined);

    await expect(guard.canActivate(contextFor(undefined))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('denies access when the session is expired or unknown', async () => {
    sessionService.readCookie.mockReturnValue('token');
    sessionService.validate.mockResolvedValue(null);

    await expect(guard.canActivate(contextFor('token'))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('denies access when the account has been deactivated', async () => {
    sessionService.readCookie.mockReturnValue('token');
    sessionService.validate.mockResolvedValue({ ...user, active: false });

    await expect(guard.canActivate(contextFor('token'))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('allows access and attaches the user for an active account', async () => {
    sessionService.readCookie.mockReturnValue('token');
    sessionService.validate.mockResolvedValue(user);
    const request: Partial<Request> & { user?: User } = {
      cookies: { arch_session: 'token' },
    };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual(user);
  });
});
