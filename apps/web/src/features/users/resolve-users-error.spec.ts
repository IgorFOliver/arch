import { UsersApiError } from './users-api';
import { resolveUsersErrorMessage } from './resolve-users-error';

const errors = {
  loadUsersFailed: 'Failed to load users. Please try again.',
  userNotFound: 'User not found.',
  emailTaken: 'A user with this email already exists.',
  createUserFailed: 'Could not create the user. Please try again.',
  updateUserFailed: 'Could not update the user. Please try again.',
};

describe('resolveUsersErrorMessage', () => {
  it('returns the message for the error code when it exists in the dictionary', () => {
    const error = new UsersApiError('userNotFound', 404);

    expect(resolveUsersErrorMessage(error, errors, 'loadUsersFailed')).toBe(
      errors.userNotFound,
    );
  });

  it('falls back to the given key when the error is not a UsersApiError', () => {
    expect(
      resolveUsersErrorMessage(new Error('boom'), errors, 'loadUsersFailed'),
    ).toBe(errors.loadUsersFailed);
  });

  it('falls back to the given key for an unrecognized error code', () => {
    const error = new UsersApiError(
      'notARealCode' as unknown as keyof typeof errors,
    );

    expect(resolveUsersErrorMessage(error, errors, 'createUserFailed')).toBe(
      errors.createUserFailed,
    );
  });
});
