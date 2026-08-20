import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type User as PrismaUser } from '@prisma/client';
import { PrismaService } from '../../../../../prisma/prisma.service';
import type {
  CreateUserData,
  ListUsersFilter,
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

  async findAll(
    filter: ListUsersFilter,
  ): Promise<{ users: User[]; total: number }> {
    const { page, pageSize, search, active, sortBy, sortDir } = filter;

    const where: Prisma.UserWhereInput = {
      ...(active !== undefined ? { active } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { [sortBy]: sortDir },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users: users.map(toDomainUser), total };
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: { name: data.name, company: data.company, active: data.active },
      });
      return toDomainUser(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('User not found.');
      }
      throw error;
    }
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
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
