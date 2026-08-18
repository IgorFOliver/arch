export const Role = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const ROLES = [Role.USER, Role.ADMIN, Role.SUPER_ADMIN] as const;
