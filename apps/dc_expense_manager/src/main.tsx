import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { initPwaLifecycle } from '@money-manager/pwa';
import { GOOGLE_CLIENT_ID } from '@money-manager/core';
import { AuthProvider } from './context/AuthContext.js';
import { WorkspaceProvider } from '@money-manager/dc-client';
import { TransactionProvider } from './context/TransactionContext.js';
import App from './App.js';
import './index.css';

// Initialize PWA Lifecycle (Registers SW in PROD, unregisters in DEV to preserve HMR)
initPwaLifecycle({
  appName: 'DC Expense Manager (Ledger)',
  cachePrefix: 'dc-expense-manager-cache',
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <WorkspaceProvider>
          <TransactionProvider>
            <HashRouter>
              <App />
            </HashRouter>
          </TransactionProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
