import type { PlatformAdmin } from '../entities/platform-admin.entity';

export const PLATFORM_ADMIN_REPOSITORY = Symbol('PLATFORM_ADMIN_REPOSITORY');

/**
 * Deliberately just a lookup by `userId` — the only thing Platform
 * Authorization needs to answer "does this authenticated user have
 * Platform Scope authority", with no dependency on Tenant/Membership.
 */
export interface PlatformAdminRepository {
  findByUserId(userId: string): Promise<PlatformAdmin | null>;
}
