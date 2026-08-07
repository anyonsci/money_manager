import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { ResponsiveLayout } from './components/layout/ResponsiveLayout';
import { LoginView } from './components/auth/LoginView';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import { Loader2 } from 'lucide-react';

const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const UserSettingsView = lazy(() => import('./components/settings/UserSettingsView'));

const PageLoader = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-400 gap-3">
    <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
    <p className="text-sm font-medium">Loading view...</p>
  </div>
);

function App() {
  const { accessToken, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.hash === '') {
      navigate('/');
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <ResponsiveLayout>
        <PageLoader />
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      {!accessToken ? (
        <LoginView />
      ) : (
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<UserSettingsView />} />
          </Routes>
        </Suspense>
      )}
    </ResponsiveLayout>
  );
}

export default App;
