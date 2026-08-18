import { AuthApiError } from './api';
import type { Dictionary } from '@/shared/lib/i18n/dictionaries';

export function resolveAuthErrorMessage(
  error: unknown,
  errors: Dictionary['auth']['errors'],
  fallback: keyof Dictionary['auth']['errors'],
): string {
  if (error instanceof AuthApiError) {
    return errors[error.code] ?? errors[fallback];
  }
  return errors[fallback];
}
