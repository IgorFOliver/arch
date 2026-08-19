import { apiFetch, apiUrl, HttpError } from '@/infrastructure/api/http-client';
import type { AuthUser } from './types';
import { LoginFormValues, SignupFormValues } from './schema';

export interface SessionResponse {
  user: AuthUser;
}

export type AuthErrorCode =
  | 'invalidCredentials'
  | 'loginFailed'
  | 'emailTaken'
  | 'signupFailed'
  | 'sessionLoadFailed'
  | 'accountInactive';

export class AuthApiError extends Error {
  constructor(
    public readonly code: AuthErrorCode,
    public readonly status?: number,
  ) {
    super(code);
    this.name = 'AuthApiError';
  }
}

async function withAuthApiError<T>(
  fallback: AuthErrorCode,
  statusCodeMap: Partial<Record<number, AuthErrorCode>>,
  action: () => Promise<T>,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof HttpError) {
      throw new AuthApiError(
        statusCodeMap[error.status] ?? fallback,
        error.status,
      );
    }
    throw new AuthApiError(fallback);
  }
}

export function auth0LoginUrl(): string {
  return apiUrl('/auth/auth0/login');
}

export function login(credentials: LoginFormValues): Promise<SessionResponse> {
  return withAuthApiError(
    'loginFailed',
    { 401: 'invalidCredentials', 403: 'accountInactive' },
    () =>
      apiFetch<SessionResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
  );
}

export function signup(values: SignupFormValues): Promise<SessionResponse> {
  return withAuthApiError('signupFailed', { 409: 'emailTaken' }, () =>
    apiFetch<SessionResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(values),
    }),
  );
}

export async function getSession(): Promise<SessionResponse | null> {
  try {
    return await apiFetch<SessionResponse>('/auth/session');
  } catch (error) {
    if (error instanceof HttpError && error.status === 401) {
      return null;
    }
    if (error instanceof HttpError && error.status === 403) {
      throw new AuthApiError('accountInactive', 403);
    }
    throw new AuthApiError('sessionLoadFailed');
  }
}

export async function logout(): Promise<void> {
  await apiFetch<void>('/auth/logout', { method: 'POST' });
}
