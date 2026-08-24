import '@testing-library/jest-dom';

// Initialize globalThis.__import_meta for Vite import.meta compatibility
(globalThis as any).__import_meta = {
  env: {
    PROD: false,
    DEV: true,
    MODE: 'test',
    VITE_API_URL: '',
  },
};

// Mock ResizeObserver for Recharts ResponsiveContainer
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});
