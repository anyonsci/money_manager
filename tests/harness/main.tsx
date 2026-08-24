import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './index.css';

import { AnalyticsSummaryFixture } from './fixtures/AnalyticsSummaryFixture';
import { CategoryPieChartFixture } from './fixtures/CategoryPieChartFixture';
import { TransactionCardFixture } from './fixtures/TransactionCardFixture';
import { TransactionListFixture } from './fixtures/TransactionListFixture';
import { TransactionModalFixture } from './fixtures/TransactionModalFixture';
import { ModalFixture } from './fixtures/ModalFixture';
import { LayoutAndNavFixture } from './fixtures/LayoutAndNavFixture';
import { PaginationLoaderFixture } from './fixtures/PaginationLoaderFixture';

const NavigationHub: React.FC = () => {
  const routes = [
    { path: '/analytics-summary', label: 'AnalyticsSummary Component' },
    { path: '/category-pie-chart', label: 'CategoryPieChart Component' },
    { path: '/transaction-card', label: 'TransactionCard Component' },
    { path: '/transaction-list', label: 'TransactionList Component' },
    { path: '/transaction-modal', label: 'TransactionModal Component' },
    { path: '/modal', label: 'Modal Dialog Component' },
    { path: '/layout-nav', label: 'ResponsiveLayout & Navigation' },
    { path: '/pagination-loader', label: 'Pagination & PageLoader Components' },
  ];

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <h1 className="text-2xl font-bold text-white mb-2">@money-manager/ui Test Harness</h1>
      <p className="text-sm text-slate-400 mb-6">Interactive workbench and fixture host for Playwright visual & functional tests.</p>
      
      <div className="grid gap-3">
        {routes.map((r) => (
          <Link
            key={r.path}
            to={r.path}
            className="flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-brand-500/40 text-sm font-medium text-slate-200 hover:text-white transition shadow-sm"
          >
            <span>{r.label}</span>
            <span className="text-xs text-slate-500 font-mono">{r.path}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NavigationHub />} />
        <Route path="/analytics-summary" element={<AnalyticsSummaryFixture />} />
        <Route path="/category-pie-chart" element={<CategoryPieChartFixture />} />
        <Route path="/transaction-card" element={<TransactionCardFixture />} />
        <Route path="/transaction-list" element={<TransactionListFixture />} />
        <Route path="/transaction-modal" element={<TransactionModalFixture />} />
        <Route path="/modal" element={<ModalFixture />} />
        <Route path="/layout-nav" element={<LayoutAndNavFixture />} />
        <Route path="/pagination-loader" element={<PaginationLoaderFixture />} />
      </Routes>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
