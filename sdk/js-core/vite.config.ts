/// <reference types="vite/client" />
/// <reference types="vitest" />
import path, { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { globSync } from 'glob';
import { fileURLToPath } from 'node:url';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    libInjectCss(),
    dts({
      tsconfigPath: './tsconfig.app.json',
      exclude: ['**/*.stories.tsx', '**/*.stories.ts', '**/*.test.tsx'],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: '@jtl/platform-plugins-core',
      formats: ['es'],
    },
    sourcemap: true,
    minify: false,
    rollupOptions: {
      input: Object.fromEntries(
        globSync(['src/main.ts'], {
          ignore: ['**/*.test.ts'],
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
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    // you might want to disable it, if you don't have tests that rely on CSS
    // since parsing CSS is slow
    css: true,
    coverage: {
      reporter: ['text', 'json-summary', 'json'],
      include: ['src'],
      exclude: ['dist', 'node_modules', 'src/main.ts', '**/*.d.ts', '**/*.stories.tsx', '**/index.ts', '**/I**.ts', '**/types/**.ts'],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 80,
      },
    },
  },
});
