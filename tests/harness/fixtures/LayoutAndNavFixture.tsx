import React, { useState } from 'react';
import { ResponsiveLayout, Navigation } from '@money-manager/ui';
import { Wallet, Settings, Bell } from 'lucide-react';

export const LayoutAndNavFixture: React.FC = () => {
  const [logoClicked, setLogoClicked] = useState(false);

  return (
    <div data-testid="layout-fixture-container">
      <ResponsiveLayout
        brandTitle="DeriveCount Money"
        brandSubtitle="Double-Entry Financial Suite"
        brandBadge="LEDGER"
        brandIcon={
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-lg">
            <Wallet size={20} />
          </div>
        }
        headerControls={
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-xl border border-slate-800 bg-slate-900/80 p-2 text-slate-400 hover:text-white"
              title="Notifications"
            >
              <Bell size={16} />
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-800 bg-slate-900/80 p-2 text-slate-400 hover:text-white"
              title="Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        }
        userAvatar={
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/20 text-xs font-bold text-brand-300 border border-brand-500/30">
            JD
          </div>
        }
        onLogoClick={() => setLogoClicked(true)}
        showNav={true}
      >
        <div className="space-y-6" data-testid="layout-main-content">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur">
            <h2 className="text-xl font-bold text-white mb-2">Welcome back, John!</h2>
            <p className="text-sm text-slate-400">
              This layout provides the universal responsive frame used across all Money Manager sub-apps.
            </p>
            {logoClicked && (
              <p data-testid="logo-click-indicator" className="mt-3 text-xs text-emerald-400 font-semibold">
                Logo was clicked successfully!
              </p>
            )}
          </div>
        </div>
      </ResponsiveLayout>
    </div>
  );
};
