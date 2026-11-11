import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': import.meta.dirname, 'server-only': resolve(import.meta.dirname, 'test/vacio.ts') } },
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text-summary'],
      include: ['app/**', 'lib/**', 'componentes/**', 'proxy.ts'],
      exclude: ['lib/tipos-api.ts', 'app/globals.css', 'app/icon.svg'],
    },
  },
});
