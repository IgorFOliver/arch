import { expect } from '@jest/globals';
import { Role } from '@4basearch/domain-types';
import { ListMyTenantsUseCase } from './list-my-tenants.use-case';
import { ListUserTenantsUseCase } from '../../../tenants/application/use-cases/list-user-tenants.use-case';
import type { TenantRepository } from '../../../tenants/domain/repositories/tenant.repository';
import type { Tenant } from '../../../tenants/domain/entities/tenant.entity';
import type { Membership } from '../../../tenants/domain/entities/membership.entity';

describe('ListMyTenantsUseCase', () => {
  let listUserTenantsUseCase: jest.Mocked<ListUserTenantsUseCase>;
  let tenantRepository: jest.Mocked<TenantRepository>;
  let useCase: ListMyTenantsUseCase;

  const membershipIn = (tenantId: string, role: Role): Membership => ({
    id: `membership-${tenantId}`,
    userId: 'user-1',
    tenantId,
    role,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const tenantFor = (id: string): Tenant => ({
    id,
    name: `Tenant ${id}`,
    slug: id,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    listUserTenantsUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ListUserTenantsUseCase>;
    tenantRepository = {
      findById: jest.fn(),
      findBySlug: jest.fn(),
      create: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
    };
    useCase = new ListMyTenantsUseCase(
      listUserTenantsUseCase,
      tenantRepository,
    );
  });

  it('enriches every active Membership with its Tenant name/slug/status', async () => {
    listUserTenantsUseCase.execute.mockResolvedValue([
      membershipIn('tenant-a', Role.ADMIN),
      membershipIn('tenant-b', Role.USER),
    ]);
    tenantRepository.findById.mockImplementation((id) =>
      Promise.resolve(tenantFor(id)),
    );

    await expect(useCase.execute('user-1')).resolves.toEqual([
      {
        id: 'tenant-a',
        name: 'Tenant tenant-a',
        slug: 'tenant-a',
        status: 'ACTIVE',
        role: Role.ADMIN,
      },
      {
        id: 'tenant-b',
        name: 'Tenant tenant-b',
        slug: 'tenant-b',
        status: 'ACTIVE',
        role: Role.USER,
      },
    ]);
  });

  it('returns an empty list for a user with no active Membership anywhere', async () => {
    listUserTenantsUseCase.execute.mockResolvedValue([]);

    await expect(useCase.execute('user-1')).resolves.toEqual([]);
    expect(tenantRepository.findById).not.toHaveBeenCalled();
  });

  it('silently skips a Membership whose Tenant no longer resolves, rather than throwing', async () => {
    listUserTenantsUseCase.execute.mockResolvedValue([
      membershipIn('tenant-a', Role.ADMIN),
    ]);
    tenantRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('user-1')).resolves.toEqual([]);
  });
});
