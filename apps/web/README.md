# Web

The Next.js frontend for the `arch` monorepo.

## Stack

- **[Next.js 16](https://nextjs.org)** (App Router) with **React 19** and **TypeScript**
- **[Tailwind CSS 4](https://tailwindcss.com)** for styling
- **[TanStack Query](https://tanstack.com/query)** for server state, set up via `QueryProvider`
- **[Zustand](https://github.com/pmndrs/zustand)** for client state
- **[React Hook Form](https://react-hook-form.com)** + **[Zod](https://zod.dev)** (via `@hookform/resolvers`) for forms and validation
- **ESLint** (`eslint-config-next`) for linting

## Project structure

```
src/
├── app/          # Next.js App Router routes (layouts, pages)
├── components/   # App-specific React components
├── features/     # Feature modules (e.g. auth: api, store, hooks, schema)
└── providers/    # App-wide providers (e.g. QueryProvider)
```

Each entry in `features/` groups everything for a slice of functionality — API calls, Zustand store, hooks, and Zod schemas — instead of splitting by technical layer.

## Using it inside the monorepo

This app is a workspace package (`web`) managed by **pnpm workspaces** and **[Turborepo](https://turbo.build/)**. See the [root README](../../README.md) for the full monorepo layout. A few things specific to `web`:

- **Shared TypeScript config**: `tsconfig.json` extends `@arch/config/typescript`, the shared config in `packages/config`.
- **Shared UI components**: the `@ui/*` path alias resolves to `apps/storybook/stories/atomic/*`, so atomic-design components built and documented in Storybook can be imported directly, e.g. `import { Button } from "@ui/Button"`.
- **API URL**: the app talks to the `api` workspace app over HTTP via `NEXT_PUBLIC_API_URL` (see [Environment variables](#environment-variables)) rather than a direct package import.

### Running from the repo root

```bash
# install all workspace dependencies (run once, from the repo root)
pnpm install

# run this app only
pnpm --filter web start:dev

# or run it (and its dependencies) through Turbo
pnpm turbo start:dev --filter=web
```

### Running from this directory

```bash
cd apps/web
pnpm start:dev
```

The dev server runs on [http://localhost:3001](http://localhost:3001) (see the `-p 3001` flag in `start:dev`, since the `api` app defaults to port 3000).

## Environment variables

Copy `.env.example` to `.env.local` and adjust as needed:

```bash
cp .env.example .env.local
```

| Variable              | Description                          | Default                 |
| ---------------------- | ------------------------------------- | ------------------------ |
| `NEXT_PUBLIC_API_URL`  | Base URL of the `api` workspace app  | `http://localhost:3000` |

## Scripts

| Script                          | Description                    |
| -------------------------------- | ------------------------------- |
| `pnpm --filter web start:dev`   | Start the dev server (port 3001) |
| `pnpm --filter web build`       | Production build                |
| `pnpm --filter web start`       | Start the production server     |
| `pnpm --filter web lint`        | Run ESLint                      |
