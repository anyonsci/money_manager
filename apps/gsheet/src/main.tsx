import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { initPwaLifecycle } from '@money-manager/pwa';
import { GOOGLE_CLIENT_ID } from '@money-manager/core';
import { AuthProvider } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';
import App from './App';
import './index.css';

// Initialize PWA Lifecycle (Registers SW in PROD, unregisters in DEV to preserve HMR)
initPwaLifecycle({
  appName: 'Money Manager (Google Sheets)',
  cachePrefix: 'money-manager-gsheet-cache',
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <TransactionProvider>
          <HashRouter>
            <App />
          </HashRouter>
        </TransactionProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
