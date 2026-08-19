import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TenantsModule } from '../tenants/tenants.module';
import { PlatformModule } from '../platform/platform.module';
import { AuditModule } from '../audit/audit.module';
import { TenantsController } from './presentation/controllers/tenants.controller';
import { CreateTenantUseCase } from './application/use-cases/create-tenant.use-case';
import { ListTenantsUseCase } from './application/use-cases/list-tenants.use-case';
import { GetTenantUseCase } from './application/use-cases/get-tenant.use-case';
import { UpdateTenantUseCase } from './application/use-cases/update-tenant.use-case';
import { ActivateTenantUseCase } from './application/use-cases/activate-tenant.use-case';
import { SuspendTenantUseCase } from './application/use-cases/suspend-tenant.use-case';

@Module({
  imports: [AuthModule, TenantsModule, PlatformModule, AuditModule],
  controllers: [TenantsController],
  providers: [
    CreateTenantUseCase,
    ListTenantsUseCase,
    GetTenantUseCase,
    UpdateTenantUseCase,
    ActivateTenantUseCase,
    SuspendTenantUseCase,
  ],
})
export class TenantManagementModule {}
