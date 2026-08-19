import { TenantsApiError } from './tenants-api';
import { resolveTenantsErrorMessage } from './resolve-tenants-error';

const errors = {
  loadTenantsFailed: 'Failed to load tenants. Please try again.',
  tenantNotFound: 'Tenant not found.',
  slugTaken: 'A tenant with this slug already exists.',
  createTenantFailed: 'Could not create the tenant. Please try again.',
  updateTenantFailed: 'Could not update the tenant. Please try again.',
  statusUpdateFailed: "Could not update the tenant's status. Please try again.",
};

describe('resolveTenantsErrorMessage', () => {
  it('returns the message for the error code when it exists in the dictionary', () => {
    const error = new TenantsApiError('tenantNotFound', 404);

    expect(resolveTenantsErrorMessage(error, errors, 'loadTenantsFailed')).toBe(
      errors.tenantNotFound,
    );
  });

  it('falls back to the given key when the error is not a TenantsApiError', () => {
    expect(
      resolveTenantsErrorMessage(
        new Error('boom'),
        errors,
        'loadTenantsFailed',
      ),
    ).toBe(errors.loadTenantsFailed);
  });

  it('falls back to the given key for an unrecognized error code', () => {
    const error = new TenantsApiError(
      'notARealCode' as unknown as keyof typeof errors,
    );

    expect(
      resolveTenantsErrorMessage(error, errors, 'createTenantFailed'),
    ).toBe(errors.createTenantFailed);
  });
});
