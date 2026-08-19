import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '@4basearch/domain-types';
import { TenantGuard } from './tenant.guard';
import { ResolveTenantContextUseCase } from '../../application/use-cases/resolve-tenant-context.use-case';
import type { User } from '../../../users/domain/entities/user.entity';
import type { Membership } from '../../domain/entities/membership.entity';

describe('TenantGuard', () => {
  let resolveTenantContextUseCase: jest.Mocked<ResolveTenantContextUseCase>;
  let guard: TenantGuard;

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

  const membership: Membership = {
    id: 'membership-1',
    userId: 'user-1',
    tenantId: 'tenant-a',
    role: Role.ADMIN,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const contextFor = (
    currentUser: User | undefined,
    activeTenantId: string | null = null,
  ): { context: ExecutionContext; request: Record<string, unknown> } => {
    const request: Record<string, unknown> = {
      user: currentUser,
      activeTenantId,
    };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    return { context, request };
  };

  beforeEach(() => {
    resolveTenantContextUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ResolveTenantContextUseCase>;
    guard = new TenantGuard(resolveTenantContextUseCase);
  });

  it('denies access when there is no authenticated user', async () => {
    const { context } = contextFor(undefined);

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(resolveTenantContextUseCase.execute).not.toHaveBeenCalled();
  });

  it('propagates the failure when no tenant/membership can be resolved', async () => {
    resolveTenantContextUseCase.execute.mockRejectedValue(
      new ForbiddenException(
        'No active tenant could be resolved for this user.',
      ),
    );
    const { context } = contextFor(user);

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('attaches tenantContext and membership, then allows access', async () => {
    resolveTenantContextUseCase.execute.mockResolvedValue({
      tenantContext: { tenantId: 'tenant-a', userId: user.id },
      membership,
    });
    const { context, request } = contextFor(user, 'tenant-a');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.tenantContext).toEqual({
      tenantId: 'tenant-a',
      userId: user.id,
    });
    expect(request.membership).toEqual(membership);
    expect(resolveTenantContextUseCase.execute).toHaveBeenCalledWith({
      userId: user.id,
      activeTenantId: 'tenant-a',
      hostname: undefined,
      headers: undefined,
    });
  });

  it("reads the Current Tenant from the session (request.activeTenantId), never guessing when it's null", async () => {
    resolveTenantContextUseCase.execute.mockResolvedValue({
      tenantContext: { tenantId: 'tenant-a', userId: user.id },
      membership,
    });
    const { context } = contextFor(user, null);

    await guard.canActivate(context);

    expect(resolveTenantContextUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ activeTenantId: null }),
    );
  });
});
