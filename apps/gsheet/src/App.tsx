import React, { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { ResponsiveLayout, PageLoader } from '@money-manager/ui';
import { LoginView } from './components/auth/LoginView';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import { User, Sparkles } from 'lucide-react';

const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const UserSettingsView = lazy(() => import('./components/settings/UserSettingsView'));

export const App: React.FC = () => {
  const { accessToken, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.hash === '') {
      navigate('/');
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <ResponsiveLayout
        brandTitle="Money Manager"
        brandSubtitle="Google Sheets Edition"
        brandIcon={
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 border border-brand-500/30 text-brand-400 shadow-md">
            <Sparkles size={20} />
          </div>
        }
      >
        <PageLoader message="Initializing Money Manager..." />
      </ResponsiveLayout>
    );
  }

  if (!accessToken) {
    return (
      <ResponsiveLayout
        brandTitle="Money Manager"
        brandSubtitle="Google Sheets Edition"
        brandIcon={
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 border border-brand-500/30 text-brand-400 shadow-md">
            <Sparkles size={20} />
          </div>
        }
        showNav={false}
      >
        <LoginView />
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout
      brandTitle="Money Manager"
      brandSubtitle="Google Sheets Edition"
      brandBadge="Sheets"
      brandIcon={
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 border border-brand-500/30 text-brand-400 shadow-md">
          <Sparkles size={20} />
        </div>
      }
      onLogoClick={() => navigate('/')}
      userAvatar={
        <button
          type="button"
          onClick={() => navigate('/settings')}
          title="User Settings"
          className="flex items-center justify-center p-1 rounded-full border border-slate-700 bg-slate-900 hover:border-brand-500 transition shadow-md"
        >
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.name || user.email}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-200">
              <User size={18} />
            </div>
          )}
        </button>
      }
    >
      <Suspense fallback={<PageLoader message="Loading view..." />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<UserSettingsView />} />
        </Routes>
      </Suspense>
    </ResponsiveLayout>
  );
};

export default App;
