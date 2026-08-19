import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import type { User } from '../../domain/entities/user.entity';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case';
import { GetUserUseCase } from '../../application/use-cases/get-user.use-case';
import { ListUserMembershipsUseCase } from '../../../tenants/application/use-cases/list-user-memberships.use-case';
import { AddUserMembershipUseCase } from '../../../tenants/application/use-cases/add-user-membership.use-case';
import { DeleteUserMembershipUseCase } from '../../../tenants/application/use-cases/delete-user-membership.use-case';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UpdateUserDto } from '../../application/dto/update-user.dto';
import { ListUsersQueryDto } from '../../application/dto/list-users-query.dto';
import { AddMembershipDto } from '../../application/dto/add-membership.dto';
import { toPublicUser } from '../../application/mappers/user.mapper';

// PLATFORM_SCOPED: SessionGuard authenticates, PlatformGuard authorizes
// against PlatformAdminRepository — deliberately no TenantGuard in this
// chain, mirroring TenantsController. The platform-wide identity
// registry isn't relative to any one tenant, so there's no
// TenantContext for TenantGuard to resolve. Tenant admins/owners no
// longer manage People here — they invite existing identities into
// their tenant via MembershipsController instead.
@UseGuards(SessionGuard, PlatformGuard)
@PlatformRoles(PlatformRole.PLATFORM_ADMIN)
@Controller('platform/users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly listUserMembershipsUseCase: ListUserMembershipsUseCase,
    private readonly addUserMembershipUseCase: AddUserMembershipUseCase,
    private readonly deleteUserMembershipUseCase: DeleteUserMembershipUseCase,
  ) {}

  @Get()
  async findAll(@Query() query: ListUsersQueryDto) {
    const { users, total } = await this.listUsersUseCase.execute(query);
    return {
      users: users.map((user) => toPublicUser(user, null)),
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
    const user = await this.getUserUseCase.execute(id);
    return { user: toPublicUser(user, null) };
  }

  @Post()
  async create(@CurrentUser() actor: User, @Body() dto: CreateUserDto) {
    const user = await this.createUserUseCase.execute(actor.id, dto);
    return { user: toPublicUser(user, null) };
  }

  @Patch(':id')
  async update(
    @CurrentUser() actor: User,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.updateUserUseCase.execute(actor.id, id, dto);
    return { user: toPublicUser(user, null) };
  }

  @Get(':id/memberships')
  async findMemberships(@Param('id') id: string) {
    const memberships = await this.listUserMembershipsUseCase.execute(id);
    return { memberships };
  }

  @Post(':id/memberships')
  async addMembership(
    @CurrentUser() actor: User,
    @Param('id') id: string,
    @Body() dto: AddMembershipDto,
  ) {
    const membership = await this.addUserMembershipUseCase.execute(
      actor.id,
      id,
      dto.tenantId,
      dto.role,
    );
    return { membership };
  }

  @Delete(':id/memberships/:membershipId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMembership(
    @CurrentUser() actor: User,
    @Param('membershipId') membershipId: string,
  ) {
    await this.deleteUserMembershipUseCase.execute(actor.id, membershipId);
  }
}
