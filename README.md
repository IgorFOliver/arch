# Arch Monorepo

A base monorepo template for building full-stack applications with NestJS (API) and Next.js (Web) using pnpm workspaces.

## Project Structure

```
arch/
├── apps/
│   ├── api/          # NestJS backend application
│   ├── web/          # Next.js frontend application
│   └── storybook/    # Storybook component library and design system
├── packages/
│   └── config/       # Shared TypeScript and Jest configurations
├── package.json      # Root package.json with workspace configuration
├── pnpm-workspace.yaml  # pnpm workspace configuration
└── pnpm-lock.yaml    # Lockfile for dependencies
```

## Prerequisites

- Node.js 18+ (recommended: 20+)
- pnpm 8+ (install with `npm install -g pnpm`)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd arch
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

## Build Management with Turbo

This project uses [Turbo](https://turbo.build/) to manage the build process and optimize task execution across the monorepo. Turbo enables:

- **Parallel Execution**: Runs tasks concurrently across multiple apps when there are no dependencies
- **Caching**: Caches build outputs to avoid redundant work
- **Task Orchestration**: Manages dependencies between tasks to ensure correct execution order
- **Performance**: Significantly reduces build times through incremental builds and smart scheduling

### Turbo Configuration

The `turbo.json` file at the root defines the build pipeline and task dependencies. Tasks are configured to run in the correct order, ensuring that dependencies are built before dependents.

### Running Tasks with Turbo

```bash
# Using pnpm turbo to run tasks across the monorepo
pnpm turbo start:dev    # Start all applications in development mode
pnpm turbo build        # Build all applications
pnpm turbo lint         # Lint all applications
```

## Running the Applications

### Development

Start both applications in development mode:

```bash
# Start the API (NestJS)
pnpm --filter api start:dev

# Start the Web app (Next.js)
pnpm --filter web start:dev
```

The API will run on `http://localhost:3000` and the Web app on `http://localhost:3001` by default.
### Storybook

```bash
# Start Storybook for the component library
pnpm storybook
```

Storybook runs on `http://localhost:6006` by default.
### Production Build

```bash
# Build the API
pnpm --filter api build

# Build the Web app
pnpm --filter web build

# Start the API in production
pnpm --filter api start:prod

# Start the Web app in production
pnpm --filter web start
```

## Available Scripts

### Root Level
- `pnpm install` - Install all dependencies
- `pnpm storybook` - Start Storybook for the component library
- `pnpm --filter <app> <script>` - Run scripts in specific apps

### API (apps/api)
- `pnpm --filter api start:dev` - Start development server with hot reload
- `pnpm --filter api build` - Build for production
- `pnpm --filter api test` - Run tests
- `pnpm --filter api lint` - Run ESLint

### Web (apps/web)
- `pnpm --filter web start:dev` - Start Next.js development server
- `pnpm --filter web build` - Build for production
- `pnpm --filter web start` - Start production server
- `pnpm --filter web lint` - Run ESLint

### Config Package (packages/config)
- `pnpm --filter config build` - Build shared configurations

## Configuration

### Shared TypeScript Config
The `packages/config` provides shared TypeScript configurations that can be extended by apps:

```json
{
  "extends": "@arch/config/typescript"
}
```

### Shared Jest Config
Available for testing configurations:

```json
{
  "extends": "@arch/config/jest"
}
```

## Authentication & Authorization

The `api` app ships a working auth base: local (email/password) login and Auth0 (OIDC) login, both resolving to the same server-side session.

### How it works

- **Session model**: login (local or Auth0) issues an opaque, random token stored in Postgres (`Session` table) and set as an `httpOnly` cookie. Every authenticated request looks the token up in the DB — sessions are instantly revocable (no JWT-style stateless tokens to wait out).
- **Local login**: `POST /auth/login` validates the password against an `argon2` hash (`AuthService.validateLocal`).
- **Auth0 login**: `GET /auth/auth0/login` redirects to Auth0's hosted login (Authorization Code flow via `passport-auth0`); `GET /auth/auth0/callback` completes it and creates the same kind of session.
- **Multi-provider identity**: a `User` can have several `Identity` rows (one per provider). If `/auth/auth0/login` is hit while a local session cookie is already present, the Auth0 identity is linked to that account instead of creating a duplicate — see `UsersService.findOrCreateFromAuth0`.
- **Authorization**: `User.role` plus a `RolesGuard` + `@Roles()` decorator (`apps/api/src/auth/guards/roles.guard.ts`) are in place for gating routes by role; no routes use it yet.
- **Guards**: `SessionGuard` protects routes behind an active session; `Auth0AuthGuard` wraps the Auth0 OAuth handshake.

### Setup

1. Copy `apps/api/.env.example` to `apps/api/.env` and fill in `DATABASE_URL` plus, if you want Auth0 login, `AUTH0_DOMAIN` / `AUTH0_CLIENT_ID` / `AUTH0_CLIENT_SECRET` / `AUTH0_CALLBACK_URL` (values come from a **Regular Web Application** in the Auth0 dashboard — the callback URL must also be registered there under Allowed Callback URLs).
2. Start Postgres: `docker compose -f apps/api/docker-compose.yml up -d`
3. Run migrations and seed a dev user: `pnpm --filter api db:migrate:dev && pnpm --filter api db:seed`
4. `AUTH0_DOMAIN`/`AUTH0_CLIENT_ID`/`AUTH0_CLIENT_SECRET` are read once at boot — restart the API after changing them.

### Known follow-ups

The base is functional but not hardened for production yet:

- No rate limiting / brute-force protection on `/auth/login`
- No CSRF token (currently relying on `SameSite=Lax`)
- No security headers (helmet, CSP, HSTS)
- No password reset / forgot-password flow
- `RolesGuard` exists but no route uses `@Roles()` yet
- Session TTL is a fixed 7 days with no "logout everywhere" action

## Development Guidelines

1. **Workspace Dependencies**: Use `pnpm add <package>` at root for shared dependencies, or `pnpm add <package> -F <app>` for app-specific ones.

2. **Shared Code**: Place reusable code in `packages/` and export it properly in `package.json`.

3. **Linting**: Run `pnpm --filter <app> lint` to check code quality.

4. **Testing**: Use the shared Jest configuration for consistent testing across apps.

## Contributing

1. Follow the existing code style and structure.
2. Add tests for new features.
3. Update this README if you add new apps or change the structure.

## License

This project is licensed under the ISC License.