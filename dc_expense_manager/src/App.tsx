import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.js';
import { ResponsiveLayout } from './components/layout/ResponsiveLayout.js';
import { LoginView } from './components/auth/LoginView.js';
import { HomePage } from './pages/HomePage.js';
import { TransactionsPage } from './pages/TransactionsPage.js';
import { AnalyticsPage } from './pages/AnalyticsPage.js';
import { Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 space-y-3">
        <Loader2 size={36} className="animate-spin text-brand-500" />
        <p className="text-xs font-semibold uppercase tracking-wider">
          Initializing DC Expense Manager...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <ResponsiveLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ResponsiveLayout>
  );
};

export default App;
