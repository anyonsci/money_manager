import { Pencil, Trash2 } from 'lucide-react';
import { Transaction } from '../../types';
import { formatCurrency, formatDate, getCategoryIcon, getTransactionTypeLabel } from '../../utils/formatters';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export const TransactionCard = ({ transaction, onEdit, onDelete }: TransactionCardProps) => {
  const isExpense = transaction.type === 'expense';

  return (
    <button
      type="button"
      onClick={() => onEdit(transaction)}
      className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-left shadow-sm transition hover:border-brand-500 hover:bg-slate-800"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-800 text-xl">
            {getCategoryIcon(transaction.category)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-white">{transaction.note || transaction.category}</p>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isExpense ? 'bg-rose-500/15 text-rose-300' : 'bg-emerald-500/15 text-emerald-300'}`}>
                {getTransactionTypeLabel(transaction.type)}
              </span>
            </div>
            <p className="mt-1 truncate text-xs text-slate-400">{transaction.category} • {transaction.account}</p>
            <p className="mt-1 text-xs text-slate-500">{transaction.createdBy}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-sm font-semibold ${isExpense ? 'text-rose-300' : 'text-emerald-300'}`}>
            {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}
          </p>
          <p className="mt-1 text-xs text-slate-500">{formatDate(transaction.timestamp)}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
        <p className="text-xs text-slate-500">{transaction.subCategory || 'No subcategory'}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(transaction);
            }}
            className="rounded-full border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(transaction);
            }}
            className="rounded-full border border-rose-500/30 p-2 text-rose-300 transition hover:bg-rose-500/10"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </button>
  );
};
