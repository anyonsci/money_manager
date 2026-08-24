import fs from 'fs';
import { stampServiceWorkerPlugin, createPwaPlugins } from '../src/vite';

describe('PWA Vite Plugins', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('stampServiceWorkerPlugin', () => {
    it('creates plugin with name and post enforce', () => {
      const plugin = stampServiceWorkerPlugin('app-cache', '/dist/sw.js') as any;
      expect(plugin.name).toBe('stamp-service-worker');
      expect(plugin.enforce).toBe('post');
      expect(typeof plugin.closeBundle).toBe('function');
    });

    it('stamps SW file with timestamp cache name when file exists', async () => {
      const plugin = stampServiceWorkerPlugin('my-app', '/dist/sw.js') as any;
      const dummySwContent = `const CACHE_NAME = 'placeholder'; self.addEventListener('fetch', () => {});`;

      const existsSpy = jest.spyOn(fs, 'existsSync').mockImplementation((p) => {
        if (p === '/dist/sw.js') return true;
        return jest.requireActual('fs').existsSync(p);
      });
      const readSpy = jest.spyOn(fs, 'readFileSync').mockImplementation((p, opt) => {
        if (p === '/dist/sw.js') return dummySwContent;
        return jest.requireActual('fs').readFileSync(p, opt);
      });
      const writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await plugin.closeBundle();

      expect(existsSpy).toHaveBeenCalledWith('/dist/sw.js');
      expect(readSpy).toHaveBeenCalledWith('/dist/sw.js', 'utf-8');
      expect(writeSpy).toHaveBeenCalled();

      const writtenContent = writeSpy.mock.calls[0][1] as string;
      expect(writtenContent).toMatch(/const CACHE_NAME = 'my-app-v-\d+'/);

      existsSpy.mockRestore();
      readSpy.mockRestore();
      writeSpy.mockRestore();
      logSpy.mockRestore();
    });

    it('skips stamping if SW file does not exist', async () => {
      const plugin = stampServiceWorkerPlugin('my-app', '/dist/sw.js') as any;
      const existsSpy = jest.spyOn(fs, 'existsSync').mockImplementation((p) => {
        if (p === '/dist/sw.js') return false;
        return jest.requireActual('fs').existsSync(p);
      });
      const readSpy = jest.spyOn(fs, 'readFileSync');
      const writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});

      await plugin.closeBundle();

      expect(readSpy).not.toHaveBeenCalled();
      expect(writeSpy).not.toHaveBeenCalled();

      existsSpy.mockRestore();
      readSpy.mockRestore();
      writeSpy.mockRestore();
    });
  });

  describe('createPwaPlugins', () => {
    it('returns array of plugins including VitePWA and stampPlugin', () => {
      const plugins = createPwaPlugins({
        name: 'My Custom App',
        shortName: 'CustomApp',
        description: 'Test PWA app',
        cachePrefix: 'custom-cache',
        outDir: '/dist/app',
      });

      expect(Array.isArray(plugins)).toBe(true);
      expect(plugins.length).toBe(2);

      const stampPlugin = plugins[1] as any;
      expect(stampPlugin.name).toBe('stamp-service-worker');
    });

    it('accepts custom manifest overrides', () => {
      const plugins = createPwaPlugins({
        name: 'Budget App',
        shortName: 'Budget',
        description: 'Budget description',
        cachePrefix: 'budget-cache',
        outDir: '/dist/budget',
        themeColor: '#123456',
        backgroundColor: '#654321',
        shortcutTitle: 'Add Entry',
        customManifest: {
          orientation: 'landscape',
        },
      });

      expect(plugins).toBeDefined();
      expect(plugins.length).toBe(2);
    });
  });
});
