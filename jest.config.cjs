const path = require('path');

/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@money-manager/core$': '<rootDir>/packages/core/src',
    '^@money-manager/core/(.*)$': '<rootDir>/packages/core/src/$1',
    '^@money-manager/dc-client$': '<rootDir>/packages/dc-client/src',
    '^@money-manager/dc-client/(.*)$': '<rootDir>/packages/dc-client/src/$1',
    '^@money-manager/pwa$': '<rootDir>/packages/pwa/src',
    '^@money-manager/pwa/vite$': '<rootDir>/packages/pwa/src/vite',
    '^@money-manager/pwa/client$': '<rootDir>/packages/pwa/src/client',
    '^@money-manager/pwa/(.*)$': '<rootDir>/packages/pwa/src/$1',
    '^@money-manager/tailwind-preset$': '<rootDir>/packages/tailwind-preset/index.js',
    '^@money-manager/ui$': '<rootDir>/packages/ui/src',
    '^@money-manager/ui/(.*)$': '<rootDir>/packages/ui/src/$1',
    '^\\./client\\.js$': '<rootDir>/packages/pwa/src/client.ts',
  },
  transform: {
    '^.+\\.[jt]sx?$': [
      'babel-jest',
      {
        configFile: path.resolve(__dirname, 'babel.config.cjs'),
      },
    ],
  },
  testMatch: [
    '<rootDir>/packages/**/__tests__/**/*.test.[jt]s?(x)',
    '<rootDir>/packages/**/?(*.)+(spec|test).[jt]s?(x)',
    '<rootDir>/apps/**/__tests__/**/*.test.[jt]s?(x)',
    '<rootDir>/apps/**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  collectCoverageFrom: [
    'packages/*/src/**/*.{ts,tsx}',
    'packages/tailwind-preset/index.js',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
};
