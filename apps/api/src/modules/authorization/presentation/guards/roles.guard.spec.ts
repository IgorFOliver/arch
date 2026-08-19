import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@4basearch/domain-types';
import { RolesGuard } from './roles.guard';
import type { TenantContext } from '../../../tenants/domain/tenant-context';

describe('RolesGuard', () => {
  let reflector: jest.Mocked<Reflector>;
  let guard: RolesGuard;

  const tenantContext: TenantContext = {
    userId: 'user-1',
    tenantId: 'tenant-a',
    membershipId: 'membership-1',
    role: Role.USER,
  };

  const contextFor = (
    currentTenantContext: TenantContext | undefined,
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ tenantContext: currentTenantContext }),
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

    expect(guard.canActivate(contextFor(tenantContext))).toBe(true);
  });

  it('allows access when the TenantContext has one of the required roles', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

    expect(
      guard.canActivate(contextFor({ ...tenantContext, role: Role.ADMIN })),
    ).toBe(true);
  });

  it('denies access when the TenantContext does not have the required role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

    expect(() => guard.canActivate(contextFor(tenantContext))).toThrow(
      ForbiddenException,
    );
  });

  it('denies access when there is no TenantContext on the request (TenantGuard did not run, or resolution failed)', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

    expect(() => guard.canActivate(contextFor(undefined))).toThrow(
      ForbiddenException,
    );
  });
});
