import { createHash } from 'crypto';

/**
 * Fast, deterministic hash for session-token lookups — not a password
 * hash. Password hashing (argon2) is deliberately slow; session validation
 * runs on every authenticated request and needs a cheap, deterministic
 * digest instead.
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
