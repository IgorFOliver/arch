export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');

export interface CreatedSession {
  token: string;
  expiresAt: Date;
}

export interface SessionRepository {
  create(userId: string): Promise<CreatedSession>;
  findUserIdByToken(token: string): Promise<string | null>;
  revoke(token: string): Promise<void>;
}
