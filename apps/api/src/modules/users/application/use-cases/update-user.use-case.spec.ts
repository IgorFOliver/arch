import { NotFoundException } from '@nestjs/common';
import { expect } from '@jest/globals';
import { Role } from '@4basearch/domain-types';
import { UpdateUserUseCase } from './update-user.use-case';
import type { UserRepository } from '../../domain/repositories/user.repository';
import type { User } from '../../domain/entities/user.entity';

describe('UpdateUserUseCase', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let useCase: UpdateUserUseCase;

  const user: User = {
    id: 'user-1',
    email: 'dev@example.com',
    passwordHash: 'hashed-password',
    name: 'Dev User',
    company: null,
    role: Role.USER,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findIdentity: jest.fn(),
      linkIdentity: jest.fn(),
      createFromAuth0: jest.fn(),
    };
    useCase = new UpdateUserUseCase(userRepository);
  });

  it('updates the given fields when the user exists', async () => {
    userRepository.findById.mockResolvedValue(user);
    userRepository.update.mockResolvedValue({ ...user, active: false });

    await expect(useCase.execute(user.id, { active: false })).resolves.toEqual({
      ...user,
      active: false,
    });

    expect(userRepository.update).toHaveBeenCalledWith(user.id, {
      name: undefined,
      company: undefined,
      role: undefined,
      active: false,
    });
  });

  it('throws when the user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('missing-id', { active: false }),
    ).rejects.toThrow(NotFoundException);
    expect(userRepository.update).not.toHaveBeenCalled();
  });
});
