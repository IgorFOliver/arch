import { ConflictException } from '@nestjs/common';
import { expect } from '@jest/globals';
import * as argon2 from 'argon2';
import { Role } from '@4basearch/domain-types';
import { CreateUserUseCase } from './create-user.use-case';
import type { UserRepository } from '../../domain/repositories/user.repository';
import type { User } from '../../domain/entities/user.entity';

jest.mock('argon2');

describe('CreateUserUseCase', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let useCase: CreateUserUseCase;

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

  const dto = {
    name: 'New User',
    email: 'new@example.com',
    password: 'a-strong-password',
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
    useCase = new CreateUserUseCase(userRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a user with a hashed password when the email is not taken', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');
    userRepository.create.mockResolvedValue(user);

    await expect(useCase.execute(dto)).resolves.toEqual(user);
    expect(userRepository.create).toHaveBeenCalledWith({
      email: dto.email,
      passwordHash: 'hashed-password',
      name: dto.name,
      company: undefined,
      role: Role.USER,
    });
  });

  it('defaults to the given role when provided', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');
    userRepository.create.mockResolvedValue(user);

    await useCase.execute({ ...dto, role: Role.ADMIN });

    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: Role.ADMIN }),
    );
  });

  it('throws when the email is already registered', async () => {
    userRepository.findByEmail.mockResolvedValue(user);

    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
    expect(userRepository.create).not.toHaveBeenCalled();
  });
});
