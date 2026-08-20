import { ConflictException } from '@nestjs/common';
import { expect } from '@jest/globals';
import { FindOrCreateFromAuth0UseCase } from './find-or-create-from-auth0.use-case';
import type { UserRepository } from '../../domain/repositories/user.repository';
import type { User } from '../../domain/entities/user.entity';

describe('FindOrCreateFromAuth0UseCase', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let useCase: FindOrCreateFromAuth0UseCase;

  const user: User = {
    id: 'user-1',
    email: 'dev@example.com',
    passwordHash: null,
    name: 'Dev User',
    company: null,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const profile = { id: 'auth0|123', emails: [{ value: 'dev@example.com' }] };

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      findIdentity: jest.fn(),
      linkIdentity: jest.fn(),
      createFromAuth0: jest.fn(),
      updatePassword: jest.fn(),
    };
    useCase = new FindOrCreateFromAuth0UseCase(userRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns the linked user when the identity already exists', async () => {
    userRepository.findIdentity.mockResolvedValue({ userId: user.id, user });

    await expect(useCase.execute(profile)).resolves.toEqual(user);
    expect(userRepository.linkIdentity).not.toHaveBeenCalled();
  });

  it('throws when the identity is already linked to a different account', async () => {
    const otherUser: User = { ...user, id: 'user-2' };
    userRepository.findIdentity.mockResolvedValue({
      userId: otherUser.id,
      user: otherUser,
    });

    await expect(useCase.execute(profile, user)).rejects.toThrow(
      ConflictException,
    );
  });

  it('links the Auth0 identity to the current session user when unclaimed', async () => {
    userRepository.findIdentity.mockResolvedValue(null);

    await expect(useCase.execute(profile, user)).resolves.toEqual(user);

    expect(userRepository.linkIdentity).toHaveBeenCalledWith(
      user.id,
      'AUTH0',
      profile.id,
    );
    expect(userRepository.createFromAuth0).not.toHaveBeenCalled();
  });

  it('throws when logging in fresh and the email already belongs to a local account', async () => {
    userRepository.findIdentity.mockResolvedValue(null);
    userRepository.findByEmail.mockResolvedValue(user);

    await expect(useCase.execute(profile)).rejects.toThrow(ConflictException);
    expect(userRepository.createFromAuth0).not.toHaveBeenCalled();
  });

  it('creates a new user when logging in fresh with an unclaimed identity and email', async () => {
    userRepository.findIdentity.mockResolvedValue(null);
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.createFromAuth0.mockResolvedValue(user);

    await expect(useCase.execute(profile)).resolves.toEqual(user);

    expect(userRepository.createFromAuth0).toHaveBeenCalledWith(
      profile.emails[0].value,
      'AUTH0',
      profile.id,
    );
  });
});
