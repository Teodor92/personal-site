import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

// Correctness-focused config: the recommended tiers only, no stylistic rules
// (Prettier owns formatting; eslint-config-prettier keeps them from clashing).
export default tseslint.config(
  { ignores: ['dist/', '.astro/', 'node_modules/'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  prettier,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
);
