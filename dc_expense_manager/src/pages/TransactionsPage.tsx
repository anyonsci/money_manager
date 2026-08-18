import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext.js';
import { TransactionList } from '../components/transactions/TransactionList.js';
import { TransactionModal } from '../components/transactions/TransactionModal.js';
import { Pagination } from '../components/transactions/Pagination.js';
import { ALLOWED_CATEGORIES } from '../constants/categories.js';
import type { FormattedTransaction } from '../types/index.js';
import {
  Search,
  Plus,
  X,
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const {
    transactions,
    isLoading,
    pagination,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    setPage,
  } = useTransactions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<FormattedTransaction | null>(null);

  const handleEdit = (tx: FormattedTransaction) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedCategory !== 'All' ||
    Boolean(startDate) ||
    Boolean(endDate);

  return (
    <div className="space-y-4">
      {/* Top Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Transactions</h2>
          <p className="text-xs text-slate-400">
            Balanced double-entry journal ({pagination.total} total)
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTx(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-brand-500 transition"
        >
          <Plus size={16} />
          <span>New Entry</span>
        </button>
      </div>

      {/* Filter Controls Box */}
      <div className="space-y-3 rounded-3xl border border-slate-800/80 bg-slate-900/60 p-4">
        {/* Search Bar */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search description, notes, or tags..."
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Date Filters & Clear */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-xs text-slate-300 focus:border-brand-500 focus:outline-none"
              placeholder="From Date"
            />
          </div>
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-xs text-slate-300 focus:border-brand-500 focus:outline-none"
              placeholder="To Date"
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              <X size={12} />
              Clear Filters
            </button>
          )}
        </div>

        {/* Category Horizontal Pill Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`flex-shrink-0 rounded-xl px-3 py-1 text-xs font-semibold transition ${
              selectedCategory === 'All'
                ? 'bg-brand-600 text-white'
                : 'bg-slate-950/80 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            All
          </button>
          {ALLOWED_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 rounded-xl px-3 py-1 text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-950/80 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <TransactionList
        transactions={transactions}
        isLoading={isLoading}
        onEdit={handleEdit}
        emptyMessage="No ledger entries match your filter criteria."
      />

      {/* Pagination Controls */}
      <Pagination meta={pagination} onPageChange={setPage} />

      {/* Entry Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTx(null);
        }}
        initialTransaction={editingTx}
      />
    </div>
  );
};
