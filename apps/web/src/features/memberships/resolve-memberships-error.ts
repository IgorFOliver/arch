import { MembershipsApiError } from './memberships-api';
import type { Dictionary } from '@/shared/lib/i18n/dictionaries';

export function resolveMembershipsErrorMessage(
  error: unknown,
  errors: Dictionary['memberships']['errors'],
  fallback: keyof Dictionary['memberships']['errors'],
): string {
  if (error instanceof MembershipsApiError) {
    return errors[error.code] ?? errors[fallback];
  }
  return errors[fallback];
}
