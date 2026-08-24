import React from 'react';
import { UnifiedTransaction } from '@money-manager/core';
import { TransactionCard } from './TransactionCard';
import { Inbox, Loader2 } from 'lucide-react';

export interface TransactionListProps {
  transactions: UnifiedTransaction[];
  currency?: string;
  locale?: string;
  isLoading?: boolean;
  onEdit?: (tx: UnifiedTransaction) => void;
  onDelete?: (tx: UnifiedTransaction) => Promise<void> | void;
  onVoid?: (tx: UnifiedTransaction) => Promise<void> | void;
  emptyMessage?: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  currency = 'INR',
  locale = 'en-IN',
  isLoading = false,
  onEdit,
  onDelete,
  onVoid,
  emptyMessage = 'No transactions found',
}) => {
  if (isLoading) {
    return (
      <div className="flex h-48 flex-col items-center justify-center space-y-3 rounded-2xl border border-slate-800 bg-slate-900/40 text-slate-400">
        <Loader2 size={32} className="animate-spin text-brand-500" />
        <p className="text-xs font-semibold uppercase tracking-wider">Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center space-y-2 rounded-2xl border border-slate-800/80 bg-slate-900/30 text-slate-400">
        <Inbox size={36} className="text-slate-600" />
        <p className="text-sm font-medium text-slate-300">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
        <TransactionCard
          key={tx.id}
          transaction={tx}
          currency={currency}
          locale={locale}
          onEdit={onEdit}
          onDelete={onDelete}
          onVoid={onVoid}
        />
      ))}
    </div>
  );
};
