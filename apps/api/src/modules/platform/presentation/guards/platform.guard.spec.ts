import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { expect } from '@jest/globals';
import { PlatformRole } from '@4basearch/domain-types';
import { PlatformGuard } from './platform.guard';
import type { PlatformAdminRepository } from '../../domain/repositories/platform-admin.repository';
import type { PlatformAdmin } from '../../domain/entities/platform-admin.entity';
import type { User } from '../../../users/domain/entities/user.entity';

describe('PlatformGuard', () => {
  let reflector: jest.Mocked<Reflector>;
  let platformAdminRepository: jest.Mocked<PlatformAdminRepository>;
  let guard: PlatformGuard;

  const user: User = {
    id: 'user-1',
    email: 'admin@example.com',
    passwordHash: null,
    name: 'Platform Admin',
    company: null,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const platformAdmin: PlatformAdmin = {
    id: 'platform-admin-1',
    userId: user.id,
    role: PlatformRole.PLATFORM_ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const contextFor = (currentUser: User | undefined): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user: currentUser }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;
    platformAdminRepository = { findByUserId: jest.fn() };
    guard = new PlatformGuard(reflector, platformAdminRepository);
  });

  it('denies access when there is no authenticated user (SessionGuard did not run)', async () => {
    await expect(guard.canActivate(contextFor(undefined))).rejects.toThrow(
      UnauthorizedException,
    );
    expect(platformAdminRepository.findByUserId).not.toHaveBeenCalled();
  });

  it('denies access when the user has no PlatformAdmin grant', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    platformAdminRepository.findByUserId.mockResolvedValue(null);

    await expect(guard.canActivate(contextFor(user))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('allows access for a PLATFORM_ADMIN and attaches it to the request', async () => {
    reflector.getAllAndOverride.mockReturnValue([PlatformRole.PLATFORM_ADMIN]);
    platformAdminRepository.findByUserId.mockResolvedValue(platformAdmin);

    const request: { user?: User; platformAdmin?: PlatformAdmin } = {
      user,
    };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.platformAdmin).toEqual(platformAdmin);
  });

  it('is not satisfied by Tenant Membership authority — a Tenant ADMIN with no PlatformAdmin grant is still denied', async () => {
    // PlatformGuard never reads request.membership at all — its only
    // data source is PlatformAdminRepository — so a user who happens to
    // be a Tenant ADMIN somewhere else has no bearing on this check.
    reflector.getAllAndOverride.mockReturnValue(undefined);
    platformAdminRepository.findByUserId.mockResolvedValue(null);

    await expect(guard.canActivate(contextFor(user))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('looks up PlatformAdmin by the authenticated user id, never by TenantContext', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    platformAdminRepository.findByUserId.mockResolvedValue(platformAdmin);

    await guard.canActivate(contextFor(user));

    expect(platformAdminRepository.findByUserId).toHaveBeenCalledWith(user.id);
  });
});
