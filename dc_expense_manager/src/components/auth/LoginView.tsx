import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext.js';
import { Wallet, ShieldCheck, Zap, Lock, AlertCircle } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loginWithGoogle, isLoading } = useAuth();
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
          <div className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                if (credentialResponse.credential) {
                  setErrorMsg(null);
                  try {
                    await loginWithGoogle(credentialResponse.credential);
                  } catch (err: any) {
                    setErrorMsg(err.message || 'Authentication failed. Please try again.');
                  }
                }
              }}
              onError={() => {
                setErrorMsg('Google Sign-In failed. Please try again.');
              }}
              useOneTap
              theme="filled_black"
              shape="pill"
              size="large"
            />
          </div>

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
