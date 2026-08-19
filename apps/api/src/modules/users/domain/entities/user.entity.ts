export interface User {
  id: string;
  email: string;
  passwordHash: string | null;
  name: string | null;
  company: string | null;
  /** Platform-wide ban flag, checked at login/session validation. Has
   *  nothing to do with tenancy — see Membership.status for that. */
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type AuthProviderType = 'LOCAL' | 'AUTH0';
