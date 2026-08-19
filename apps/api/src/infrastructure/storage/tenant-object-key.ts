import type { TenantContext } from '../../modules/tenants/domain/tenant-context';

/**
 * Every tenant-owned object key is derived from a server-trusted
 * TenantContext — never from a client-supplied tenantId or path. This is
 * what makes it impossible for a request to read/write another tenant's
 * namespace even if it knows (or guesses) the path shape.
 */
export function buildTenantObjectKey(
  tenantContext: TenantContext,
  ...segments: string[]
): string {
  return ['tenants', tenantContext.tenantId, ...segments].join('/');
}
