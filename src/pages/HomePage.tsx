import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { TransactionFormValues } from '../types';
import { ArrowRight, CheckCircle2, AlertCircle, Loader2, Sparkles, Plus } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface ParsedResult {
  valid: boolean;
  values?: TransactionFormValues;
  error?: string;
}

export const parseCsvTransaction = (input: string): ParsedResult => {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, error: 'Enter entry as: amount, account, category [- subcategory][, note]' };
  }

  const parts = trimmed.split(',').map((p) => p.trim());

  if (parts.length < 3) {
    return {
      valid: false,
      error: 'CSV requires at least 3 parts: amount, account, category'
    };
  }

  const rawAmountStr = parts[0];
  const rawAccount = parts[1];
  const rawCategoryPart = parts[2];
  const note = parts.slice(3).join(', ').trim();

  const isPositive = rawAmountStr.startsWith('+');
  const isExplicitNegative = rawAmountStr.startsWith('-');
  const cleanAmountStr = rawAmountStr.replace(/^[+-]/, '').trim();
  const numAmount = parseFloat(cleanAmountStr);

  if (isNaN(numAmount) || numAmount <= 0) {
    return {
      valid: false,
      error: `Invalid amount "${rawAmountStr}". Must be a number greater than 0.`
    };
  }

  if (!rawAccount) {
    return { valid: false, error: 'Account cannot be empty.' };
  }

  if (!rawCategoryPart) {
    return { valid: false, error: 'Category cannot be empty.' };
  }

  let category = rawCategoryPart;
  let subCategory = '';
  if (rawCategoryPart.includes('-')) {
    const dashIndex = rawCategoryPart.indexOf('-');
    category = rawCategoryPart.substring(0, dashIndex).trim();
    subCategory = rawCategoryPart.substring(dashIndex + 1).trim();
  }

  if (!category) {
    return { valid: false, error: 'Category name cannot be empty.' };
  }

  let type: 'expense' | 'income' = 'expense';
  const catLower = category.toLowerCase();
  if (isPositive || ['salary', 'income', 'freelance', 'deposit', 'paycheck'].includes(catLower)) {
    type = 'income';
  } else if (isExplicitNegative) {
    type = 'expense';
  }

  const date = new Date().toISOString().split('T')[0];

  return {
    valid: true,
    values: {
      amount: String(numAmount),
      account: rawAccount,
      category,
      subCategory,
      note,
      type,
      date
    }
  };
};

export const HomePage: React.FC = () => {
  const { createTransactionItem } = useTransactions();
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: ''
  });
  const [lastSavedSummary, setLastSavedSummary] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus automatically like Google search bar
    inputRef.current?.focus();
  }, []);

  const parsed = useMemo(() => {
    if (!input.trim()) return null;
    return parseCsvTransaction(input);
  }, [input]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (saving) return;

    const result = parseCsvTransaction(input);
    if (!result.valid || !result.values) {
      setStatus({
        type: 'error',
        message: result.error || 'Invalid CSV input'
      });
      return;
    }

    setSaving(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const created = await createTransactionItem(result.values);
      if (created) {
        const desc = `${formatCurrency(created.amount)} (${created.category}${created.subCategory ? ` - ${created.subCategory}` : ''}) paid via ${created.account}`;
        setLastSavedSummary(desc);
        setStatus({
          type: 'success',
          message: `Saved successfully!`
        });
        setInput('');
      } else {
        setStatus({
          type: 'error',
          message: 'Failed to save transaction. Please try again.'
        });
      }
    } catch (err) {
      console.error(err);
      setStatus({
        type: 'error',
        message: 'An unexpected error occurred while saving.'
      });
    } finally {
      setSaving(false);
      // Refocus input after submit
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto">
      {/* Google-like minimal hero logo / title */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-3xl bg-brand-600/20 text-brand-400 border border-brand-500/30 mb-2 shadow-lg shadow-brand-500/10">
          <Sparkles size={28} className="animate-pulse" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          Quick Entry
        </h1>
        <p className="text-sm text-slate-400">
          Enter transaction CSV &amp; press <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-slate-800 border border-slate-700 rounded text-slate-300">Enter</kbd> to save instantly
        </p>
      </div>

      {/* Main Single Text Field Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
            <Plus size={22} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (status.type !== 'idle') {
                setStatus({ type: 'idle', message: '' });
              }
            }}
            disabled={saving}
            placeholder="30, HDFC, Food - Groceries, Lunch note"
            className="w-full pl-12 pr-14 py-4 sm:py-5 bg-slate-900/90 text-white placeholder-slate-500 rounded-3xl border-2 border-slate-800 shadow-2xl focus:border-brand-500 focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-brand-500/20 text-base sm:text-lg transition-all duration-200"
            autoComplete="off"
            spellCheck={false}
          />

          <button
            type="submit"
            disabled={saving || !input.trim()}
            className="absolute inset-y-2 right-2 px-4 flex items-center justify-center bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:hover:bg-brand-600 text-white rounded-2xl transition-all duration-150 active:scale-95 shadow-md"
            title="Save Transaction (Enter)"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
          </button>
        </div>

        {/* Live Parsing Preview (if user typing) */}
        {parsed && input.trim() && (
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-3.5 backdrop-blur text-xs sm:text-sm">
            {parsed.valid && parsed.values ? (
              <div className="flex flex-wrap items-center gap-2 text-slate-300">
                <span className="font-semibold text-emerald-400">
                  {formatCurrency(Number(parsed.values.amount))} ({parsed.values.type})
                </span>
                <span className="text-slate-600">•</span>
                <span>Account: <strong className="text-slate-200">{parsed.values.account}</strong></span>
                <span className="text-slate-600">•</span>
                <span>Category: <strong className="text-slate-200">{parsed.values.category}</strong></span>
                {parsed.values.subCategory && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span>Sub-cat: <strong className="text-slate-200">{parsed.values.subCategory}</strong></span>
                  </>
                )}
                {parsed.values.note && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span>Note: <span className="italic text-slate-300">{parsed.values.note}</span></span>
                  </>
                )}
              </div>
            ) : (
              <p className="text-amber-400/90 flex items-center gap-1.5 font-medium">
                <AlertCircle size={15} />
                {parsed.error}
              </p>
            )}
          </div>
        )}

        {/* Status Message Banner */}
        {status.message && (
          <div
            className={`flex items-start gap-3 p-4 rounded-2xl border shadow-lg transition-all animate-in fade-in duration-200 ${
              status.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300'
                : status.type === 'error'
                ? 'border-rose-500/30 bg-rose-950/40 text-rose-300'
                : 'border-slate-800 bg-slate-900 text-slate-300'
            }`}
          >
            {status.type === 'success' && <CheckCircle2 size={22} className="text-emerald-400 shrink-0 mt-0.5" />}
            {status.type === 'error' && <AlertCircle size={22} className="text-rose-400 shrink-0 mt-0.5" />}
            <div className="space-y-1">
              <p className="font-semibold text-sm sm:text-base">{status.message}</p>
              {status.type === 'success' && lastSavedSummary && (
                <p className="text-xs sm:text-sm text-emerald-200/80">{lastSavedSummary}</p>
              )}
            </div>
          </div>
        )}

        {/* Syntax guide footer */}
        <div className="pt-4 text-center">
          <p className="text-xs text-slate-500">
            Format: <code className="text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">amount, account, category [- subcategory][, note]</code>
          </p>
        </div>
      </form>
    </div>
  );
};

export default HomePage;
