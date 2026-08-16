import { UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { SessionService } from './session.service';

jest.mock('argon2');

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let sessionService: jest.Mocked<SessionService>;

  const user: User = {
    id: 'user-1',
    email: 'dev@example.com',
    passwordHash: 'hashed-password',
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;
    sessionService = {
      create: jest.fn(),
      setCookie: jest.fn(),
    } as unknown as jest.Mocked<SessionService>;

    authService = new AuthService(usersService, sessionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateLocal', () => {
    it('returns the user when the password matches', async () => {
      usersService.findByEmail.mockResolvedValue(user);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      await expect(
        authService.validateLocal(user.email, 'correct-password'),
      ).resolves.toEqual(user);
    });

    it('throws when no user exists for the email', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.validateLocal('missing@example.com', 'anything'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws when the account has no password (IdP-only account)', async () => {
      usersService.findByEmail.mockResolvedValue({
        ...user,
        passwordHash: null,
      });

      await expect(
        authService.validateLocal(user.email, 'anything'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws when the password does not match', async () => {
      usersService.findByEmail.mockResolvedValue(user);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.validateLocal(user.email, 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('toPublicUser', () => {
    it('strips the password hash from the response', () => {
      expect(authService.toPublicUser(user)).toEqual({
        id: user.id,
        email: user.email,
        role: user.role,
      });
    });
  });
});
