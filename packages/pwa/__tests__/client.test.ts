import { initPwaLifecycle } from '../src/client';

describe('PWA Client Lifecycle', () => {
  const originalNavigator = window.navigator;
  const originalCaches = (window as unknown as { caches?: CacheStorage }).caches;

  beforeEach(() => {
    jest.clearAllMocks();
    (globalThis as any).__import_meta = {
      env: {
        PROD: false,
        DEV: true,
      },
    };
  });

  afterEach(() => {
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
    if (originalCaches) {
      Object.defineProperty(window, 'caches', {
        value: originalCaches,
        writable: true,
        configurable: true,
      });
    }
  });

  it('returns early if serviceWorker is not supported in navigator', () => {
    Object.defineProperty(window, 'navigator', {
      value: {},
      writable: true,
      configurable: true,
    });

    expect(() => {
      initPwaLifecycle({ appName: 'Test App', cachePrefix: 'test-cache' });
    }).not.toThrow();
  });

  describe('in Development Mode (import.meta.env.PROD = false)', () => {
    it('unregisters active service workers and deletes prefixed caches', async () => {
      const mockUnregister = jest.fn().mockResolvedValue(true);
      const mockGetRegistrations = jest.fn().mockResolvedValue([
        { scope: 'http://localhost:3000/', unregister: mockUnregister },
      ]);

      const mockDelete = jest.fn().mockResolvedValue(true);
      const mockKeys = jest.fn().mockResolvedValue([
        'test-cache-v1',
        'test-cache-v2',
        'other-app-cache-v1',
      ]);

      Object.defineProperty(window, 'navigator', {
        value: {
          serviceWorker: {
            getRegistrations: mockGetRegistrations,
          },
        },
        writable: true,
        configurable: true,
      });

      Object.defineProperty(window, 'caches', {
        value: {
          keys: mockKeys,
          delete: mockDelete,
        },
        writable: true,
        configurable: true,
      });

      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      initPwaLifecycle({ appName: 'Dev App', cachePrefix: 'test-cache' });

      expect(mockGetRegistrations).toHaveBeenCalled();
      await Promise.resolve(); // Flush microtasks
      expect(mockUnregister).toHaveBeenCalled();

      expect(mockKeys).toHaveBeenCalled();
      await Promise.resolve(); // Flush microtasks
      expect(mockDelete).toHaveBeenCalledWith('test-cache-v1');
      expect(mockDelete).toHaveBeenCalledWith('test-cache-v2');
      expect(mockDelete).not.toHaveBeenCalledWith('other-app-cache-v1');

      logSpy.mockRestore();
    });

    it('handles environment when caches is not defined in window', async () => {
      const mockGetRegistrations = jest.fn().mockResolvedValue([]);
      Object.defineProperty(window, 'navigator', {
        value: {
          serviceWorker: {
            getRegistrations: mockGetRegistrations,
          },
        },
        writable: true,
        configurable: true,
      });

      // Remove caches from window
      delete (window as unknown as { caches?: CacheStorage }).caches;

      expect(() => {
        initPwaLifecycle({ appName: 'Dev App', cachePrefix: 'test-cache' });
      }).not.toThrow();
    });
  });

  describe('in Production Mode (import.meta.env.PROD = true)', () => {
    it('registers service worker on window load event', async () => {
      (globalThis as any).__import_meta.env.PROD = true;

      const mockRegister = jest.fn().mockResolvedValue({ scope: 'https://user.github.io/app/' });
      Object.defineProperty(window, 'navigator', {
        value: {
          serviceWorker: {
            register: mockRegister,
          },
        },
        writable: true,
        configurable: true,
      });

      const addEventSpy = jest.spyOn(window, 'addEventListener');
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      initPwaLifecycle({ appName: 'Prod App', cachePrefix: 'prod-cache', swPath: './sw.js' });

      expect(addEventSpy).toHaveBeenCalledWith('load', expect.any(Function));

      // Trigger the load handler
      const loadHandler = addEventSpy.mock.calls.find(([event]) => event === 'load')?.[1] as () => void;
      expect(loadHandler).toBeDefined();
      loadHandler();

      expect(mockRegister).toHaveBeenCalledWith('./sw.js');
      await Promise.resolve(); // Flush microtask
      expect(logSpy).toHaveBeenCalledWith(
        '[Prod App] ServiceWorker registered with scope:',
        'https://user.github.io/app/'
      );

      logSpy.mockRestore();
      addEventSpy.mockRestore();
    });

    it('logs error if service worker registration fails', async () => {
      (globalThis as any).__import_meta.env.PROD = true;

      const mockRegister = jest.fn().mockRejectedValue(new Error('Registration error'));
      Object.defineProperty(window, 'navigator', {
        value: {
          serviceWorker: {
            register: mockRegister,
          },
        },
        writable: true,
        configurable: true,
      });

      const addEventSpy = jest.spyOn(window, 'addEventListener');
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      initPwaLifecycle({ appName: 'Prod App', cachePrefix: 'prod-cache', swPath: './sw.js' });

      const loadHandler = addEventSpy.mock.calls.find(([event]) => event === 'load')?.[1] as () => void;
      loadHandler();

      await Promise.resolve();
      await Promise.resolve();

      expect(errorSpy).toHaveBeenCalledWith(
        '[Prod App] ServiceWorker registration failed:',
        expect.any(Error)
      );

      errorSpy.mockRestore();
      addEventSpy.mockRestore();
    });
  });
});
