import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PwaInstallPromptProps {
  appName?: string;
  storageKey?: string;
}

export const PwaInstallPrompt: React.FC<PwaInstallPromptProps> = ({
  appName = 'Money Manager',
  storageKey = 'pwa_install_dismissed_until'
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkDismissed = () => {
      const dismissedUntil = localStorage.getItem(storageKey);
      if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
        return true;
      }
      return false;
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      if (!checkDismissed()) {
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [storageKey]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Dismiss for 7 days
    const dismissUntil = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem(storageKey, dismissUntil.toString());
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-slate-900 border border-slate-700/80 rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-5">
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-brand-500/20 text-brand-400 rounded-xl shrink-0">
          <Download className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-100 text-sm">Install {appName}</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Install to your home screen for quick offline access and faster loading.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs font-medium rounded-lg transition-all"
            >
              Install App
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-all"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-200 p-1 -mr-1 -mt-1 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
