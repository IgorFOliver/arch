import { expect } from '@jest/globals';
import { buildTenantObjectKey } from './tenant-object-key';

describe('buildTenantObjectKey', () => {
  it('derives the key from the TenantContext, never from caller-supplied path segments alone', () => {
    const tenantContext = { tenantId: 'tenant-a', userId: 'user-1' };

    expect(
      buildTenantObjectKey(
        tenantContext,
        'products',
        'product-1',
        'versions',
        'v1',
        'model.glb',
      ),
    ).toBe('tenants/tenant-a/products/product-1/versions/v1/model.glb');
  });

  it('two different tenants never produce the same namespace prefix', () => {
    const keyA = buildTenantObjectKey(
      { tenantId: 'tenant-a', userId: 'user-1' },
      'model.glb',
    );
    const keyB = buildTenantObjectKey(
      { tenantId: 'tenant-b', userId: 'user-1' },
      'model.glb',
    );

    expect(keyA).not.toBe(keyB);
    expect(keyA.startsWith('tenants/tenant-a/')).toBe(true);
    expect(keyB.startsWith('tenants/tenant-b/')).toBe(true);
  });
});
