import { UsersApiError } from './users-api';
import type { Dictionary } from '@/shared/lib/i18n/dictionaries';

export function resolveUsersErrorMessage(
  error: unknown,
  errors: Dictionary['users']['errors'],
  fallback: keyof Dictionary['users']['errors'],
): string {
  if (error instanceof UsersApiError) {
    return errors[error.code] ?? errors[fallback];
  }
  return errors[fallback];
}
