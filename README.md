# Arch Monorepo

A base monorepo template for building full-stack applications with NestJS (API) and Next.js (Web) using pnpm workspaces.

## Project Structure

```
arch/
├── apps/
│   ├── api/          # NestJS backend application
│   └── web/          # Next.js frontend application
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