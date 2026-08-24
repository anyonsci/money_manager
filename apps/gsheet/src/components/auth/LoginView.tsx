import React from 'react';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { LogIn } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useAuth();

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

        <div className="mt-8 flex flex-col items-center justify-center">
          <GoogleLogin
            onSuccess={(credentialResponse: CredentialResponse) => {
              if (credentialResponse.credential) {
                login(credentialResponse.credential);
              }
            }}
            onError={() => {
              console.error('Google Sign-In failed');
            }}
            theme="filled_blue"
            shape="pill"
          />
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Only authorized accounts added to the backend whitelist will be granted access.
        </p>
      </div>
    </div>
  );
};



