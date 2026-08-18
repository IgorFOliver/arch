import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthProvider, Role, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export interface Auth0Profile {
  id: string;
  emails?: { value: string }[];
}

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  role: Role;
  active: boolean;
  createdAt: Date;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findAll(): Promise<User[]> {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }

  createLocalUser(
    email: string,
    passwordHash: string,
    name: string,
    company?: string,
  ): Promise<User> {
    return this.prisma.user.create({
      data: { email, passwordHash, name, company },
    });
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('A user with this email already exists.');
    }

    const passwordHash = await argon2.hash(dto.password);
    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        company: dto.company,
        role: dto.role ?? Role.USER,
      },
    });
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        company: dto.company,
        role: dto.role,
        active: dto.active,
      },
    });
  }

  toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      company: user.company,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt,
    };
  }

  /**
   * Resolves the Auth0 profile to a User. When `currentUser` is set (the
   * request carried a valid session cookie into the OAuth round trip), an
   * unclaimed Auth0 identity is linked to that account instead of creating
   * or matching a separate one.
   */
  async findOrCreateFromAuth0(
    profile: Auth0Profile,
    currentUser?: User,
  ): Promise<User> {
    const identity = await this.prisma.identity.findUnique({
      where: {
        provider_providerId: {
          provider: AuthProvider.AUTH0,
          providerId: profile.id,
        },
      },
      include: { user: true },
    });

    if (identity) {
      if (currentUser && identity.userId !== currentUser.id) {
        throw new ConflictException(
          'This Auth0 account is already linked to a different user.',
        );
      }
      return identity.user;
    }

    if (currentUser) {
      await this.prisma.identity.create({
        data: {
          provider: AuthProvider.AUTH0,
          providerId: profile.id,
          userId: currentUser.id,
        },
      });
      return currentUser;
    }

    const email = profile.emails?.[0]?.value ?? `${profile.id}@auth0.local`;

    const existingByEmail = await this.findByEmail(email);
    if (existingByEmail) {
      throw new ConflictException(
        'An account with this email already exists. Log in with your password first to link Auth0.',
      );
    }

    return this.prisma.user.create({
      data: {
        email,
        identities: {
          create: { provider: AuthProvider.AUTH0, providerId: profile.id },
        },
      },
    });
  }
}
