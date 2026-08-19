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
import { Role } from '@4basearch/domain-types';
import { SessionGuard } from '../../../auth/presentation/guards/session.guard';
import { TenantGuard } from '../../../tenants/presentation/guards/tenant.guard';
import { RolesGuard } from '../../../authorization/presentation/guards/roles.guard';
import { Roles } from '../../../authorization/presentation/decorators/roles.decorator';
import { CurrentMembership } from '../../../tenants/presentation/decorators/current-membership.decorator';
import type { Membership } from '../../../tenants/domain/entities/membership.entity';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case';
import { GetUserUseCase } from '../../application/use-cases/get-user.use-case';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UpdateUserDto } from '../../application/dto/update-user.dto';
import { ListUsersQueryDto } from '../../application/dto/list-users-query.dto';
import { toPublicUserFromTenantScoped } from '../../application/mappers/user.mapper';

// TENANT_SCOPED + AUTHORIZED: SessionGuard authenticates, TenantGuard
// resolves the active tenant + Membership, RolesGuard authorizes against
// that Membership's role — in that order, each depending on the one
// before it having already populated the request.
@UseGuards(SessionGuard, TenantGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly getUserUseCase: GetUserUseCase,
  ) {}

  @Get()
  async findAll(
    @CurrentMembership() membership: Membership,
    @Query() query: ListUsersQueryDto,
  ) {
    const { users, total } = await this.listUsersUseCase.execute(
      membership.tenantId,
      query,
    );
    return {
      users: users.map(toPublicUserFromTenantScoped),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
      },
    };
  }

  @Get(':id')
  async findOne(
    @CurrentMembership() membership: Membership,
    @Param('id') id: string,
  ) {
    const user = await this.getUserUseCase.execute(membership.tenantId, id);
    return { user: toPublicUserFromTenantScoped(user) };
  }

  @Post()
  async create(
    @CurrentMembership() membership: Membership,
    @Body() dto: CreateUserDto,
  ) {
    const user = await this.createUserUseCase.execute(membership, dto);
    return { user: toPublicUserFromTenantScoped(user) };
  }

  @Patch(':id')
  async update(
    @CurrentMembership() membership: Membership,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.updateUserUseCase.execute(membership, id, dto);
    return { user: toPublicUserFromTenantScoped(user) };
  }
}
