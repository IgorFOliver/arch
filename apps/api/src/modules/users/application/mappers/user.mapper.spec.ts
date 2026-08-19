import { expect } from '@jest/globals';
import { Role } from '@4basearch/domain-types';
import { toPublicUser } from './user.mapper';
import type { User } from '../../domain/entities/user.entity';

describe('toPublicUser', () => {
  const user: User = {
    id: 'user-1',
    email: 'dev@example.com',
    passwordHash: 'hashed-password',
    name: 'Dev User',
    company: null,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('strips the password hash and uses the role passed in explicitly', () => {
    expect(toPublicUser(user, Role.ADMIN)).toEqual({
      id: user.id,
      email: user.email,
      name: user.name,
      company: user.company,
      role: Role.ADMIN,
      active: user.active,
      createdAt: user.createdAt,
    });
  });

  it('accepts a null role for responses with no resolvable tenant', () => {
    expect(toPublicUser(user, null).role).toBeNull();
  });
});
