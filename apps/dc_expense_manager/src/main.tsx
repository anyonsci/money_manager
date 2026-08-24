import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { initPwaLifecycle } from '@money-manager/pwa';
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

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '719964045968-cmh03lg080igf8f4lh8ng70mhhbqtt3q.apps.googleusercontent.com';

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
