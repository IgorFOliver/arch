import { ConflictException, Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/repositories/user.repository';
import type { User } from '../../domain/entities/user.entity';

export interface Auth0Profile {
  id: string;
  emails?: { value: string }[];
}

@Injectable()
export class FindOrCreateFromAuth0UseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  /**
   * Resolves the Auth0 profile to a User. When `currentUser` is set (the
   * request carried a valid session cookie into the OAuth round trip), an
   * unclaimed Auth0 identity is linked to that account instead of creating
   * or matching a separate one.
   */
  async execute(profile: Auth0Profile, currentUser?: User): Promise<User> {
    const identity = await this.userRepository.findIdentity(
      'AUTH0',
      profile.id,
    );

    if (identity) {
      if (currentUser && identity.userId !== currentUser.id) {
        throw new ConflictException(
          'This Auth0 account is already linked to a different user.',
        );
      }
      return identity.user;
    }

    if (currentUser) {
      await this.userRepository.linkIdentity(
        currentUser.id,
        'AUTH0',
        profile.id,
      );
      return currentUser;
    }

    const email = profile.emails?.[0]?.value ?? `${profile.id}@auth0.local`;

    const existingByEmail = await this.userRepository.findByEmail(email);
    if (existingByEmail) {
      throw new ConflictException(
        'An account with this email already exists. Log in with your password first to link Auth0.',
      );
    }

    return this.userRepository.createFromAuth0(email, 'AUTH0', profile.id);
  }
}
