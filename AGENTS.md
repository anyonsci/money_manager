# AGENTS.md — Agent & Developer Operational Manual

Welcome! This repository is a **multi-frontend monorepo** designed for personal finance applications deployed to **GitHub Pages** as independent, installable Progressive Web Apps (PWAs).

This document serves as the architectural blueprint and operational rulebook for AI coding agents and engineers working on this codebase.

---

## 🏛️ Monorepo Directory Architecture

```
money_manager/
├── package.json                         # Root npm workspaces coordinator & test scripts
├── tsconfig.base.json                   # Shared TypeScript compiler options ("strict": true)
├── jest.config.cjs                      # Jest testing coordinator with module aliases & jsdom
├── jest.setup.ts                        # Global test setup (matchMedia, ResizeObserver, import.meta)
├── babel.config.cjs                     # Babel transformer with Vite import.meta polyfill for tests
├── playwright.config.ts                 # Playwright visual regression & E2E test runner configuration
├── index.html                           # Root App Launcher Portal (https://<user>.github.io/money_manager/)
├── 404.html                             # SPA client-side deep linking fallback for GitHub Pages
├── build-root.js                        # Packages dist/ with root portal, 404 handler, and sub-apps
│
├── tests/                               # 🎭 Playwright E2E & Visual Regression Test Suite
│   ├── harness/                         # Dedicated Vite UI workbench / test bench for components
│   │   ├── index.html, main.tsx         # Test router hosting isolated component fixture scenarios
│   │   ├── vite.config.ts               # Isolated Vite server on port 5199 with monorepo aliases
│   │   ├── tailwind.config.js           # Shared design preset styling configuration
│   │   └── fixtures/                    # Interactive harnesses for all @money-manager/ui components
│   └── e2e/                             # Playwright specs & golden baseline snapshot images (*.png)
│
├── packages/
│   ├── core/                            # 🧠 @money-manager/core (Pure TypeScript Domain Kernel)
│   │   ├── src/types/                   # UnifiedTransaction, TransactionFormValues, ApiResponse, etc.
│   │   ├── src/constants/               # ALLOWED_CATEGORIES, CATEGORY_COLORS
│   │   ├── src/formatters/              # formatCurrency, formatDate, formatInputDate, getCategoryIcon
│   │   ├── src/domain/                  # parseCsvTransaction (Quick Entry natural language parser)
│   │   ├── src/adapters/                # StorageAdapter interface & PaginatedResult contract
│   │   ├── src/utils/auth.ts            # createAuthStorage(prefix), parseJwt, isTokenExpired
│   │   └── __tests__/                   # Unit tests (categories, formatters, quick entry, auth)
│   │
│   ├── ui/                              # 🎨 @money-manager/ui (Shared Design System & Components)
│   │   ├── src/components/layout/       # ResponsiveLayout (Slot-based), Navigation, Modal
│   │   ├── src/components/common/       # PwaInstallPrompt, PageLoader
│   │   ├── src/components/analytics/    # AnalyticsSummary (3 cards), CategoryPieChart (Recharts)
│   │   ├── src/components/transactions/ # TransactionCard, TransactionList, TransactionModal, LoadMoreButton, Pagination
│   │   └── __tests__/                   # Component tests with @testing-library/react
│   │
│   ├── pwa/                             # 📲 @money-manager/pwa (Standardized PWA Framework)
│   │   ├── src/client.ts                # initPwaLifecycle() (Safe dev/prod SW registrar & HMR protector)
│   │   ├── src/vite.ts                  # createPwaPlugins() (VitePWA generator & SW cache stamper)
│   │   └── __tests__/                   # Lifecycle and build plugin tests
│   │
│   ├── tailwind-preset/                 # 🎭 @money-manager/tailwind-preset (Shared Design Tokens)
│   │   ├── index.js                     # Canonical brand palette (50-950), deep slates, soft shadows
│   │   └── __tests__/                   # Design token verification tests
│   │
│   └── dc-client/                       # 🏦 @money-manager/dc-client (DeriveCount Ledger SDK & SSO)
│       ├── src/types/                   # Workspace, AccountGroup, Account, DeriveCountTransaction
│       ├── src/auth/                    # dcAuthStorage (SSO token manager across all dc_* apps)
│       ├── src/api/                     # Auto-refreshing apiClient & DeriveCount REST endpoints
│       ├── src/services/                # LedgerTranspilerService (Double-entry journal posting engine)
│       ├── src/adapters/                # DcLedgerStorageAdapter (Implements StorageAdapter)
│       ├── src/context/                 # WorkspaceContext, WorkspaceProvider, useWorkspace
│       └── __tests__/                   # Client, endpoints, transpiler, adapter & context tests
│
└── apps/
    ├── gsheet/                          # 📊 Google Sheets PWA (Hosted at /gsheet/)
    │   ├── package.json
    │   ├── vite.config.ts               # Builds to ../../dist/gsheet
    │   ├── public/                      # App-specific manifest.json, sw.js, and PWA icons
    │   └── src/adapters/                # GSheetStorageAdapter (Apps Script RPC client)
    │
    └── dc_expense_manager/              # 🏦 DC Expense Manager PWA (Hosted at /dc_expense_manager/)
        ├── package.json
        ├── vite.config.ts               # Builds to ../../dist/dc_expense_manager
        ├── public/                      # App-specific manifest.json, sw.js, and PWA icons
        └── src/                         # Thin app shell consuming @money-manager/dc-client
```

