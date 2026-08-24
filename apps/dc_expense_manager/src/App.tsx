import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useWorkspace } from './context/WorkspaceContext';
import { ResponsiveLayout, PageLoader, Modal } from '@money-manager/ui';
import { LoginView } from './components/auth/LoginView';
import { HomePage } from './pages/HomePage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { UserSettingsView } from './components/settings/UserSettingsView';
import { Wallet, User, ChevronDown, Layers, Sliders } from 'lucide-react';

export const App: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.hash === '') {
      navigate('/');
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <ResponsiveLayout
        brandTitle="DC Expense"
        brandBadge="Ledger"
        brandSubtitle="Double-Entry Money Manager"
        brandIcon={
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-lg shadow-brand-500/20">
            <Wallet size={22} />
          </div>
        }
      >
        <PageLoader message="Initializing DC Expense Manager..." />
      </ResponsiveLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <ResponsiveLayout
        brandTitle="DC Expense"
        brandBadge="Ledger"
        brandSubtitle="Double-Entry Money Manager"
        brandIcon={
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-lg shadow-brand-500/20">
            <Wallet size={22} />
          </div>
        }
        showNav={false}
      >
        <LoginView />
      </ResponsiveLayout>
    );
  }

  return (
    <>
      <ResponsiveLayout
        brandTitle="DC Expense"
        brandBadge="Ledger"
        brandSubtitle="Double-Entry Money Manager"
        brandIcon={
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-lg shadow-brand-500/20">
            <Wallet size={22} />
          </div>
        }
        onLogoClick={() => navigate('/')}
        headerControls={
          activeWorkspace && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
                className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:border-slate-700 transition"
              >
                <Layers size={14} className="text-brand-400" />
                <span className="max-w-[120px] sm:max-w-[160px] truncate">
                  {activeWorkspace.name}
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {isWorkspaceDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsWorkspaceDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl animate-in fade-in">
                    <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Select Workspace
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {workspaces.map((ws) => (
                        <button
                          key={ws.id}
                          type="button"
                          onClick={() => {
                            setActiveWorkspace(ws);
                            setIsWorkspaceDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium transition ${
                            ws.id === activeWorkspace.id
                              ? 'bg-brand-600 text-white'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <span className="truncate">{ws.name}</span>
                          <span className="text-[10px] opacity-75">{ws.defaultCurrency}</span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 border-t border-slate-800 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsWorkspaceDropdownOpen(false);
                          setIsSettingsOpen(true);
                        }}
                        className="flex w-full items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs text-brand-400 hover:bg-brand-500/10 transition"
                      >
                        <Sliders size={12} />
                        Manage Workspaces
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )
        }
        userAvatar={
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 p-1 text-slate-300 hover:border-slate-700 transition"
            title="User Settings"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500/20 text-brand-400">
                <User size={16} />
              </div>
            )}
          </button>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ResponsiveLayout>

      <Modal
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Settings & Workspaces"
      >
        <UserSettingsView />
      </Modal>
    </>
  );
};

export default App;
