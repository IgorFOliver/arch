import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { SessionService } from './session.service';
import { SignupDto } from './dto/signup.dto';

jest.mock('argon2');

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let sessionService: jest.Mocked<SessionService>;

  const user: User = {
    id: 'user-1',
    email: 'dev@example.com',
    passwordHash: 'hashed-password',
    name: 'Dev User',
    company: null,
    role: 'USER',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
      createLocalUser: jest.fn(),
      toPublicUser: jest.fn((u: User) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        company: u.company,
        role: u.role,
        active: u.active,
        createdAt: u.createdAt,
      })),
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

  describe('signup', () => {
    const dto: SignupDto = {
      name: 'Dev User',
      company: 'Acme',
      email: 'new@example.com',
      password: 'a-strong-password',
      agreeToTerms: true,
    };

    it('creates a local user when the email is not taken', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.createLocalUser.mockResolvedValue(user);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');

      await expect(authService.signup(dto)).resolves.toEqual(user);
      expect(usersService.createLocalUser).toHaveBeenCalledWith(
        dto.email,
        'hashed-password',
        dto.name,
        dto.company,
      );
    });

    it('throws when the email is already registered', async () => {
      usersService.findByEmail.mockResolvedValue(user);

      await expect(authService.signup(dto)).rejects.toThrow(ConflictException);
      expect(usersService.createLocalUser).not.toHaveBeenCalled();
    });
  });

  describe('createSession', () => {
    it('creates a session and sets the cookie for an active account', async () => {
      const res = {} as unknown as Parameters<
        typeof authService.createSession
      >[0];
      sessionService.create.mockResolvedValue({
        id: 'session-1',
        userId: user.id,
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      await authService.createSession(res, user);

      expect(sessionService.create).toHaveBeenCalledWith(user.id);
      expect(sessionService.setCookie).toHaveBeenCalledWith(res, 'session-1');
    });

    it('rejects a deactivated account without creating a session', async () => {
      const res = {} as unknown as Parameters<
        typeof authService.createSession
      >[0];

      await expect(
        authService.createSession(res, { ...user, active: false }),
      ).rejects.toThrow(ForbiddenException);
      expect(sessionService.create).not.toHaveBeenCalled();
      expect(sessionService.setCookie).not.toHaveBeenCalled();
    });
  });

  describe('toPublicUser', () => {
    it('delegates to UsersService and strips the password hash from the response', () => {
      expect(authService.toPublicUser(user)).toEqual({
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
        role: user.role,
        active: user.active,
        createdAt: user.createdAt,
      });
    });
  });
});
