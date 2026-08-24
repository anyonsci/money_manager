import { VitePWA, type ManifestOptions } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';
import type { PluginOption } from 'vite';

export interface PwaConfigOptions {
  name: string;
  shortName: string;
  description: string;
  cachePrefix: string;
  outDir: string;
  themeColor?: string;
  backgroundColor?: string;
  scope?: string;
  startUrl?: string;
  shortcutTitle?: string;
  customManifest?: Partial<ManifestOptions>;
}

export function stampServiceWorkerPlugin(cachePrefix: string, distSwPath: string): PluginOption {
  return {
    name: 'stamp-service-worker',
    enforce: 'post' as const,
    async closeBundle() {
      // Small delay to ensure Workbox finishes writing before custom SW stamping
      await new Promise((resolve) => setTimeout(resolve, 200));

      if (fs.existsSync(distSwPath)) {
        const buildTimestamp = `v-${Date.now()}`;
        let content = fs.readFileSync(distSwPath, 'utf-8');
        content = content.replace(
          /const CACHE_NAME = ['"].*?['"]/,
          `const CACHE_NAME = '${cachePrefix}-${buildTimestamp}'`
        );
        fs.writeFileSync(distSwPath, content);
        console.log(`[stampServiceWorker] Stamped ${path.basename(distSwPath)} with CACHE_NAME: ${cachePrefix}-${buildTimestamp}`);
      }
    }
  };
}

export function createPwaPlugins(options: PwaConfigOptions): PluginOption[] {
  const {
    name,
    shortName,
    description,
    cachePrefix,
    outDir,
    themeColor = '#0f172a',
    backgroundColor = '#0f172a',
    scope = './',
    startUrl = './#/',
    shortcutTitle = 'Quick Entry',
    customManifest = {}
  } = options;

  const distSwPath = path.resolve(outDir, 'sw.js');

  const pwaPlugin = VitePWA({
    injectRegister: null,
    manifest: {
      name,
      short_name: shortName,
      description,
      theme_color: themeColor,
      background_color: backgroundColor,
      display: 'standalone',
      orientation: 'portrait',
      scope,
      start_url: startUrl,
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
          name: shortcutTitle,
          short_name: shortcutTitle.replace(/\s+/g, ''),
          description: `Open ${shortcutTitle} instantly`,
          url: startUrl,
          icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
        }
      ],
      ...customManifest
    }
  });

  const stampPlugin = stampServiceWorkerPlugin(cachePrefix, distSwPath);

  return [pwaPlugin, stampPlugin];
}
