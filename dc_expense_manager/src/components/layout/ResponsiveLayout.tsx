import React, { useState } from 'react';
import { Navigation } from './Navigation.js';
import { PwaInstallPrompt } from '../common/PwaInstallPrompt.js';
import { useAuth } from '../../context/AuthContext.js';
import { useWorkspace } from '../../context/WorkspaceContext.js';
import { UserSettingsView } from '../settings/UserSettingsView.js';
import { Modal } from './Modal.js';
import {
  Wallet,
  User,
  Sliders,
  ChevronDown,
  Layers,
} from 'lucide-react';

export const ResponsiveLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-lg shadow-brand-500/20">
              <Wallet size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white leading-none">
                  DC Expense
                </h1>
                <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold text-brand-400 border border-brand-500/20">
                  Ledger V5
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Double-Entry Money Manager</p>
            </div>
          </div>

          {/* Right Controls: Workspace Switcher & User Avatar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Workspace Selector Dropdown */}
            {activeWorkspace && (
              <div className="relative">
                <button
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
            )}

            {/* Profile Avatar / Settings Button */}
            <button
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
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 px-4 pt-4 sm:pt-6">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>

      {/* Bottom Navigation */}
      <Navigation />

      {/* PWA Install Banner */}
      <PwaInstallPrompt />

      {/* Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Settings & Workspaces"
      >
        <UserSettingsView />
      </Modal>
    </div>
  );
};
