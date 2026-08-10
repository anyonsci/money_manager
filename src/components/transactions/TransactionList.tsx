import { useMemo, useState } from 'react';
import { Filter, Plus, RefreshCw, X } from 'lucide-react';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [datePreset, setDatePreset] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const availableCategories = useMemo(() => {
    const cats = new Set(transactions.map((t) => t.category).filter(Boolean));
    return Array.from(cats).sort((a, b) => a.localeCompare(b));
  }, [transactions]);

  const availableAccounts = useMemo(() => {
    const accs = new Set(transactions.map((t) => t.account).filter(Boolean));
    return Array.from(accs).sort((a, b) => a.localeCompare(b));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (selectedCategory && t.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (selectedAccount && t.account.toLowerCase() !== selectedAccount.toLowerCase()) {
        return false;
      }

      if (datePreset) {
        if (!t.timestamp) return false;
        const itemDate = new Date(t.timestamp);
        if (isNaN(itemDate.getTime())) return false;

        if (datePreset === '7days') {
          const cutoff = new Date();
          cutoff.setHours(0, 0, 0, 0);
          cutoff.setDate(cutoff.getDate() - 6);
          if (itemDate < cutoff) return false;
        } else if (datePreset === '30days') {
          const cutoff = new Date();
          cutoff.setHours(0, 0, 0, 0);
          cutoff.setDate(cutoff.getDate() - 29);
          if (itemDate < cutoff) return false;
        } else if (datePreset === 'custom') {
          if (startDate) {
            const start = new Date(`${startDate}T00:00:00`);
            if (!isNaN(start.getTime()) && itemDate < start) return false;
          }
          if (endDate) {
            const end = new Date(`${endDate}T23:59:59.999`);
            if (!isNaN(end.getTime()) && itemDate > end) return false;
          }
        }
      }

      return true;
    });
  }, [transactions, selectedCategory, selectedAccount, datePreset, startDate, endDate]);

  const hasActiveFilters = Boolean(selectedCategory || selectedAccount || datePreset || startDate || endDate);

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedAccount('');
    setDatePreset('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Recent transactions</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            title="Refresh transactions"
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

      {/* Filter Controls Bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-3 shadow-soft">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mr-1">
          <Filter size={14} className="text-slate-400" />
          <span>Filter:</span>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-1.5 text-xs text-white outline-none focus:border-brand-500 transition"
        >
          <option value="">All Categories</option>
          {availableCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-1.5 text-xs text-white outline-none focus:border-brand-500 transition"
        >
          <option value="">All Accounts</option>
          {availableAccounts.map((acc) => (
            <option key={acc} value={acc}>
              {acc}
            </option>
          ))}
        </select>

        {/* Date Range Selector */}
        <select
          value={datePreset}
          onChange={(e) => {
            setDatePreset(e.target.value);
            if (e.target.value !== 'custom') {
              setStartDate('');
              setEndDate('');
            }
          }}
          className="rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-1.5 text-xs text-white outline-none focus:border-brand-500 transition"
        >
          <option value="">All Dates</option>
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="custom">Custom Range</option>
        </select>

        {datePreset === 'custom' && (
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950/80 px-2.5 py-1.5 text-xs text-white outline-none focus:border-brand-500 transition"
              title="Start Date"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950/80 px-2.5 py-1.5 text-xs text-white outline-none focus:border-brand-500 transition"
              title="End Date"
            />
          </div>
        )}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs text-rose-300 transition hover:bg-rose-500/20"
          >
            <X size={12} />
            Clear
          </button>
        )}

        <div className="ml-auto text-xs text-slate-400">
          Showing {filteredTransactions.length} of {transactions.length}
        </div>
      </div>

      {filteredTransactions.length === 0 && !loading ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center text-sm text-slate-400">
          {hasActiveFilters ? 'No transactions match the selected filters.' : 'No transactions yet. Add the first one to get started.'}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden divide-y divide-slate-800/80 shadow-soft">
          {filteredTransactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onLoadMore={onLoadMore} />
    </section>
  );
};