---

## 🧭 Core Engineering Principles & Agent Rules

### 1. Hexagonal Architecture (Ports & Adapters)
- All frontend data consumption **must** go through the `StorageAdapter` interface (`fetchTransactions`, `createTransaction`, `updateTransaction`, `deleteTransaction`).
- Domain logic in `@money-manager/core` must remain **pure TypeScript** with zero React, DOM, or Node dependencies.

### 2. Storage & Session Isolation (Zero Token Collision)
- Because all apps share the same domain origin on GitHub Pages, **NEVER** use un-namespaced `localStorage` keys (e.g. `localStorage.getItem('access_token')`).
- Always use `createAuthStorage(prefix)` from `@money-manager/core`:
  - Google Sheets: `gsheetAuthStorage` (`gsheet_access_token`, `gsheet_user_profile`)
  - DeriveCount Ecosystem: `dcAuthStorage` (`dc_access_token`, `dc_user_profile`, `dc_active_workspace_id`)
  - New Sub-Apps: `createAuthStorage('<app_name>')`

### 3. PWA Lifecycle & Dev HMR Protection
- **In Production (`import.meta.env.PROD`)**: Registers the service worker with automatic cache version stamping.
- **In Development (`npm run dev`)**: Proactively unregisters service workers and purges dev caches so Vite Hot Module Replacement (HMR) is never blocked by cached assets.
- In any new app's `main.tsx`, call:
  ```typescript
  import { initPwaLifecycle } from '@money-manager/pwa';
  initPwaLifecycle({ appName: 'My App', cachePrefix: 'my-app-cache' });
  ```

### 4. Zero Re-export Shims
- Do not create empty shim files (e.g., `export * from '@money-manager/...'`) inside `apps/*/src/types/`, `apps/*/src/services/`, etc.
- Apps must import directly from `@money-manager/core`, `@money-manager/ui`, `@money-manager/pwa`, `@money-manager/dc-client`, or `@money-manager/tailwind-preset`.

### 5. Unit Testing Standard (Jest & Testing Library)
- All shared packages under `packages/*` must maintain comprehensive unit tests in `packages/<package-name>/__tests__/`.
- Use Jest with `@testing-library/react` for UI components and standard Jest for pure services/adapters.
- When writing tests for modules utilizing Vite's `import.meta.env`, configure or spy on `(globalThis as any).__import_meta.env` (handled by `babel.config.cjs` & `jest.setup.ts`).
- Ensure all tests pass with high coverage (>90%) before finalizing changes.

### 6. Visual & Component Regression Testing Standard (Playwright & Golden Images)
- All shared design system components in `packages/ui` are verified via Playwright E2E and visual snapshot comparisons in `tests/e2e/`.
- Playwright executes tests against an isolated Vite workbench harness (`tests/harness/`) on port 5199 with the shared Tailwind tokens applied.
- Golden image snapshots (`*.png`) are version-controlled alongside tests.
- When updating or refining UI styling intentionally, update the baseline snapshots with:
  ```bash
  npm run test:e2e:update
  ```
- To review visual regressions and pixel diffs interactively:
  ```bash
  npx playwright show-report
  ```
- ⚠️ **Resource-Constrained Environment Rule**: Headless browser testing requires heavy CPU and RAM. On resource-constrained environments (e.g. VPS/VM with ≤1GB RAM, 2 vCPUs, or high hypervisor steal time), **NEVER run Playwright E2E tests** (`npm run test:e2e`) unless explicitly requested by the user, as this can cause swap thrashing and freeze the host.

### 7. Resource-Constrained & Low-Memory Execution Standard
When developing or running tests/builds in memory- or CPU-constrained environments:
- **Single-Threaded In-Band Testing**: Run Jest with `--runInBand`, `maxWorkers: 1`, `workerIdleMemoryLimit: '256MB'`, and a generous `testTimeout: 20000` (in `jest.config.cjs`) so slow VM CPU time does not cause false test timeouts.
- **Node Memory Limits**: Keep Node memory bounded (e.g., `NODE_OPTIONS="--max-old-space-size=512"`).
- **Fast App Builds**: In `apps/*/package.json`, build scripts must be `"build": "vite build"`. Do **NOT** chain redundant `tsc -b && vite build` inside individual app build scripts, as TypeScript checks are performed independently per package/app with `tsc --noEmit`.
- **Zero Orphan Background Tasks**: Avoid leaving background build watchers or long-running tasks running when not in active use.

