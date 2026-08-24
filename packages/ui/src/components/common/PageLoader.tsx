import React from 'react';
import { Loader2 } from 'lucide-react';

export interface PageLoaderProps {
  message?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ message = 'Loading view...' }) => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-400 gap-3">
    <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
    <p className="text-sm font-medium">{message}</p>
  </div>
);
