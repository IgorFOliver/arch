import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PlatformRole } from '@4basearch/domain-types';
import { SessionGuard } from '../../../auth/presentation/guards/session.guard';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import { PlatformGuard } from '../../../platform/presentation/guards/platform.guard';
import { PlatformRoles } from '../../../platform/presentation/decorators/platform-roles.decorator';
import type { User } from '../../../users/domain/entities/user.entity';
import { CreateTenantUseCase } from '../../application/use-cases/create-tenant.use-case';
import { ListTenantsUseCase } from '../../application/use-cases/list-tenants.use-case';
import { GetTenantUseCase } from '../../application/use-cases/get-tenant.use-case';
import { UpdateTenantUseCase } from '../../application/use-cases/update-tenant.use-case';
import { ActivateTenantUseCase } from '../../application/use-cases/activate-tenant.use-case';
import { SuspendTenantUseCase } from '../../application/use-cases/suspend-tenant.use-case';
import { CreateTenantDto } from '../../application/dto/create-tenant.dto';
import { UpdateTenantDto } from '../../application/dto/update-tenant.dto';
import { ListTenantsQueryDto } from '../../application/dto/list-tenants-query.dto';

// PLATFORM_SCOPED: SessionGuard authenticates, PlatformGuard authorizes
// against PlatformAdminRepository — deliberately no TenantGuard in this
// chain. The Tenant being managed here doesn't have a TenantContext yet
// (it may not even exist), so there is nothing for TenantGuard to
// resolve; Platform Scope authorization must stand on its own.
@UseGuards(SessionGuard, PlatformGuard)
@PlatformRoles(PlatformRole.PLATFORM_ADMIN)
@Controller('platform/tenants')
export class TenantsController {
  constructor(
    private readonly createTenantUseCase: CreateTenantUseCase,
    private readonly listTenantsUseCase: ListTenantsUseCase,
    private readonly getTenantUseCase: GetTenantUseCase,
    private readonly updateTenantUseCase: UpdateTenantUseCase,
    private readonly activateTenantUseCase: ActivateTenantUseCase,
    private readonly suspendTenantUseCase: SuspendTenantUseCase,
  ) {}

  @Post()
  async create(@CurrentUser() user: User, @Body() dto: CreateTenantDto) {
    const tenant = await this.createTenantUseCase.execute(user.id, dto);
    return { tenant };
  }

  @Get()
  async findAll(@Query() query: ListTenantsQueryDto) {
    const { tenants, total } = await this.listTenantsUseCase.execute(query);
    return {
      tenants,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const tenant = await this.getTenantUseCase.execute(id);
    return { tenant };
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateTenantDto,
  ) {
    const tenant = await this.updateTenantUseCase.execute(user.id, id, dto);
    return { tenant };
  }

  @Post(':id/activate')
  async activate(@CurrentUser() user: User, @Param('id') id: string) {
    const tenant = await this.activateTenantUseCase.execute(user.id, id);
    return { tenant };
  }

  @Post(':id/suspend')
  async suspend(@CurrentUser() user: User, @Param('id') id: string) {
    const tenant = await this.suspendTenantUseCase.execute(user.id, id);
    return { tenant };
  }
}
