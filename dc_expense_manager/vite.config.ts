import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';

function stampServiceWorker() {
  return {
    name: 'stamp-service-worker',
    enforce: 'post' as const,
    async closeBundle() {
      // Small delay to ensure Workbox finishes writing before we overwrite with custom SW
      await new Promise((resolve) => setTimeout(resolve, 200));

      const srcSwPath = path.resolve(__dirname, 'public/sw.js');
      const distSwPath = path.resolve(__dirname, '../dist/dc_expense_manager/sw.js');
      if (fs.existsSync(srcSwPath)) {
        const buildTimestamp = `v-${Date.now()}`;
        let content = fs.readFileSync(srcSwPath, 'utf-8');
        content = content.replace(
          /const CACHE_NAME = ['"].*?['"]/,
          `const CACHE_NAME = 'dc-expense-manager-cache-${buildTimestamp}'`
        );
        if (fs.existsSync(path.dirname(distSwPath))) {
          fs.writeFileSync(distSwPath, content);
          console.log(`[stampServiceWorker] Stamped dist/dc_expense_manager/sw.js with CACHE_NAME: dc-expense-manager-cache-${buildTimestamp}`);
        }
      }
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      injectRegister: null,
      manifest: {
        name: 'DC Expense Manager (Ledger)',
        short_name: 'DC Expense',
        description: 'Double-entry personal finance tracking with automated account transpilation',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: './',
        start_url: './#/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ],
        shortcuts: [
          {
            name: 'Quick Entry',
            short_name: 'QuickEntry',
            description: 'Open Quick Entry form instantly',
            url: './#/',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          }
        ]
      }
    }),
    stampServiceWorker()
  ],
  base: './',
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  build: {
    outDir: '../dist/dc_expense_manager',
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
