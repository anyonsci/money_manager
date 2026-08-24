import React, { ReactNode } from 'react';
import { Navigation } from './Navigation';
import { PwaInstallPrompt } from '../common/PwaInstallPrompt';

export interface ResponsiveLayoutProps {
  children: ReactNode;
  brandTitle?: string;
  brandSubtitle?: string;
  brandBadge?: string;
  brandIcon?: ReactNode;
  headerControls?: ReactNode;
  userAvatar?: ReactNode;
  onLogoClick?: () => void;
  showNav?: boolean;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  brandTitle = 'Money Manager',
  brandSubtitle = 'Personal finance at a glance',
  brandBadge,
  brandIcon,
  headerControls,
  userAvatar,
  onLogoClick,
  showNav = true
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans w-full">
      {/* Top Header */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/90 px-4 sm:px-6 lg:px-8 py-3 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          {/* Logo & Brand */}
          <button
            type="button"
            onClick={onLogoClick}
            className={`flex items-center gap-3 text-left focus:outline-none ${onLogoClick ? 'cursor-pointer group' : 'cursor-default'}`}
          >
            {brandIcon}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                  {brandTitle}
                </h1>
                {brandBadge && (
                  <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold text-brand-400 border border-brand-500/20">
                    {brandBadge}
                  </span>
                )}
              </div>
              {brandSubtitle && (
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  {brandSubtitle}
                </p>
              )}
            </div>
          </button>

          {/* Right Header Controls & Avatar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {headerControls}
            {userAvatar}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 pb-28">
        <div className="mx-auto max-w-5xl">
          {children}
        </div>
      </main>

      {/* PWA Install Banner */}
      <PwaInstallPrompt />

      {/* Bottom Navigation */}
      {showNav && <Navigation />}
    </div>
  );
};
