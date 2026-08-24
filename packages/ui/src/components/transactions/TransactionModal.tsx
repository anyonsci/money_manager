import React, { useState, useEffect, type FormEvent } from 'react';
import {
  UnifiedTransaction,
  TransactionFormValues,
  ALLOWED_CATEGORIES,
  formatInputDate,
} from '@money-manager/core';
import { Modal } from '../layout/Modal';
import {
  Loader2,
  TrendingDown,
  TrendingUp,
  Tag,
  Calendar,
  CreditCard,
  FileText,
} from 'lucide-react';

export interface TransactionModalProps {
  open?: boolean;
  isOpen?: boolean;
  mode?: 'create' | 'edit';
  transaction?: UnifiedTransaction | null;
  currency?: string;
  defaultAccount?: string;
  onClose: () => void;
  onSubmit: (values: TransactionFormValues) => Promise<void>;
  onDelete?: (transaction: UnifiedTransaction) => Promise<void>;
  onVoid?: (transaction: UnifiedTransaction) => Promise<void>;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  open,
  isOpen,
  mode,
  transaction,
  currency = 'INR',
  defaultAccount = 'Checking',
  onClose,
  onSubmit,
}) => {
  const isVisible = open !== undefined ? open : (isOpen ?? false);
  const isEditMode = mode === 'edit' || !!transaction;

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState(defaultAccount);
  const [category, setCategory] = useState<string>(ALLOWED_CATEGORIES[0]);
  const [subCategory, setSubCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(formatInputDate());
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(String(transaction.amount));
      setAccount(transaction.account || defaultAccount);
      setCategory(transaction.category || ALLOWED_CATEGORIES[0]);
      setSubCategory(transaction.subCategory || '');
      setNote(transaction.note || '');

      let formattedDate = formatInputDate();
      const rawDate = transaction.transactionDate || transaction.timestamp;
      if (rawDate) {
        try {
          const d = new Date(rawDate);
          if (!isNaN(d.getTime())) {
            formattedDate = formatInputDate(d);
          } else {
            formattedDate = String(rawDate).slice(0, 10);
          }
        } catch {
          formattedDate = String(rawDate).slice(0, 10);
        }
      }
      setDate(formattedDate);
    } else {
      setType('expense');
      setAmount('');
      setAccount(defaultAccount);
      setCategory(ALLOWED_CATEGORIES[0]);
      setSubCategory('');
      setNote('');
      setDate(formatInputDate());
    }
    setErrorMsg(null);
  }, [transaction, isVisible, defaultAccount]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      await onSubmit({
        amount,
        account,
        category,
        subCategory,
        note,
        type,
        date,
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to save transaction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={isVisible}
      onClose={() => !submitting && onClose()}
      title={isEditMode ? 'Edit Transaction' : 'New Transaction'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="rounded-xl border border-rose-800/80 bg-rose-950/60 p-3 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        {/* Type selector toggle */}
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-950 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition ${
              type === 'expense'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingDown size={14} />
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition ${
              type === 'income'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp size={14} />
            Income
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-400">Amount</label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-base font-bold text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-500">
              {currency}
            </span>
          </div>
        </div>

        {/* Category & Subcategory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate-400">
              <Tag size={12} />
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-medium text-white focus:border-brand-500 focus:outline-none"
            >
              {(ALLOWED_CATEGORIES as readonly string[]).map((cat: string) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">
              Subcategory <span className="text-slate-600 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              placeholder="e.g. Groceries, Fuel"
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-medium text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Account & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate-400">
              <CreditCard size={12} />
              Account
            </label>
            <input
              type="text"
              required
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="Checking, Cash, HDFC"
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-medium text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate-400">
              <Calendar size={12} />
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-medium text-white focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate-400">
            <FileText size={12} />
            Note <span className="text-slate-600 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Short description..."
            className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-medium text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white shadow-lg hover:bg-brand-500 disabled:opacity-50 transition active:scale-95"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {isEditMode ? 'Save Changes' : 'Create Entry'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
