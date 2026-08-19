import { expect } from '@jest/globals';
import { Role } from '@4basearch/domain-types';
import { toPublicUser, toPublicUserFromTenantScoped } from './user.mapper';
import type { User } from '../../domain/entities/user.entity';
import type { TenantScopedUser } from '../../domain/repositories/user.repository';

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

describe('toPublicUserFromTenantScoped', () => {
  it('carries the Membership-sourced role and active status through as-is', () => {
    const member: TenantScopedUser = {
      id: 'user-1',
      email: 'dev@example.com',
      name: 'Dev User',
      company: null,
      role: Role.ADMIN,
      active: false,
      createdAt: new Date(),
    };

    expect(toPublicUserFromTenantScoped(member)).toEqual(member);
  });
});
