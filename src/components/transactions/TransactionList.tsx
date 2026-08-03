import { Plus, RefreshCw } from 'lucide-react';
import { Transaction } from '../../types';
import { TransactionCard } from './TransactionCard';
import { Pagination } from './Pagination';

interface TransactionListProps {
  transactions: Transaction[];
  page: number;
  totalPages: number;
  loading: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  onCreate: () => void;
}

export const TransactionList = ({
  transactions,
  page,
  totalPages,
  loading,
  onRefresh,
  onLoadMore,
  onEdit,
  onDelete,
  onCreate
}: TransactionListProps) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Recent transactions</h2>
          <p className="text-sm text-slate-400">Server-backed pagination with refresh support</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-full border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={onCreate}
            className="flex items-center gap-2 rounded-full bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-500"
          >
            <Plus size={16} />
            New
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {transactions.length === 0 && !loading ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center text-sm text-slate-400">
            No transactions yet. Add the first one to get started.
          </div>
        ) : (
          transactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} onEdit={onEdit} onDelete={onDelete} />
          ))
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onLoadMore={onLoadMore} />
    </section>
  );
};
