import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { Wallet, ShieldCheck, Zap, Lock, AlertCircle } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loginWithGoogle, loginDemo, isLoading } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
        {/* Brand Icon & Heading */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-xl shadow-brand-500/25">
            <Wallet size={36} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">DC Expense Manager</h1>
          <p className="text-sm text-slate-400">
            High-performance double-entry ledger with automated expense transpilation & workspace isolation.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-2.5 rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4">
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0" />
            <span>Strict double-entry balancing (∑ base_amount = 0)</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <Zap size={16} className="text-amber-400 flex-shrink-0" />
            <span>Automatic account generation from categories</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <Lock size={16} className="text-brand-400 flex-shrink-0" />
            <span>Encrypted multi-tenant workspace isolation</span>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google OAuth Login Button */}
        <div className="flex flex-col items-center justify-center pt-2 space-y-3">
          <button
            type="button"
            onClick={async () => {
              setErrorMsg(null);
              try {
                await loginWithGoogle();
              } catch (err: any) {
                setErrorMsg(err.message || 'Google Sign-In failed. Please try again.');
              }
            }}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 rounded-full border border-slate-700 bg-white hover:bg-slate-100 text-slate-900 px-6 py-3 text-sm font-semibold transition shadow-md disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>

          <div className="relative flex items-center justify-center w-full py-1">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">or</span>
            <div className="border-t border-slate-800 w-full" />
          </div>

          <button
            type="button"
            onClick={() => loginDemo()}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-800/80 hover:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:text-white transition shadow-sm"
          >
            <span>Continue as Demo User</span>
          </button>

          {isLoading && (
            <p className="text-xs text-brand-400 animate-pulse font-medium">
              Authenticating session with DeriveCount engine...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
