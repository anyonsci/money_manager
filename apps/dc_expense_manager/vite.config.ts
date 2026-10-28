import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createPwaPlugins } from '@money-manager/pwa/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    ...createPwaPlugins({
      name: 'DC Expense Manager (Ledger)',
      shortName: 'DC Expense',
      description: 'Double-entry personal finance tracking with automated account transpilation',
      cachePrefix: 'dc-expense-manager-cache',
      outDir: path.resolve(__dirname, '../../dist/dc_expense_manager')
    })
  ],
  base: './',
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  build: {
    outDir: '../../dist/dc_expense_manager',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react/') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@react-oauth/google')) {
              return 'vendor-auth';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('recharts')) {
              return 'vendor-recharts';
            }
          }
        }
      }
    }
  }
});
