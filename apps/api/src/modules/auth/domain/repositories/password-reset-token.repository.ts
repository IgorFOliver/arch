export const PASSWORD_RESET_TOKEN_REPOSITORY = Symbol(
  'PASSWORD_RESET_TOKEN_REPOSITORY',
);

export interface CreatedPasswordResetToken {
  token: string;
  expiresAt: Date;
}

export interface PasswordResetTokenRecord {
  id: string;
  userId: string;
  expiresAt: Date;
  usedAt: Date | null;
}

export interface PasswordResetTokenRepository {
  create(userId: string, expiresAt: Date): Promise<CreatedPasswordResetToken>;
  findByToken(token: string): Promise<PasswordResetTokenRecord | null>;
  markUsed(id: string): Promise<void>;
  /** Invalidates (marks used) every still-valid token for a user —
   *  requesting a new reset invalidates any prior one, and a successful
   *  reset does the same as a belt-and-braces cleanup. */
  invalidateAllForUser(userId: string): Promise<void>;
  /** The single most recently *requested* token for a user, regardless of
   *  status — the cooldown check's only need: "was one issued too
   *  recently?", nothing about validity. */
  findMostRecentForUser(userId: string): Promise<{ createdAt: Date } | null>;
}
