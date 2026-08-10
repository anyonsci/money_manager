import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from './Navigation';
import { useAuth } from '../../context/AuthContext';
import { User } from 'lucide-react';
import { PwaInstallPrompt } from '../common/PwaInstallPrompt';

interface ResponsiveLayoutProps {
  children: ReactNode;
}

export const ResponsiveLayout = ({ children }: ResponsiveLayoutProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col w-full">
      {/* Top Header spanning full width */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/90 px-4 sm:px-6 lg:px-8 py-3.5 backdrop-blur-md shadow-sm">
        <div className="w-full flex items-center justify-between gap-4">
          {/* Left Title / Logo */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-3 text-left focus:outline-none group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 border border-brand-500/30 group-hover:border-brand-500 transition-all overflow-hidden shadow-md">
              <img src="./icon.svg" alt="Money Manager Logo" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-tight group-hover:text-brand-300 transition-colors">
                Money Manager
              </h1>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">Family finance at a glance</p>
            </div>
          </button>

          {/* Right User Icon */}
          <div className="flex items-center gap-3">
            {user && (
              <button
                type="button"
                onClick={() => navigate('/settings')}
                title="User Settings"
                className="flex items-center justify-center p-1 rounded-full border-2 border-slate-700 bg-slate-900 hover:border-brand-500 hover:bg-slate-800 transition-all duration-200 active:scale-95 shadow-md"
              >
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name || user.email}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-200">
                    <User size={20} />
                  </div>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area spanning full width */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 pb-28">
        {children}
      </main>

      {/* PWA Install Banner */}
      <PwaInstallPrompt />

      {/* Full-width Bottom Navigation Bar */}
      {user && <Navigation />}
    </div>
  );
};


