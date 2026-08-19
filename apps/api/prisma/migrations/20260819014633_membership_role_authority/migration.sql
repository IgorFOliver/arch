-- User.role stops being an authorization authority — Membership.role,
-- scoped to a tenant, is the only one from now on. Every existing user
-- gets migrated into a "default" tenant, carrying the role they already
-- had, so nobody loses access.

-- CreateTenant: the legacy tenant for everyone who existed before
-- multi-tenancy did.
INSERT INTO "Tenant" (id, name, slug, status, "createdAt", "updatedAt")
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Default',
  'default',
  'ACTIVE',
  now(),
  now()
);

-- Backfill: one ACTIVE Membership per existing user, carrying their
-- current role into the default tenant.
INSERT INTO "Membership" (id, "userId", "tenantId", role, status, "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  "User".id,
  '00000000-0000-0000-0000-000000000001',
  "User".role,
  'ACTIVE',
  now(),
  now()
FROM "User";

-- AlterTable: role is no longer a column on User.
ALTER TABLE "User" DROP COLUMN "role";