### 8. Transaction UX, Card Design & Filtering Standards
- **Batch "Load More" Pagination**: Transaction lists use batch loading via `<LoadMoreButton />`. The initial view loads **10 transactions** for fast rendering; subsequent clicks on "Load More" load **200 transactions** per batch. Do **NOT** use automated infinite scroll on window scroll, as it causes performance degradation and DOM/network thrashing on constrained devices.
- **Transaction Filters**: Keep filtering lean. Only provide a text search input (with safe null-checks across notes, categories, and accounts) and a category dropdown filter. Do **NOT** include expense vs. income toggle filters.
- **Transaction Card Specification**:
  - **Left Section**: 2-line date presentation. Line 1 shows date (e.g., `01 Oct`), Line 2 shows year in smaller, muted text (e.g., `2026`).
  - **Main Section**: Top title shows Category and Subcategory; subtitle shows Notes.
  - **Right Section**: Amount on top; Account name below.
  - **Actions**: Remove individual edit and delete icons from the card surface. The entire card is clickable to open the edit form (`TransactionModal`). The delete action resides inside the edit modal.

---

## 🛠️ How to Add a New Application (Step-by-Step)

### Scenario A: Adding a new DeriveCount App (e.g. `apps/dc_budget_planner`)
1. Create directory `apps/dc_budget_planner` with `package.json` and `tsconfig.json`.
2. Add scripts and dependencies to `package.json`:
   ```json
   "scripts": {
     "dev": "vite",
     "build": "vite build",
     "preview": "vite preview"
   },
   "dependencies": {
     "@money-manager/core": "*",
     "@money-manager/ui": "*",
     "@money-manager/pwa": "*",
     "@money-manager/tailwind-preset": "*",
     "@money-manager/dc-client": "*"
   }
   ```
3. Configure `vite.config.ts`:
   ```typescript
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';
   import { createPwaPlugins } from '@money-manager/pwa/vite';
   import path from 'path';

   export default defineConfig({
     plugins: [
       react(),
       ...createPwaPlugins({
         name: 'DC Budget Planner',
         shortName: 'DC Budget',
         description: 'Budget planning with double-entry ledger',
         cachePrefix: 'dc-budget-cache',
         outDir: path.resolve(__dirname, '../../dist/dc_budget_planner')
       })
     ],
     base: './',
     build: { outDir: '../../dist/dc_budget_planner' }
   });
   ```
4. In `src/main.tsx`:
   ```tsx
   import { initPwaLifecycle } from '@money-manager/pwa';
   import { WorkspaceProvider, AuthProvider } from '@money-manager/dc-client';

   initPwaLifecycle({ appName: 'DC Budget Planner', cachePrefix: 'dc-budget-cache' });
   ```
5. Update root `package.json` scripts (`"build:dc_budget"`, `"dev:dc_budget"`, and root `"build"`).
6. Update root `index.html` with a launch card for the new app.

---

## ⚡ Development, Test & Build Commands

```bash
# Install dependencies across monorepo
npm install

# Run individual apps locally (with instant HMR)
npm run dev:gsheet
npm run dev:dc

# Run all unit tests across all packages
npm test

# Run unit tests with code coverage report
npm run test:coverage

# Run tests in interactive watch mode
npm run test:watch

# Run unit tests for a specific package
npx jest packages/core
npx jest packages/dc-client
npx jest packages/ui
npx jest packages/pwa
npx jest packages/tailwind-preset

# Run Playwright E2E & visual regression tests (⚠️ SKIP in resource-constrained environments!)
npm run test:e2e

# Update Playwright visual snapshot golden baselines
npm run test:e2e:update

# View interactive Playwright test & visual diff report
npx playwright show-report

# Build all packages, apps, and package dist/ for GitHub Pages
npm run build

# Preview GitHub Pages distribution locally
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

---

## 🔍 Validation Checklist for Agents

Before completing any task, agents must run and verify:
1. `npx tsc --project packages/core/tsconfig.json --noEmit`
2. `npx tsc --project packages/ui/tsconfig.json --noEmit`
3. `npx tsc --project packages/pwa/tsconfig.json --noEmit`
4. `npx tsc --project packages/dc-client/tsconfig.json --noEmit`
5. `npx tsc --project apps/gsheet/tsconfig.json --noEmit`
6. `npx tsc --project apps/dc_expense_manager/tsconfig.json --noEmit`
7. `npm test` (Ensures 100% passing unit tests across all monorepo packages; executed in-band with 1 worker).
8. `npm run test:e2e` (Run **ONLY** when not in a resource-constrained environment; skip in low-memory/low-CPU environments unless explicitly requested).
9. `npm run build` (Ensures zero build errors and verifies `dist/` packaging).
