# Architecture notes

Short, living reference for two classifications the codebase depends on
but that don't have an obvious single place to read them from.

## Endpoint classification

| Level                      | Means                                                                                                                                                                                                                        | Example                                                                                            |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| PUBLIC                     | No guard. Anyone can call it.                                                                                                                                                                                                | `POST /auth/login`, `POST /auth/signup`                                                            |
| AUTHENTICATED              | `SessionGuard` only — a valid session, no tenant required. Must succeed even for a user with zero or several tenants.                                                                                                        | `GET /auth/session`, `POST /auth/logout`, `POST /auth/session/tenant`, `GET /auth/session/tenants` |
| TENANT_SCOPED              | `SessionGuard` + `TenantGuard` — fails closed (403) if no tenant/Membership can be resolved.                                                                                                                                 | (no bare example yet — Products will be the first)                                                 |
| TENANT_SCOPED + AUTHORIZED | The above, plus `RolesGuard` checking `Membership.role` via `@Roles(...)`.                                                                                                                                                   | `GET/POST/PATCH /users*`                                                                           |
| PLATFORM                   | `SessionGuard` + `PlatformGuard` — checks `PlatformAdmin`, entirely independent of Tenant/Membership. Deliberately never `TenantGuard`: the Tenant being managed may not exist yet, or the caller may have zero Memberships. | `*/platform/tenants*`                                                                              |

Never add `TenantGuard` to a route that doesn't actually need tenant
context — a resolvable tenant is not the same thing as being authorized to
do something, and forcing resolution on routes that don't need it turns an
avoidable 403 into a UX bug (see `AuthController`, which deliberately
resolves the caller's role _best-effort_, without `TenantGuard`, precisely
so `/auth/session` keeps working for a user who isn't a member of any
tenant yet).

## Current Tenant resolution

The Current (Active) Tenant is resolved entirely server-side, from the
authenticated session — the client never supplies a `tenantId` on any
tenant-scoped route, and any `tenantId` it does send elsewhere (Platform
Scope routes, the switch-tenant endpoint) is treated as a request to
verify, never as authorization by itself.

```
Request
  → SessionGuard        reads the cookie, loads Session (userId + activeTenantId)
  → TenantGuard          → ResolveTenantContextUseCase:
                             1. TenantResolver.resolve()   "which tenant?"
                             2. Tenant.status === ACTIVE?  "still accessible?"
                             3. Membership active?         "can this user act here?"
  → RolesGuard           checks Membership.role
  → Controller / Service / Repository — tenantId always from request.membership.tenantId
```

- `Session.activeTenantId` (nullable) is the Current Tenant pointer. It is
  set to the user's single active Membership at login/signup
  (`CreateSessionUseCase`) when unambiguous, and otherwise left `null`
  until the user explicitly switches. It is **not** a source of trust by
  itself — `ResolveTenantContextUseCase` re-verifies Tenant status and
  Membership on every single request, so a role change, a revoked
  Membership, or a suspended Tenant takes effect on the very next
  request, never waiting on a token to expire.
- `MembershipTenantResolver` reads `activeTenantId` off the session first
  (zero extra queries); it falls back to "exactly one active Membership"
  only for sessions that predate this field or a Membership. Two or more
  active Memberships with no `activeTenantId` set resolve to nothing —
  the caller must switch explicitly, never guessed.
- `POST /auth/session/tenant` is the only way `activeTenantId` ever
  changes. It re-verifies the target Tenant exists, is `ACTIVE`, and that
  the caller has an active Membership in it — all server-side — before
  updating the session in place. `GET /auth/session/tenants` is its
  read-only companion: every Tenant the caller could switch into, for a
  frontend picker. Both are AUTHENTICATED, not TENANT_SCOPED — a user
  with zero or several Tenants must be able to call them.

## Entity classification

| Class                  | Meaning                                                 | Examples                                              |
| ---------------------- | ------------------------------------------------------- | ----------------------------------------------------- |
| Global                 | Exists independently of any Tenant.                     | none yet (future: platform-wide feature flags/config) |
| Tenant-scoped          | Belongs to exactly one Tenant, reached only through it. | `Membership`, `Product`, `ProductVersion`             |
| User-scoped / identity | Belongs to a User directly; not tenant data.            | `User`, `Session`, `Identity`                         |

`tenantId` is added deliberately, not by default — a model only gets one
when it's genuinely owned by a single tenant. `AuditLog` is intentionally
none of the three purely: it _records_ tenant-scoped and global events
alike, but as a plain indexed `tenantId?: string` with no foreign key, so
it survives independently of whatever it references (see the comment on
the `AuditLog` model in `schema.prisma`).

## Product versioning (decision, not yet enforced)

A `Product` should have at most one `PUBLISHED` `ProductVersion` at a
time — publishing a new version is expected to archive the previously
published one. This is not enforced by a database constraint yet (no
Product CRUD exists to violate it); when that CRUD is built, either add
the constraint or make "publish" an atomic operation that archives the
prior published version in the same transaction. Until then, just don't
write code that treats "several published versions" as valid.
