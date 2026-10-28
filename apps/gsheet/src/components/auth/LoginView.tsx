import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600/20 text-brand-400 border border-brand-500/30">
          <LogIn size={28} />
        </div>
        
        <h2 className="text-2xl font-bold text-white">Authentication Required</h2>
        <p className="mt-2 text-sm text-slate-400">
          Please sign in with your Google account to access your Money Manager transactions.
        </p>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 text-left">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="mt-8 flex flex-col items-center justify-center">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              setErrorMsg(null);
              try {
                await login(credentialResponse.credential);
              } catch (err: any) {
                setErrorMsg(err.response?.data?.error || err.message || 'Google Sign-In failed. Please try again.');
              }
            }}
            onError={() => {
              setErrorMsg('Google Sign-In was cancelled or failed.');
            }}
            useOneTap={false}
            theme="outline"
            size="large"
            shape="pill"
          />
          {isLoading && (
            <p className="mt-3 text-xs text-brand-400 animate-pulse font-medium">
              Authenticating session...
            </p>
          )}
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Only authorized accounts added to the backend whitelist will be granted access.
        </p>
      </div>
    </div>
  );
};
