/// <reference types="vite/client" />
/// <reference types="vitest" />
import path, { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'glob';
import { defineConfig } from 'vite';
import fs from 'fs';
import react from '@vitejs/plugin-react-swc';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import dts from 'vite-plugin-dts';
import tailwindcss from '@tailwindcss/vite';
import { kebabCase } from 'change-case';

const jtlPlatformInternalReactImports = ['@jtl/platform-internal-react'];

const libDirectory = 'node_modules/@jtl/platform-internal-react/dist/lib';
const directSubfoldersOfLibDirectory = fs
  .readdirSync(libDirectory, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);
jtlPlatformInternalReactImports.push(...directSubfoldersOfLibDirectory.map(subfolder => `@jtl/platform-internal-react/${subfolder}`));

export default defineConfig({
  plugins: [
    react(),
    libInjectCss(),
    dts({
      tsconfigPath: './tsconfig.app.json',
      exclude: ['**/*.stories.tsx', '**/*.stories.ts', '**/*.test.tsx'],
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: '@jtl/platform-plugins-internal-react',
      formats: ['es'],
    },
    sourcemap: true,
    minify: false,
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'tailwind-merge', ...jtlPlatformInternalReactImports],
      input: Object.fromEntries(
        globSync(['src/components/**/*.tsx', 'src/main.ts'], {
          ignore: ['**/*.stories.tsx', '**/*.stories.ts', '**/*.test.tsx'],
        }).map(file => {
          // This remove `src/` as well as the file extension from each
          // file, so e.g. src/nested/foo.js becomes nested/foo
          const entryName = path.relative('src', file.slice(0, file.length - path.extname(file).length));
          // This expands the relative paths to absolute paths, so e.g.
          // src/nested/foo becomes /project/src/nested/foo.js
          const entryUrl = fileURLToPath(new URL(file, import.meta.url));
          return [entryName, entryUrl];
        }),
      ),
      output: {
        entryFileNames: '[name].js',
        assetFileNames: ({ names }) => {
          const name = names[0];
          if (name && name.endsWith('.css')) {
            const componentName = kebabCase(name.slice(0, name.length - 4));
            return `components/${componentName}/${componentName}[extname]`;
          }
          return 'assets/[name][extname]';
        },
        globals: {
          react: 'React',
          'react-dom': 'React-dom',
          'react/jsx-runtime': 'react/jsx-runtime',
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',
    // you might want to disable it, if you don't have tests that rely on CSS
    // since parsing CSS is slow
    css: true,
    coverage: {
      reporter: ['text', 'json-summary', 'json'],
      include: ['src'],
      exclude: ['dist', 'node_modules', 'src/main.ts', '**/*.d.ts', '**/*.stories.tsx', '**/index.ts', '**/I**.ts', '**/types', '**/enums'],
      thresholds: {
        lines: 75,
        statements: 75,
        functions: 80,
        branches: 80,
      },
    },
  },
});
