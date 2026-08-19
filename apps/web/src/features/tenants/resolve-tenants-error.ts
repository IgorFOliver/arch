import { TenantsApiError } from './tenants-api';
import type { Dictionary } from '@/shared/lib/i18n/dictionaries';

export function resolveTenantsErrorMessage(
  error: unknown,
  errors: Dictionary['tenants']['errors'],
  fallback: keyof Dictionary['tenants']['errors'],
): string {
  if (error instanceof TenantsApiError) {
    return errors[error.code] ?? errors[fallback];
  }
  return errors[fallback];
}
