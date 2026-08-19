import { MembershipsApiError } from './memberships-api';
import { resolveMembershipsErrorMessage } from './resolve-memberships-error';

const errors = {
  loadMembershipsFailed: 'Failed to load memberships. Please try again.',
  membershipNotFound: 'Membership not found.',
  userNotFound: 'No user found with this email.',
  membershipAlreadyExists:
    'This user already has an active membership for this tenant.',
  createMembershipFailed: 'Could not add the member. Please try again.',
  updateMembershipFailed: 'Could not update the membership. Please try again.',
  statusUpdateFailed:
    "Could not update the membership's status. Please try again.",
};

describe('resolveMembershipsErrorMessage', () => {
  it('returns the message for the error code when it exists in the dictionary', () => {
    const error = new MembershipsApiError('userNotFound', 404);

    expect(
      resolveMembershipsErrorMessage(error, errors, 'loadMembershipsFailed'),
    ).toBe(errors.userNotFound);
  });

  it('falls back to the given key when the error is not a MembershipsApiError', () => {
    expect(
      resolveMembershipsErrorMessage(
        new Error('boom'),
        errors,
        'loadMembershipsFailed',
      ),
    ).toBe(errors.loadMembershipsFailed);
  });

  it('falls back to the given key for an unrecognized error code', () => {
    const error = new MembershipsApiError(
      'notARealCode' as unknown as keyof typeof errors,
    );

    expect(
      resolveMembershipsErrorMessage(error, errors, 'createMembershipFailed'),
    ).toBe(errors.createMembershipFailed);
  });
});
