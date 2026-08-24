import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { initPwaLifecycle } from '@money-manager/pwa';
import { AuthProvider } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';
import App from './App';
import './index.css';

// Initialize PWA Lifecycle (Registers SW in PROD, unregisters in DEV to preserve HMR)
initPwaLifecycle({
  appName: 'Money Manager (Google Sheets)',
  cachePrefix: 'money-manager-gsheet-cache',
});

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '719964045968-cmh03lg080igf8f4lh8ng70mhhbqtt3q.apps.googleusercontent.com';

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
