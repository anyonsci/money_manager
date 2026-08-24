import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Check if user dismissed recently
      const dismissedUntil = localStorage.getItem('pwa_install_dismissed_until');
      if (!dismissedUntil || Date.now() > parseInt(dismissedUntil, 10)) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the PWA install prompt');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Dismiss for 7 days
    localStorage.setItem(
      'pwa_install_dismissed_until',
      (Date.now() + 7 * 24 * 60 * 60 * 1000).toString()
    );
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-md animate-in slide-in-from-bottom-5">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-brand-500/30 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400">
            <Download size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Install Money Manager</p>
            <p className="text-[11px] text-slate-400">Fast access from your home screen</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleInstall}
            className="rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-brand-500 active:scale-95 transition"
          >
            Install
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-200 transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
