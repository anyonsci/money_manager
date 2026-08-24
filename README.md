# Money Manager — Multi-Frontend Monorepo

This repository hosts multiple specialized frontend applications for the Money Manager ecosystem, designed to be deployed seamlessly to **GitHub Pages** as independent, installable Progressive Web Apps (PWAs).

It uses an **npm workspaces monorepo** with shared core domain logic and a shared UI component system following **Hexagonal Architecture (Ports & Adapters)**.

---

## 🏛️ Directory Architecture

```
money_manager/
├── package.json                         # Monorepo root coordinating workspace scripts
├── tsconfig.base.json                   # Shared TypeScript compiler options
├── index.html                           # Root Portal / App Launcher (https://username.github.io/money_manager/)
├── 404.html                             # GitHub Pages SPA redirect handler
├── build-root.js                        # Deployment packaging script for GitHub Pages
│
├── packages/
│   ├── core/                            # 🧠 @money-manager/core (Pure TypeScript Domain Kernel)
│   │   ├── src/types/                   # UnifiedTransaction, TransactionFormValues, ApiResponse
│   │   ├── src/constants/               # ALLOWED_CATEGORIES, CATEGORY_COLORS
│   │   ├── src/formatters/              # formatCurrency, formatDate, formatInputDate
│   │   ├── src/domain/                  # parseCsvTransaction (Quick Entry NLP search parser)
│   │   └── src/adapters/                # StorageAdapter port contract
│   │
│   ├── ui/                              # 🎨 @money-manager/ui (Shared Design System & Components)
│   │   ├── src/components/layout/       # ResponsiveLayout (Slot-based), Navigation, Modal
│   │   ├── src/components/common/       # PwaInstallPrompt, PageLoader
│   │   ├── src/components/analytics/    # AnalyticsSummary (3 cards), CategoryPieChart (Recharts)
│   │   └── src/components/transactions/ # TransactionCard, TransactionList, TransactionModal, Pagination
│   │
│   ├── pwa/                             # 📲 @money-manager/pwa (Standardized PWA Tooling & SW Lifecycle)
│   │   ├── src/client.ts                # initPwaLifecycle() (Safe dev/prod SW registrar)
│   │   └── src/vite.ts                  # createPwaPlugins() (VitePWA generator & SW cache stamper)
│   │
│   └── tailwind-preset/                 # 🎭 @money-manager/tailwind-preset (Shared Design Tokens & Presets)
│       └── index.js                     # Canonical brand palette (50-950), shadows, and auto-content globs
│
└── apps/
    ├── gsheet/                          # 📊 Google Sheets PWA (Hosted at /gsheet/)
    │   ├── package.json
    │   ├── vite.config.ts               # Built to ../../dist/gsheet
    │   ├── public/                      # Dedicated manifest.json, sw.js, and PWA icons
    │   └── src/adapters/                # GSheetStorageAdapter (Apps Script RPC client)
    │
    └── dc_expense_manager/              # 🏦 DC Expense Manager PWA (Hosted at /dc_expense_manager/)
        ├── package.json
        ├── vite.config.ts               # Built to ../../dist/dc_expense_manager
        ├── public/                      # Dedicated manifest.json, sw.js, and PWA icons
        └── src/adapters/                # DcLedgerStorageAdapter (Double-Entry Ledger REST client)
```

---

## 🧩 Architectural Design

```
┌─────────────────────────────────────────────────────────────┐
│                    @money-manager/ui                        │
│   ResponsiveLayout • Navigation • Modal • Analytics • Cards  │
└──────────────────────────────┬──────────────────────────────┘
                               │ depends on
┌──────────────────────────────▼──────────────────────────────┐
│                    @money-manager/core                      │
│   UnifiedTransaction • parseCsvTransaction • StorageAdapter  │
└──────────────────────▲──────────────────────────────▲───────┘
                       │                              │
         implements    │                              │ implements
┌──────────────────────┴────────┐            ┌────────┴────────────────────┐
│         apps/gsheet           │            │    apps/dc_expense_manager  │
│    (GSheetStorageAdapter)     │            │    (DcLedgerStorageAdapter) │
└───────────────────────────────┘            └─────────────────────────────┘
```

- **Clean Architecture & Separation of Concerns**: Core domain types, CSV quick-entry parsing, formatting utilities, and UI primitives are defined once in `packages/` and shared by all apps.
- **Ports & Adapters Pattern**: Storage backends implement the common `StorageAdapter` interface, allowing pluggable backend support (Google Sheets, Cloud Ledger, Local Mock).
- **PWA & Offline Isolation**: Each sub-app maintains its own PWA service worker cache scope, web manifest, and icons.

---

## 🚀 Development

Install dependencies across all workspaces:
```bash
npm install
```

Run specific frontend apps locally:
```bash
# Develop Google Sheets Frontend (default port 3000)
npm run dev:gsheet

# Develop DeriveCount Double-Entry Frontend (default port 3000)
npm run dev:dc
# or
npm run dev
```

---

## 📦 Build & Deployment (GitHub Pages)

To build all packages, apps, and package the GitHub Pages distribution:
```bash
npm run build
```

This generates:
```
dist/
├── index.html                  # https://username.github.io/money_manager/ (Root Portal Hub)
├── 404.html                    # SPA client-side routing fallback
├── gsheet/                     # https://username.github.io/money_manager/gsheet/ (Google Sheets PWA)
│   ├── index.html
│   ├── manifest.webmanifest
│   ├── sw.js
│   └── assets/...
└── dc_expense_manager/         # https://username.github.io/money_manager/dc_expense_manager/ (DC Ledger PWA)
    ├── index.html
    ├── manifest.webmanifest
    ├── sw.js
    └── assets/...
```

Preview the production build locally:
```bash
npm run preview
```

Deploy directly to GitHub Pages:
```bash
npm run deploy
```
