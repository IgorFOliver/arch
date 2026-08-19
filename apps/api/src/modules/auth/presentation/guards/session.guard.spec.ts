import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SessionGuard } from './session.guard';
import { ValidateSessionUseCase } from '../../application/use-cases/validate-session.use-case';
import type { User } from '../../../users/domain/entities/user.entity';

describe('SessionGuard', () => {
  let validateSessionUseCase: jest.Mocked<ValidateSessionUseCase>;
  let guard: SessionGuard;

  const user: User = {
    id: 'user-1',
    email: 'dev@example.com',
    passwordHash: null,
    name: 'Dev User',
    company: null,
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
    validateSessionUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ValidateSessionUseCase>;
    guard = new SessionGuard(validateSessionUseCase);
  });

  it('denies access when there is no session cookie', async () => {
    await expect(guard.canActivate(contextFor(undefined))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('denies access when the session is expired or unknown', async () => {
    validateSessionUseCase.execute.mockResolvedValue(null);

    await expect(guard.canActivate(contextFor('token'))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('denies access when the account has been deactivated', async () => {
    validateSessionUseCase.execute.mockResolvedValue({
      user: { ...user, active: false },
      activeTenantId: null,
    });

    await expect(guard.canActivate(contextFor('token'))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('allows access and attaches the user + activeTenantId for an active account', async () => {
    validateSessionUseCase.execute.mockResolvedValue({
      user,
      activeTenantId: 'tenant-a',
    });
    const request: Partial<Request> & {
      user?: User;
      activeTenantId?: string | null;
      sessionToken?: string;
    } = {
      cookies: { arch_session: 'token' },
    };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual(user);
    expect(request.activeTenantId).toBe('tenant-a');
    expect(request.sessionToken).toBe('token');
  });
});
