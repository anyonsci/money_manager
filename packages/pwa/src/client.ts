export interface PwaLifecycleOptions {
  appName: string;
  cachePrefix: string;
  swPath?: string;
}

/**
 * Initializes PWA Service Worker lifecycle safely:
 * - Production: Registers the Service Worker and logs registration scope.
 * - Development: Unregisters active Service Workers and flushes dev caches so Vite HMR is never intercepted.
 */
export function initPwaLifecycle({
  appName,
  cachePrefix,
  swPath = './sw.js'
}: PwaLifecycleOptions): void {
  if (!('serviceWorker' in navigator)) return;

  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register(swPath)
        .then((registration) => {
          console.log(`[${appName}] ServiceWorker registered with scope:`, registration.scope);
        })
        .catch((err) => {
          console.error(`[${appName}] ServiceWorker registration failed:`, err);
        });
    });
  } else {
    // Development mode: Prevent Service Worker from hijacking Vite dev requests & HMR
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then(() => {
          console.log(`[${appName}] Unregistered development ServiceWorker:`, registration.scope);
        });
      }
    });

    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          if (key.startsWith(cachePrefix)) {
            caches.delete(key);
            console.log(`[${appName}] Purged development cache:`, key);
          }
        });
      });
    }
  }
}
