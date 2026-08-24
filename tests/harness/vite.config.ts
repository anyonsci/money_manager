import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: path.resolve(__dirname),
  plugins: [react()],
  resolve: {
    alias: {
      '@money-manager/core': path.resolve(__dirname, '../../packages/core/src'),
      '@money-manager/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@money-manager/tailwind-preset': path.resolve(__dirname, '../../packages/tailwind-preset/index.js'),
    },
  },
  server: {
    port: 5199,
    host: '127.0.0.1',
    strictPort: true,
  },
});
