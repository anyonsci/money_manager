import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext.js';
import { TransactionList } from '../components/transactions/TransactionList.js';
import { TransactionModal } from '../components/transactions/TransactionModal.js';
import { AnalyticsSummary } from '../components/analytics/AnalyticsSummary.js';
import { ALLOWED_CATEGORIES } from '../constants/categories.js';
import { formatInputDate } from '../utils/formatters.js';
import type { FormattedTransaction } from '../types/index.js';
import {
  Plus,
  ArrowRight,
  Zap,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const { transactions, isLoading, isSubmitting, summary, addTransaction } = useTransactions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<FormattedTransaction | null>(null);

  // Quick Entry Form state on Homepage
  const [quickAmount, setQuickAmount] = useState('');
  const [quickCategory, setQuickCategory] = useState<string>('Food');
  const [quickSubcategory, setQuickSubcategory] = useState('');
  const [quickAccount] = useState('Cash');
  const [quickType] = useState<'expense' | 'income'>('expense');
  const [quickSuccess, setQuickSuccess] = useState(false);

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(quickAmount);
    if (isNaN(num) || num <= 0) return;

    try {
      await addTransaction({
        amount: quickAmount,
        category: quickCategory,
        subCategory: quickSubcategory,
        account: quickAccount,
        note: '',
        type: quickType,
        date: formatInputDate(),
      });
      setQuickAmount('');
      setQuickSubcategory('');
      setQuickSuccess(true);
      setTimeout(() => setQuickSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (tx: FormattedTransaction) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Net Balance Overview */}
      <AnalyticsSummary
        totalIncome={summary.totalIncome}
        totalExpense={summary.totalExpense}
        netBalance={summary.netBalance}
      />

      {/* Quick Entry Card */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Zap size={16} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Quick Transaction
            </h3>
          </div>
          {quickSuccess && (
            <span className="text-xs font-semibold text-emerald-400 animate-in fade-in">
              ✓ Posted to Double-Entry Ledger!
            </span>
          )}
        </div>

        <form onSubmit={handleQuickSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Amount */}
            <div className="sm:col-span-1">
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={quickAmount}
                onChange={(e) => setQuickAmount(e.target.value)}
                placeholder="Amount (e.g. 25.00)"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm font-bold text-white placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
                required
              />
            </div>

            {/* Category */}
            <div className="sm:col-span-1">
              <select
                value={quickCategory}
                onChange={(e) => setQuickCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs font-medium text-white focus:border-brand-500 focus:outline-none"
              >
                {ALLOWED_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory Tag */}
            <div className="sm:col-span-1">
              <input
                type="text"
                value={quickSubcategory}
                onChange={(e) => setQuickSubcategory(e.target.value)}
                placeholder="Subcategory tag (e.g. Lunch)"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-1">
              <button
                type="submit"
                disabled={isSubmitting || !quickAmount}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-600 py-2.5 text-xs font-bold text-white shadow hover:bg-brand-500 disabled:opacity-50 transition"
              >
                {isSubmitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    <Plus size={14} />
                    <span>Post Entry</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Recent Transactions Header & List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Recent Ledger Entries
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingTx(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1 rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-brand-500 transition"
            >
              <Plus size={14} />
              <span>New Entry</span>
            </button>
            <Link
              to="/transactions"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300 transition"
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <TransactionList
          transactions={recentTransactions}
          isLoading={isLoading}
          onEdit={handleEdit}
        />
      </div>

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
