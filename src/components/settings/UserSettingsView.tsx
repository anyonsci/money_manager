import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, ShieldCheck, Mail, Sparkles, IndianRupee, CheckCircle2, Sliders } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UserSettingsView: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="w-full space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sliders className="text-brand-400" size={24} />
            User Settings
          </h2>
          <p className="text-sm text-slate-400 mt-1">Manage your account preferences and session</p>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 md:p-8 shadow-xl backdrop-blur">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name || user.email || 'User Avatar'}
                className="h-24 w-24 rounded-full border-2 border-brand-500/50 shadow-lg object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-800 text-brand-400 border-2 border-slate-700 shadow-lg">
                <User size={48} />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-slate-950 border-2 border-slate-900 shadow">
              <CheckCircle2 size={16} />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h3 className="text-xl font-bold text-white">{user?.name || 'Authorized User'}</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-400 border border-brand-500/20">
                <ShieldCheck size={14} />
                Authenticated
              </span>
            </div>

            <p className="text-slate-400 text-sm flex items-center justify-center sm:justify-start gap-2">
              <Mail size={16} className="text-slate-500" />
              {user?.email || 'No email attached'}
            </p>

            <p className="text-xs text-slate-500 pt-1">
              Signed in via Google OAuth 2.0 Single Sign-On
            </p>
          </div>
        </div>
      </div>

      {/* Preferences & System Info Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h4 className="text-base font-semibold text-white flex items-center gap-2">
            <Sparkles size={18} className="text-brand-400" />
            App Preferences
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
                  <IndianRupee size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">Default Currency</p>
                  <p className="text-xs text-slate-400">Indian Rupee (₹)</p>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-full">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">Security Mode</p>
                  <p className="text-xs text-slate-400">Backend Whitelist Enforced</p>
                </div>
              </div>
              <span className="text-xs text-brand-400 font-semibold bg-brand-950/60 border border-brand-800/40 px-2.5 py-1 rounded-full">
                Enabled
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h4 className="text-base font-semibold text-white flex items-center gap-2">
            <User size={18} className="text-brand-400" />
            Account Management
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Logging out will invalidate your current session and require you to authenticate again using Google Single Sign-On.
          </p>

          <div className="pt-2">
            <button
              onClick={handleLogout}
              type="button"
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-rose-600/90 hover:bg-rose-500 text-white font-semibold py-3.5 px-4 shadow-lg shadow-rose-900/30 transition-all duration-200 active:scale-[0.99]"
            >
              <LogOut size={18} />
              Log Out of Money Manager
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsView;
