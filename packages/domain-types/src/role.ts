export const Role = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  OWNER: 'OWNER',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const ROLES = [Role.USER, Role.ADMIN, Role.OWNER] as const;
