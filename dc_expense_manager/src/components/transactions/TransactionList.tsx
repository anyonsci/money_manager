import React from 'react';
import type { FormattedTransaction } from '../../types/index.js';
import { TransactionCard } from './TransactionCard.js';
import { Inbox, Loader2 } from 'lucide-react';

interface TransactionListProps {
  transactions: FormattedTransaction[];
  isLoading: boolean;
  onEdit: (tx: FormattedTransaction) => void;
  emptyMessage?: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  isLoading,
  onEdit,
  emptyMessage = 'No transactions recorded yet in this workspace.',
}) => {
  if (isLoading && transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500 space-y-3">
        <Loader2 size={32} className="animate-spin text-brand-400" />
        <p className="text-xs">Loading ledger entries...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800/80 bg-slate-950/40 py-12 px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-slate-500 mb-3">
          <Inbox size={24} />
        </div>
        <h4 className="text-sm font-semibold text-slate-300">No Entries Found</h4>
        <p className="text-xs text-slate-500 max-w-xs mt-1">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {transactions.map((tx) => (
        <TransactionCard key={tx.id} transaction={tx} onEdit={onEdit} />
      ))}
    </div>
  );
};
