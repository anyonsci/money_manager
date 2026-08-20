import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext.js';
import { WorkspaceProvider } from './context/WorkspaceContext.js';
import { TransactionProvider } from './context/TransactionContext.js';
import App from './App.js';
import './index.css';

// Register custom PWA service worker only in production builds
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then((registration) => {
        console.log('DC Expense ServiceWorker registered with scope:', registration.scope);
      }).catch((err) => {
        console.error('ServiceWorker registration failed:', err);
      });
    });
  } else {
    // In development mode (npm run dev), unregister any active ServiceWorker so it doesn't intercept Vite HMR requests
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then(() => {
          console.log('Unregistered development ServiceWorker:', registration.scope);
        });
      }
    });
    // Clear any stale caches
    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          if (key.startsWith('dc-expense-manager-cache-')) {
            caches.delete(key);
          }
        });
      });
    }
  }
}

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
