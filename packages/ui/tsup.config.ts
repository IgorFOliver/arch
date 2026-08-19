import { readFileSync, writeFileSync } from 'fs';
import { defineConfig } from 'tsup';

// esbuild strips a "use client" banner when it bundles multiple source
// files together (it treats the merged directive prologue as unsafe), so
// the directive is prepended to the built files after tsup finishes
// instead of via esbuild's own `banner` option.
const CLIENT_DIRECTIVE = "'use client';\n";

function prependUseClient(file: string): void {
  const contents = readFileSync(file, 'utf8');
  if (!contents.startsWith(CLIENT_DIRECTIVE)) {
    writeFileSync(file, CLIENT_DIRECTIVE + contents);
  }
}

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  treeshake: 'recommended',
  onSuccess: async () => {
    prependUseClient('dist/index.mjs');
    prependUseClient('dist/index.js');
  },
});
