import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module';
import { AuditModule } from '../audit/audit.module';
import { TENANT_REPOSITORY } from './domain/repositories/tenant.repository';
import { MEMBERSHIP_REPOSITORY } from './domain/repositories/membership.repository';
import { TENANT_RESOLVER } from './domain/ports/tenant-resolver';
import { PrismaTenantRepository } from './infrastructure/persistence/prisma/prisma-tenant.repository';
import { PrismaMembershipRepository } from './infrastructure/persistence/prisma/prisma-membership.repository';
import { MembershipTenantResolver } from './infrastructure/resolvers/membership-tenant.resolver';
import { CreateTenantUseCase } from './application/use-cases/create-tenant.use-case';
import { CreateMembershipUseCase } from './application/use-cases/create-membership.use-case';
import { RevokeMembershipUseCase } from './application/use-cases/revoke-membership.use-case';
import { ListTenantMembersUseCase } from './application/use-cases/list-tenant-members.use-case';
import { ListUserTenantsUseCase } from './application/use-cases/list-user-tenants.use-case';
import { ResolveTenantContextUseCase } from './application/use-cases/resolve-tenant-context.use-case';
import { TenantGuard } from './presentation/guards/tenant.guard';

@Module({
  imports: [AuthorizationModule, AuditModule],
  providers: [
    { provide: TENANT_REPOSITORY, useClass: PrismaTenantRepository },
    { provide: MEMBERSHIP_REPOSITORY, useClass: PrismaMembershipRepository },
    { provide: TENANT_RESOLVER, useClass: MembershipTenantResolver },
    CreateTenantUseCase,
    CreateMembershipUseCase,
    RevokeMembershipUseCase,
    ListTenantMembersUseCase,
    ListUserTenantsUseCase,
    ResolveTenantContextUseCase,
    TenantGuard,
  ],
  exports: [
    TenantGuard,
    MEMBERSHIP_REPOSITORY,
    TENANT_REPOSITORY,
    CreateTenantUseCase,
    CreateMembershipUseCase,
    RevokeMembershipUseCase,
    ListTenantMembersUseCase,
    ListUserTenantsUseCase,
    ResolveTenantContextUseCase,
  ],
})
export class TenantsModule {}
