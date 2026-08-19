import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import importPlugin from 'eslint-plugin-import';

// Each feature may only be imported from outside via its own index.ts —
// deep imports into a sibling feature's internals are blocked.
const FEATURES = ['auth', 'users', 'admin', 'home'];

const featureBoundaryZones = FEATURES.map((feature) => ({
  target: `./src/features/${feature}/**/*`,
  from: FEATURES.filter((other) => other !== feature).map(
    (other) => `./src/features/${other}`,
  ),
  except: ['./index.ts', './index.tsx'],
  message:
    "Import from a feature's public API (its index.ts) instead of reaching into its internals.",
}));

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ['jest.config.js', 'jest.setup.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    plugins: { import: importPlugin },
    rules: {
      'import/no-restricted-paths': ['error', { zones: featureBoundaryZones }],
    },
  },
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*', '../**', './../*', './../**'],
              message: 'Use the "@/" alias instead of parent-relative imports.',
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
