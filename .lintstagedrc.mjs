const quote = (files) => files.map((file) => JSON.stringify(file)).join(' ');

export default {
  '**/*.{js,jsx,ts,tsx,mjs,cjs,json,md,mdx,yml,yaml,css,scss}':
    'prettier --write',
  'apps/api/**/*.ts': (files) =>
    `eslint --fix --config apps/api/eslint.config.mjs ${quote(files)}`,
  'apps/web/**/*.{ts,tsx}': (files) =>
    `eslint --fix --config apps/web/eslint.config.mjs ${quote(files)}`,
};
