import { ConflictException, Injectable } from '@nestjs/common';
import { AuthProvider, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface Auth0Profile {
  id: string;
  emails?: { value: string }[];
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

  createLocalUser(email: string, passwordHash: string): Promise<User> {
    return this.prisma.user.create({ data: { email, passwordHash } });
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
