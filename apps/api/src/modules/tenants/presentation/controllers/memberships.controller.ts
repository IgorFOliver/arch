import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@4basearch/domain-types';
import { SessionGuard } from '../../../auth/presentation/guards/session.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { RolesGuard } from '../../../authorization/presentation/guards/roles.guard';
import { Roles } from '../../../authorization/presentation/decorators/roles.decorator';
import { CurrentTenant } from '../decorators/current-tenant.decorator';
import type { TenantContext } from '../../domain/tenant-context';
import { CreateMembershipUseCase } from '../../application/use-cases/create-membership.use-case';
import { ListTenantMembersUseCase } from '../../application/use-cases/list-tenant-members.use-case';
import { GetMembershipUseCase } from '../../application/use-cases/get-membership.use-case';
import { UpdateMembershipUseCase } from '../../application/use-cases/update-membership.use-case';
import { RevokeMembershipUseCase } from '../../application/use-cases/revoke-membership.use-case';
import { ReactivateMembershipUseCase } from '../../application/use-cases/reactivate-membership.use-case';
import { CreateMembershipDto } from '../../application/dto/create-membership.dto';
import { UpdateMembershipDto } from '../../application/dto/update-membership.dto';

// TENANT_SCOPED + AUTHORIZED, same shape as UsersController. Associates
// EXISTING users (found by email) with the current tenant — never creates
// a new User, that's UsersController's job.
@UseGuards(SessionGuard, TenantGuard, RolesGuard)
@Roles(Role.ADMIN, Role.OWNER)
@Controller('memberships')
export class MembershipsController {
  constructor(
    private readonly createMembershipUseCase: CreateMembershipUseCase,
    private readonly listTenantMembersUseCase: ListTenantMembersUseCase,
    private readonly getMembershipUseCase: GetMembershipUseCase,
    private readonly updateMembershipUseCase: UpdateMembershipUseCase,
    private readonly revokeMembershipUseCase: RevokeMembershipUseCase,
    private readonly reactivateMembershipUseCase: ReactivateMembershipUseCase,
  ) {}

  @Get()
  async findAll(@CurrentTenant() tenantContext: TenantContext) {
    const memberships = await this.listTenantMembersUseCase.execute(
      tenantContext.tenantId,
    );
    return { memberships };
  }

  @Get(':id')
  async findOne(
    @CurrentTenant() tenantContext: TenantContext,
    @Param('id') id: string,
  ) {
    const membership = await this.getMembershipUseCase.execute(
      tenantContext.tenantId,
      id,
    );
    return { membership };
  }

  @Post()
  async create(
    @CurrentTenant() tenantContext: TenantContext,
    @Body() dto: CreateMembershipDto,
  ) {
    const membership = await this.createMembershipUseCase.execute({
      actingContext: tenantContext,
      email: dto.email,
      role: dto.role,
    });
    return { membership };
  }

  @Patch(':id')
  async update(
    @CurrentTenant() tenantContext: TenantContext,
    @Param('id') id: string,
    @Body() dto: UpdateMembershipDto,
  ) {
    const membership = await this.updateMembershipUseCase.execute({
      actingContext: tenantContext,
      membershipId: id,
      role: dto.role,
    });
    return { membership };
  }

  @Post(':id/reactivate')
  async reactivate(
    @CurrentTenant() tenantContext: TenantContext,
    @Param('id') id: string,
  ) {
    const membership = await this.reactivateMembershipUseCase.execute({
      actingContext: tenantContext,
      membershipId: id,
    });
    return { membership };
  }

  @Delete(':id')
  async revoke(
    @CurrentTenant() tenantContext: TenantContext,
    @Param('id') id: string,
  ) {
    const membership = await this.revokeMembershipUseCase.execute({
      actingContext: tenantContext,
      membershipId: id,
    });
    return { membership };
  }
}
