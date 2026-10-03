import React, { useState, useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useWorkspace } from '@money-manager/dc-client';
import {
  TransactionList,
  TransactionModal,
  Pagination,
} from '@money-manager/ui';
import {
  UnifiedTransaction,
  TransactionFormValues,
  ALLOWED_CATEGORIES,
  getCategoryIcon,
} from '@money-manager/core';
import { Plus, Search, Filter, Wallet } from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const {
    transactions,
    isLoading,
    pagination,
    fetchTransactions,
    addTransaction,
    editTransaction,
    voidTransaction,
  } = useTransactions();
  const { activeWorkspace } = useWorkspace();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<UnifiedTransaction | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [accountFilter, setAccountFilter] = useState('');

  const currency = activeWorkspace?.defaultCurrency || 'USD';

  const availableAccounts = useMemo(() => {
    const set = new Set<string>();
    const list: string[] = [];

    if (Array.isArray(transactions)) {
      for (const t of transactions) {
        const acc = t.account != null ? String(t.account).trim() : '';
        if (acc && !set.has(acc.toLowerCase())) {
          set.add(acc.toLowerCase());
          list.push(acc);
        }
      }
    }
    return list.sort((a, b) => a.localeCompare(b));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (!t) return false;
      if (categoryFilter && String(t.category ?? '').toLowerCase() !== categoryFilter.toLowerCase()) return false;
      if (accountFilter && String(t.account ?? '').toLowerCase() !== accountFilter.toLowerCase()) return false;
      if (search) {
        const query = search.toLowerCase();
        const matchesAccount = String(t.account ?? '').toLowerCase().includes(query);
        const matchesCat = String(t.category ?? '').toLowerCase().includes(query);
        const matchesSubcat = String(t.subCategory ?? '').toLowerCase().includes(query);
        const matchesNote = String(t.note ?? '').toLowerCase().includes(query);
        const matchesAmount = t.amount != null && !isNaN(Number(t.amount)) ? String(t.amount).includes(query) : false;
        if (!matchesAccount && !matchesCat && !matchesSubcat && !matchesNote && !matchesAmount) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, search, categoryFilter, accountFilter]);

  const handleEdit = (tx: UnifiedTransaction) => {
    setSelectedTx(tx);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedTx(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: TransactionFormValues) => {
    if (selectedTx) {
      await editTransaction(selectedTx.id, values);
    } else {
      await addTransaction(values);
    }
  };

  const handleVoid = async (tx: UnifiedTransaction) => {
    await voidTransaction(tx.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Ledger Transactions</h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse and manage balanced double-entry transactions in {activeWorkspace?.name || 'Workspace'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg hover:bg-brand-500 transition active:scale-95"
        >
          <Plus size={16} />
          <span>Add Entry</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entries..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div className="relative">
          <Filter size={16} className="absolute left-3 top-3 text-slate-500" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white focus:border-brand-500 focus:outline-none"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {ALLOWED_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {getCategoryIcon(cat)} {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Wallet size={16} className="absolute left-3 top-3 text-slate-500" />
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white focus:border-brand-500 focus:outline-none"
            aria-label="Filter by account"
          >
            <option value="">All Accounts</option>
            {availableAccounts.map((acc) => (
              <option key={acc} value={acc}>
                {acc}
              </option>
            ))}
          </select>
        </div>
      </div>

      <TransactionList
        transactions={filteredTransactions}
        isLoading={isLoading}
        currency={currency}
        onEdit={handleEdit}
        onVoid={handleVoid}
      />

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalRows={pagination.total}
        onPageChange={(p) => fetchTransactions(p, search)}
        loading={isLoading}
      />

      <TransactionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedTx}
        currency={currency}
        onSubmit={handleSubmit}
        onVoid={handleVoid}
      />
    </div>
  );
};

export default TransactionsPage;
