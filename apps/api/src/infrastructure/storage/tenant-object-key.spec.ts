import { expect } from '@jest/globals';
import { Role } from '@4basearch/domain-types';
import { buildTenantObjectKey } from './tenant-object-key';
import type { TenantContext } from '../../modules/tenants/domain/tenant-context';

function contextFor(tenantId: string): TenantContext {
  return {
    tenantId,
    userId: 'user-1',
    membershipId: 'membership-1',
    role: Role.ADMIN,
  };
}

describe('buildTenantObjectKey', () => {
  it('derives the key from the TenantContext, never from caller-supplied path segments alone', () => {
    expect(
      buildTenantObjectKey(
        contextFor('tenant-a'),
        'products',
        'product-1',
        'versions',
        'v1',
        'model.glb',
      ),
    ).toBe('tenants/tenant-a/products/product-1/versions/v1/model.glb');
  });

  it('two different tenants never produce the same namespace prefix', () => {
    const keyA = buildTenantObjectKey(contextFor('tenant-a'), 'model.glb');
    const keyB = buildTenantObjectKey(contextFor('tenant-b'), 'model.glb');

    expect(keyA).not.toBe(keyB);
    expect(keyA.startsWith('tenants/tenant-a/')).toBe(true);
    expect(keyB.startsWith('tenants/tenant-b/')).toBe(true);
  });
});
