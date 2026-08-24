import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext';
import {
  parseCsvTransaction,
  formatCurrency,
  TransactionFormValues
} from '@money-manager/core';
import { ArrowRight, CheckCircle2, AlertCircle, Loader2, Sparkles, Plus } from 'lucide-react';

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
        message: result.error || 'Please fill in a valid entry format.'
      });
      return;
    }

    setSaving(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const created = await createTransactionItem(result.values);
      if (created) {
        const desc = `${formatCurrency(created.amount)} (${created.category}${created.subCategory ? ` . ${created.subCategory}` : ''}) paid via ${created.account}`;
        setLastSavedSummary(desc);
        setStatus({
          type: 'success',
          message: 'Saved successfully!'
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
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl mb-4 text-brand-400">
          <Sparkles className="h-8 w-8 text-brand-400" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Money Manager
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Fast natural entry for your family accounts
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full relative">
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
            <Plus size={20} className="text-brand-400" />
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
            placeholder="30  HDFC  Food.Lunch  Lunch note"
            className="w-full pl-12 pr-14 py-4 sm:py-5 bg-slate-900/90 text-white placeholder-slate-500 rounded-3xl border-2 border-slate-800 shadow-2xl focus:border-brand-500 focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-brand-500/20 text-base sm:text-lg transition-all duration-200"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />

          <button
            type="submit"
            disabled={saving || !input.trim() || (parsed !== null && !parsed.valid)}
            className="absolute inset-y-2 right-2 px-4 flex items-center justify-center bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:hover:bg-brand-600 text-white rounded-2xl transition-all duration-150 active:scale-95 shadow-md"
            title="Save Transaction (Enter)"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
          </button>
        </div>

        <div className="mt-3 min-h-[50px] px-2 text-xs transition-all">
          {parsed && !parsed.valid && (
            <div className="flex items-center gap-2 text-amber-400/90 bg-amber-950/40 border border-amber-900/50 rounded-2xl px-4 py-2.5 shadow-sm animate-in fade-in duration-150">
              <AlertCircle size={16} className="shrink-0" />
              <span>{parsed.error}</span>
            </div>
          )}

          {parsed && parsed.valid && parsed.values && (
            <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800/80 rounded-2xl px-4 py-2.5 shadow-sm animate-in fade-in duration-150">
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
                    <span>Subcategory: <strong className="text-slate-200">{parsed.values.subCategory}</strong></span>
                  </>
                )}
                {parsed.values.note && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="italic text-slate-400">"{parsed.values.note}"</span>
                  </>
                )}
              </div>
              <span className="hidden sm:inline-block text-[11px] text-brand-400 font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20">
                Ready to save (Press Enter)
              </span>
            </div>
          )}
        </div>
      </form>

      {status.type === 'success' && (
        <div className="mt-4 w-full bg-emerald-950/50 border border-emerald-800/60 rounded-3xl p-4 flex items-start gap-3 shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-emerald-300">{status.message}</h4>
            {lastSavedSummary && (
              <p className="text-xs text-emerald-400/80 mt-0.5">{lastSavedSummary}</p>
            )}
          </div>
        </div>
      )}

      {status.type === 'error' && (
        <div className="mt-4 w-full bg-rose-950/50 border border-rose-800/60 rounded-3xl p-4 flex items-start gap-3 shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <AlertCircle className="h-6 w-6 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-rose-300">{status.message}</h4>
          </div>
        </div>
      )}

      <div className="mt-10 w-full rounded-3xl border border-slate-800/60 bg-slate-900/40 p-5 backdrop-blur">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Quick entry format
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Type entries separated by 2 or more spaces, or commas:
        </p>
        <div className="mt-3 space-y-2 font-mono text-xs">
          <div className="p-2.5 rounded-2xl bg-slate-950/80 text-slate-300 border border-slate-800/80 flex items-center justify-between">
            <span>30  HDFC  Groceries.Supermarket  Weekly dinner</span>
            <span className="text-slate-500 text-[10px] uppercase font-sans">Expense</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-950/80 text-slate-300 border border-slate-800/80 flex items-center justify-between">
            <span>+45000  Checking  Salary.Payroll  Monthly pay</span>
            <span className="text-emerald-400 text-[10px] uppercase font-sans">Income</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
