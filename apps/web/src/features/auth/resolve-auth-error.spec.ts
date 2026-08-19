import { AuthApiError } from './api';
import { resolveAuthErrorMessage } from './resolve-auth-error';

const errors = {
  invalidCredentials: 'Invalid email or password.',
  loginFailed: 'Something went wrong while signing in. Please try again.',
  emailTaken: 'An account with this email already exists.',
  signupFailed: 'Could not create your account. Please try again.',
  sessionLoadFailed: 'Failed to load the current session.',
  accountInactive:
    'Your account has been blocked. Contact an administrator for help.',
};

describe('resolveAuthErrorMessage', () => {
  it('returns the message for the error code when it exists in the dictionary', () => {
    const error = new AuthApiError('invalidCredentials', 401);

    expect(resolveAuthErrorMessage(error, errors, 'loginFailed')).toBe(
      errors.invalidCredentials,
    );
  });

  it('falls back to the given key when the error is not an AuthApiError', () => {
    expect(
      resolveAuthErrorMessage(new Error('boom'), errors, 'sessionLoadFailed'),
    ).toBe(errors.sessionLoadFailed);
  });

  it('falls back to the given key for an unrecognized error code', () => {
    const error = new AuthApiError(
      'notARealCode' as unknown as keyof typeof errors,
    );

    expect(resolveAuthErrorMessage(error, errors, 'loginFailed')).toBe(
      errors.loginFailed,
    );
  });
});
