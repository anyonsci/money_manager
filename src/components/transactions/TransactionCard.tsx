import { Transaction } from '../../types';
import { formatCurrency, formatDate, getCategoryIcon } from '../../utils/formatters';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}

export const TransactionCard = ({ transaction, onEdit }: TransactionCardProps) => {
  const isExpense = transaction.type === 'expense';

  return (
    <div
      onClick={() => onEdit(transaction)}
      className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 bg-slate-900/40 transition hover:bg-slate-800/60"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-base">
          {getCategoryIcon(transaction.category)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{transaction.category}</p>
          <p className="truncate text-xs text-slate-400 mt-0.5">{transaction.account}</p>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className={`text-sm font-semibold ${isExpense ? 'text-rose-300' : 'text-emerald-300'}`}>
          {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">{formatDate(transaction.timestamp)}</p>
      </div>
    </div>
  );
};
