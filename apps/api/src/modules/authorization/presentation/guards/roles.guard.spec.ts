import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@4basearch/domain-types';
import { RolesGuard } from './roles.guard';
import type { Membership } from '../../../tenants/domain/entities/membership.entity';

describe('RolesGuard', () => {
  let reflector: jest.Mocked<Reflector>;
  let guard: RolesGuard;

  const membership: Membership = {
    id: 'membership-1',
    userId: 'user-1',
    tenantId: 'tenant-a',
    role: Role.USER,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const contextFor = (
    currentMembership: Membership | undefined,
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ membership: currentMembership }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;
    guard = new RolesGuard(reflector);
  });

  it('allows access when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(contextFor(membership))).toBe(true);
  });

  it('allows access when the Membership has one of the required roles', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

    expect(
      guard.canActivate(contextFor({ ...membership, role: Role.ADMIN })),
    ).toBe(true);
  });

  it('denies access when the Membership does not have the required role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

    expect(() => guard.canActivate(contextFor(membership))).toThrow(
      ForbiddenException,
    );
  });

  it('denies access when there is no Membership on the request (TenantGuard did not run, or resolution failed)', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

    expect(() => guard.canActivate(contextFor(undefined))).toThrow(
      ForbiddenException,
    );
  });
});
