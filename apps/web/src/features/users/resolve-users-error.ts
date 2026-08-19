import { UsersApiError } from './users-api';
import type { UsersErrorCode } from './users-api.types';

export function resolveUsersErrorMessage(
  error: unknown,
  errors: Partial<Record<UsersErrorCode, string>>,
  fallback: UsersErrorCode,
): string {
  const fallbackMessage = errors[fallback] ?? fallback;
  if (error instanceof UsersApiError) {
    return errors[error.code] ?? fallbackMessage;
  }
  return fallbackMessage;
}
