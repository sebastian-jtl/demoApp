import js from '@eslint/js';
import checkFile from 'eslint-plugin-check-file';
import formatjs from 'eslint-plugin-formatjs';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginReact from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'src/lib/shadcn/*', 'storybook-static'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      react: eslintPluginReact,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      formatjs,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'formatjs/enforce-id': [
        'error',
        {
          idWhitelist: [
            '^intreact.shared\\.[a-zA-Z0-9_]+$', // Matches intreact.shared.* (e.g. intreact.shared.yes)
            '^intreact\\.[a-zA-Z0-9_]+\\.[a-zA-Z0-9_]+$', // Matches intreact.*.* (e.g. intreact.table.headline)
          ],
          idInterpolationPattern: '^intreact.shared\\.[a-zA-Z0-9_]+$|^intreact\\.[a-zA-Z0-9_]+\\.[a-zA-Z0-9_]+$',
        },
      ],
      'formatjs/enforce-default-message': ['error', 'literal'],
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  {
    plugins: {
      'check-file': checkFile,
    },
    files: ['src/**/!(__tests__)/*'],
    rules: {
      'check-file/folder-naming-convention': [
        'error',
        {
          '**/*': 'KEBAB_CASE',
        },
      ],
    },
  },
  /**
   * For flat configuration, this plugin ships with an eslint-plugin-prettier/recommended config that sets up both eslint-plugin-prettier and eslint-config-prettier in one go.
   * Add it as the last item in the configuration array in your eslint.config.js file so that eslint-config-prettier has the opportunity to override other configs.
   */
  eslintPluginPrettierRecommended,
);
