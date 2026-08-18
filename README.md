# Money Manager — Multi-Frontend Monorepo

This repository hosts multiple specialized frontend applications for the Money Manager ecosystem, designed to be deployed seamlessly to **GitHub Pages** as independent, installable Progressive Web Apps (PWAs).

---

## 🏛️ Directory Architecture

```
money_manager/
├── package.json              # Monorepo root coordinating workspace scripts
├── index.html                # Root Portal / App Launcher (https://username.github.io/money_manager/)
├── build-root.js             # Deployment packaging script for GitHub Pages
│
├── gsheet/                   # 📊 Google Sheets Frontend (PWA)
│   ├── package.json
│   ├── vite.config.ts        # Built to ../dist/gsheet
│   ├── index.html            # Hosted at https://username.github.io/money_manager/gsheet/
│   ├── public/               # Dedicated manifest.json, sw.js, and PWA icons
│   └── src/                  # React + Tailwind + Google Sheets API application
│
└── [future-site]/            # 🚀 Future Frontends (e.g. DeriveCount Double-Entry Ledger)
    ├── package.json
    ├── vite.config.ts
    └── ...
```

---

## 🚀 Development

Run the Google Sheets frontend locally:
```bash
npm run dev
# or
npm run dev:gsheet
```

---

## 📦 Build & Deployment (GitHub Pages)

To build all frontends and prepare the GitHub Pages distribution:
```bash
npm run build
```

This generates:
```
dist/
├── index.html        # https://username.github.io/money_manager/ (Root Portal)
└── gsheet/           # https://username.github.io/money_manager/gsheet/ (Google Sheets PWA)
    ├── index.html
    ├── manifest.json
    ├── sw.js
    └── assets/...
```

Deploy directly to GitHub Pages:
```bash
npm run deploy
```
