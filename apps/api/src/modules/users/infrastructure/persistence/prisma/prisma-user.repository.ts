import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Prisma,
  type Membership as PrismaMembership,
  type User as PrismaUser,
} from '@prisma/client';
import { PrismaService } from '../../../../../prisma/prisma.service';
import type {
  CreateUserData,
  ListTenantMembersFilter,
  TenantScopedUser,
  UpdateUserData,
  UserRepository,
} from '../../../domain/repositories/user.repository';
import type {
  AuthProviderType,
  User,
} from '../../../domain/entities/user.entity';

function toDomainUser(user: PrismaUser): User {
  return {
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    name: user.name,
    company: user.company,
    active: user.active,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function toTenantScopedUser(
  membership: PrismaMembership & { user: PrismaUser },
): TenantScopedUser {
  return {
    id: membership.user.id,
    email: membership.user.email,
    name: membership.user.name,
    company: membership.user.company,
    role: membership.role,
    active: membership.status === 'ACTIVE',
    createdAt: membership.user.createdAt,
  };
}

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? toDomainUser(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? toDomainUser(user) : null;
  }

  async create(data: CreateUserData): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        company: data.company,
      },
    });
    return toDomainUser(user);
  }

  async updateMember(
    tenantId: string,
    userId: string,
    data: UpdateUserData,
  ): Promise<User> {
    // `updateMany` with a relational filter, not `update({ where: { id } })`
    // — the WHERE clause itself proves the user has a Membership in this
    // tenant before anything is written. A userId from another tenant
    // matches zero rows: NotFound, never a silent no-op on someone else's
    // profile.
    const { count } = await this.prisma.user.updateMany({
      where: { id: userId, memberships: { some: { tenantId } } },
      data: { name: data.name, company: data.company },
    });
    if (count !== 1) {
      throw new NotFoundException('User not found.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return toDomainUser(user);
  }

  async findMemberById(
    tenantId: string,
    userId: string,
  ): Promise<TenantScopedUser | null> {
    // No status filter: a revoked (blocked) member must still be visible
    // to their own tenant's admins, or nobody could ever un-block them.
    // What this guards against is a DIFFERENT tenant's id, not a
    // different status.
    const membership = await this.prisma.membership.findFirst({
      where: { tenantId, userId },
      include: { user: true },
    });
    return membership ? toTenantScopedUser(membership) : null;
  }

  async findMembers(
    filter: ListTenantMembersFilter,
  ): Promise<{ users: TenantScopedUser[]; total: number }> {
    const { tenantId, page, pageSize, search, role, active, sortBy, sortDir } =
      filter;

    const where: Prisma.MembershipWhereInput = {
      tenantId,
      ...(active !== undefined
        ? { status: active ? 'ACTIVE' : 'REVOKED' }
        : {}),
      ...(role ? { role } : {}),
      ...(search
        ? {
            user: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            },
          }
        : {}),
    };

    const orderBy: Prisma.MembershipOrderByWithRelationInput =
      sortBy === 'createdAt'
        ? { createdAt: sortDir }
        : { user: { [sortBy]: sortDir } };

    const [memberships, total] = await this.prisma.$transaction([
      this.prisma.membership.findMany({
        where,
        include: { user: true },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.membership.count({ where }),
    ]);

    return { users: memberships.map(toTenantScopedUser), total };
  }

  async findIdentity(
    provider: AuthProviderType,
    providerId: string,
  ): Promise<{ userId: string; user: User } | null> {
    const identity = await this.prisma.identity.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
      include: { user: true },
    });

    if (!identity) return null;
    return { userId: identity.userId, user: toDomainUser(identity.user) };
  }

  async linkIdentity(
    userId: string,
    provider: AuthProviderType,
    providerId: string,
  ): Promise<void> {
    await this.prisma.identity.create({
      data: { provider, providerId, userId },
    });
  }

  async createFromAuth0(
    email: string,
    provider: AuthProviderType,
    providerId: string,
  ): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email,
        identities: {
          create: { provider, providerId },
        },
      },
    });
    return toDomainUser(user);
  }
}
