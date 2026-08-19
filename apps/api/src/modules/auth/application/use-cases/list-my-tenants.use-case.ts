import { Inject, Injectable } from '@nestjs/common';
import type { Role } from '@4basearch/domain-types';
import { ListUserTenantsUseCase } from '../../../tenants/application/use-cases/list-user-tenants.use-case';
import {
  TENANT_REPOSITORY,
  type TenantRepository,
} from '../../../tenants/domain/repositories/tenant.repository';
import type { TenantStatus } from '../../../tenants/domain/entities/tenant.entity';

export interface MyTenantSummary {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  role: Role;
}

/**
 * The data source for a frontend tenant switcher: every Tenant the
 * caller has an active Membership in, enough to render a picker (name)
 * and to know what a switch would grant (role) — never used for
 * authorization itself, only to populate the UI the user picks a
 * `POST /auth/session/tenant` target from.
 */
@Injectable()
export class ListMyTenantsUseCase {
  constructor(
    private readonly listUserTenantsUseCase: ListUserTenantsUseCase,
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: TenantRepository,
  ) {}

  async execute(userId: string): Promise<MyTenantSummary[]> {
    const memberships = await this.listUserTenantsUseCase.execute(userId);
    const tenants = await Promise.all(
      memberships.map((membership) =>
        this.tenantRepository.findById(membership.tenantId),
      ),
    );

    return memberships.reduce<MyTenantSummary[]>(
      (summaries, membership, index) => {
        const tenant = tenants[index];
        if (tenant) {
          summaries.push({
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            status: tenant.status,
            role: membership.role,
          });
        }
        return summaries;
      },
      [],
    );
  }
}
