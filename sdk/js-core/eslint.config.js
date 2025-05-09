import js from '@eslint/js';
import globals from 'globals';
import formatjs from 'eslint-plugin-formatjs';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import checkFile from 'eslint-plugin-check-file';

export default tseslint.config(
  { ignores: ['dist', 'src/lib/shadcn/*'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      formatjs,
    },
    rules: {
      'formatjs/enforce-id': [
        'error',
        {
          idWhitelist: [
            '^shared\\.[a-zA-Z0-9_]+$', // Matches shared.*
            '^feature\\.[a-zA-Z0-9_]+\\.[a-zA-Z0-9_]+\\.[a-zA-Z0-9_]+$', // Matches feature.*.*.*
          ],
          idInterpolationPattern: '^(shared\\.[a-zA-Z0-9_]+|feature\\.[a-zA-Z0-9_]+\\.[a-zA-Z0-9_]+\\.[a-zA-Z0-9_]+)$',
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
