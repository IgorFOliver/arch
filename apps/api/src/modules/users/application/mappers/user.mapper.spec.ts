import { expect } from '@jest/globals';
import { Role } from '@4basearch/domain-types';
import { toPublicUser } from './user.mapper';
import type { User } from '../../domain/entities/user.entity';

describe('toPublicUser', () => {
  it('strips the password hash from the response', () => {
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

    expect(toPublicUser(user)).toEqual({
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
