# AGENTS.md — Agent & Developer Operational Manual

Welcome! This repository is a **multi-frontend monorepo** designed for personal finance applications deployed to **GitHub Pages** as independent, installable Progressive Web Apps (PWAs).

This document serves as the architectural blueprint and operational rulebook for AI coding agents and engineers working on this codebase.

---

## 🏛️ Monorepo Directory Architecture

```
money_manager/
├── package.json                         # Root npm workspaces coordinator
├── tsconfig.base.json                   # Shared TypeScript compiler options ("strict": true)
├── index.html                           # Root App Launcher Portal (https://<user>.github.io/money_manager/)
├── 404.html                             # SPA client-side deep linking fallback for GitHub Pages
├── build-root.js                        # Packages dist/ with root portal, 404 handler, and sub-apps
│
├── packages/
│   ├── core/                            # 🧠 @money-manager/core (Pure TypeScript Domain Kernel)
│   │   ├── src/types/                   # UnifiedTransaction, TransactionFormValues, ApiResponse, etc.
│   │   ├── src/constants/               # ALLOWED_CATEGORIES, CATEGORY_COLORS
│   │   ├── src/formatters/              # formatCurrency, formatDate, formatInputDate, getCategoryIcon
│   │   ├── src/domain/                  # parseCsvTransaction (Quick Entry natural language parser)
│   │   ├── src/adapters/                # StorageAdapter interface & PaginatedResult contract
│   │   └── src/utils/auth.ts            # createAuthStorage(prefix), parseJwt, isTokenExpired
│   │
│   ├── ui/                              # 🎨 @money-manager/ui (Shared Design System & Components)
│   │   ├── src/components/layout/       # ResponsiveLayout (Slot-based), Navigation, Modal
│   │   ├── src/components/common/       # PwaInstallPrompt, PageLoader
│   │   ├── src/components/analytics/    # AnalyticsSummary (3 cards), CategoryPieChart (Recharts)
│   │   └── src/components/transactions/ # TransactionCard, TransactionList, TransactionModal, Pagination
│   │
│   ├── pwa/                             # 📲 @money-manager/pwa (Standardized PWA Framework)
│   │   ├── src/client.ts                # initPwaLifecycle() (Safe dev/prod SW registrar & HMR protector)
│   │   └── src/vite.ts                  # createPwaPlugins() (VitePWA generator & SW cache stamper)
│   │
│   ├── tailwind-preset/                 # 🎭 @money-manager/tailwind-preset (Shared Design Tokens)
│   │   └── index.js                     # Canonical brand palette (50-950), deep slates, soft shadows
│   │
│   └── dc-client/                       # 🏦 @money-manager/dc-client (DeriveCount Ledger SDK & SSO)
│       ├── src/types/                   # Workspace, AccountGroup, Account, DeriveCountTransaction
│       ├── src/auth/                    # dcAuthStorage (SSO token manager across all dc_* apps)
│       ├── src/api/                     # Auto-refreshing apiClient & DeriveCount REST endpoints
│       ├── src/services/                # LedgerTranspilerService (Double-entry journal posting engine)
│       ├── src/adapters/                # DcLedgerStorageAdapter (Implements StorageAdapter)
│       └── src/context/                 # WorkspaceContext, WorkspaceProvider, useWorkspace
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

---

## 🛠️ How to Add a New Application (Step-by-Step)

### Scenario A: Adding a new DeriveCount App (e.g. `apps/dc_budget_planner`)
1. Create directory `apps/dc_budget_planner` with `package.json` and `tsconfig.json`.
2. Add dependencies:
   ```json
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

## ⚡ Development & Build Commands

```bash
# Install dependencies across monorepo
npm install

# Run individual apps locally (with instant HMR)
npm run dev:gsheet
npm run dev:dc

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
5. `npm run build` (Ensures zero build errors and verifies `dist/` packaging).
