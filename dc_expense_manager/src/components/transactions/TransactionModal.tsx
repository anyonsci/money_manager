import React, { useState, useEffect } from 'react';
import { Modal } from '../layout/Modal.js';
import { useTransactions } from '../../context/TransactionContext.js';
import { useWorkspace } from '../../context/WorkspaceContext.js';
import { ALLOWED_CATEGORIES } from '../../constants/categories.js';
import { formatInputDate } from '../../utils/formatters.js';
import type { FormattedTransaction } from '../../types/index.js';
import {
  Loader2,
  TrendingDown,
  TrendingUp,
  Tag,
  Calendar,
  CreditCard,
  FileText,
} from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTransaction?: FormattedTransaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  initialTransaction,
}) => {
  const { addTransaction, editTransaction, isSubmitting } = useTransactions();
  const { activeWorkspace } = useWorkspace();

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState('Cash');
  const [category, setCategory] = useState<string>('Food');
  const [subCategory, setSubCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(formatInputDate());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setAmount(String(initialTransaction.amount));
      setAccount(initialTransaction.account);
      setCategory(initialTransaction.category || 'Food');
      setSubCategory(initialTransaction.subCategory || '');
      setNote(initialTransaction.note || '');
      setDate(
        initialTransaction.transactionDate
          ? formatInputDate(new Date(initialTransaction.transactionDate))
          : formatInputDate()
      );
    } else {
      setType('expense');
      setAmount('');
      setAccount('Cash');
      setCategory('Food');
      setSubCategory('');
      setNote('');
      setDate(formatInputDate());
    }
    setErrorMsg(null);
  }, [initialTransaction, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0');
      return;
    }

    setErrorMsg(null);
    try {
      if (initialTransaction) {
        // Immutable edit (voids existing and posts new balanced transaction)
        await editTransaction(initialTransaction.id, {
          amount,
          account,
          category,
          subCategory,
          note,
          type,
          date,
        });
      } else {
        // Create new transaction
        await addTransaction({
          amount,
          account,
          category,
          subCategory,
          note,
          type,
          date,
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save transaction');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTransaction ? 'Edit Transaction (Double-Entry)' : 'Record Transaction'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Type Toggle: Expense vs Income */}
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-950/60 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition ${
              type === 'expense'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingDown size={14} />
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition ${
              type === 'income'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp size={14} />
            Income
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Amount ({activeWorkspace?.defaultCurrency || 'USD'})
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-xl font-bold text-white placeholder:text-slate-700 focus:border-brand-500 focus:outline-none"
              required
              autoFocus={!initialTransaction}
            />
          </div>
        </div>

        {/* Category & Subcategory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Tag size={12} className="text-brand-400" />
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2.5 text-xs font-medium text-white focus:border-brand-500 focus:outline-none"
            >
              {ALLOWED_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Subcategory (Tag)
            </label>
            <input
              type="text"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              placeholder="e.g. Groceries, Dinner, Fuel"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Source Account & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <CreditCard size={12} className="text-brand-400" />
              Payment Source Account
            </label>
            <input
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="e.g. Cash, HDFC Bank, Credit Card"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Calendar size={12} className="text-brand-400" />
              Transaction Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2.5 text-xs text-white focus:border-brand-500 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Note / Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
            <FileText size={12} className="text-slate-500" />
            Note / Description (Optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Team lunch at Italian Bistro"
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-500 disabled:opacity-50 transition"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Posting to Ledger...</span>
              </>
            ) : (
              <span>{initialTransaction ? 'Update Transaction' : 'Post Transaction'}</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
