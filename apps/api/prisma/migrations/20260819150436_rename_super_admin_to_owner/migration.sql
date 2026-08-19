-- Tenant Scope now has exactly three roles: USER, ADMIN, OWNER.
-- ALTER TYPE ... RENAME VALUE preserves every existing row in place —
-- any Membership currently SUPER_ADMIN becomes OWNER automatically, no
-- separate UPDATE needed, and no data is lost.
ALTER TYPE "Role" RENAME VALUE 'SUPER_ADMIN' TO 'OWNER';
