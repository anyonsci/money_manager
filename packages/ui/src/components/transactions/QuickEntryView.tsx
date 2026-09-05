import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  parseQuickEntry,
  type QuickEntryProgressResult,
  formatCurrency,
  detectQuickEntryField,
  applyQuickEntryCompletion,
  ALLOWED_CATEGORIES,
  getCategoryIcon,
  type TransactionFormValues,
} from '@money-manager/core';
import { ArrowRight, CheckCircle2, AlertCircle, Loader2, Sparkles, Plus } from 'lucide-react';

export interface QuickEntryExample {
  text: string;
  type: 'expense' | 'income';
}

export interface QuickEntryViewProps {
  title?: string;
  subtitle?: string;
  currency?: string;
  placeholder?: string;
  successMessage?: string;
  isSubmitting?: boolean;
  onSubmit: (values: TransactionFormValues) => Promise<any>;
  examples?: QuickEntryExample[];
  accounts?: string[];
  categories?: string[];
}

const DEFAULT_EXAMPLES: QuickEntryExample[] = [
  { text: '30  HDFC  Groceries.Supermarket  Weekly dinner', type: 'expense' },
  { text: '+45000  Checking  Salary.Payroll  Monthly pay', type: 'income' },
];

const DEFAULT_ACCOUNTS = ['Cash', 'Checking', 'HDFC', 'ICICI', 'Credit Card', 'Savings'];

export const QuickEntryView: React.FC<QuickEntryViewProps> = ({
  title = 'Quick entry',
  subtitle,
  currency = 'USD',
  placeholder = '30  HDFC  Groceries.Supermarket  Lunch note',
  successMessage = 'Saved successfully!',
  isSubmitting = false,
  onSubmit,
  examples = DEFAULT_EXAMPLES,
  accounts,
  categories,
}) => {
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });
  const [lastSavedSummary, setLastSavedSummary] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const mergedAccounts = useMemo(() => {
    const custom = accounts || [];
    const combined = [...custom, ...DEFAULT_ACCOUNTS];
    const seen = new Set<string>();
    const list: string[] = [];
    for (const acc of combined) {
      const trimmed = acc.trim();
      if (trimmed && !seen.has(trimmed.toLowerCase())) {
        seen.add(trimmed.toLowerCase());
        list.push(trimmed);
      }
    }
    return list;
  }, [accounts]);

  const mergedCategories = useMemo(() => {
    return categories && categories.length > 0 ? categories : (ALLOWED_CATEGORIES as readonly string[]);
  }, [categories]);

  const fieldState = useMemo(() => {
    return detectQuickEntryField(input, cursorPosition);
  }, [input, cursorPosition]);

  const filteredSuggestions = useMemo(() => {
    if (!showSuggestions) return [];

    if (fieldState.field === 'account') {
      const q = fieldState.query.toLowerCase().trim();
      if (!q) return mergedAccounts.slice(0, 10);
      return mergedAccounts
        .filter((acc) => acc.toLowerCase().includes(q))
        .slice(0, 10);
    }

    if (fieldState.field === 'category') {
      const q = fieldState.query.toLowerCase().trim();
      if (q.includes('.')) return [];
      if (!q) return mergedCategories.slice(0, 10);
      return mergedCategories
        .filter((cat) => cat.toLowerCase().startsWith(q) || cat.toLowerCase().includes(q))
        .slice(0, 10);
    }

    return [];
  }, [fieldState, showSuggestions, mergedAccounts, mergedCategories]);

  useEffect(() => {
    setActiveSuggestionIndex(-1);
  }, [filteredSuggestions]);

  const progress: QuickEntryProgressResult = useMemo(() => {
    return parseQuickEntry(input);
  }, [input]);

  const handleSelectSuggestion = (suggestion: string) => {
    const { newInput, newCursor } = applyQuickEntryCompletion(input, suggestion, fieldState);
    setInput(newInput);
    setCursorPosition(newCursor);
    setShowSuggestions(true);
    setActiveSuggestionIndex(-1);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursor, newCursor);
      }
    }, 0);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (saving || isSubmitting) return;

    if (!progress.valid || !progress.values) {
      setStatus({
        type: 'error',
        message: progress.error || progress.hint || 'Please fill in a valid entry format.',
      });
      return;
    }

    setSaving(true);
    setStatus({ type: 'idle', message: '' });

    try {
      await onSubmit(progress.values);
      const desc = `${formatCurrency(Number(progress.values.amount), currency)} (${progress.values.category}${
        progress.values.subCategory ? ` . ${progress.values.subCategory}` : ''
      }) paid via ${progress.values.account}`;
      setLastSavedSummary(desc);
      setStatus({
        type: 'success',
        message: successMessage,
      });
      setInput('');
      setCursorPosition(0);
    } catch (err: any) {
      console.error(err);
      setStatus({
        type: 'error',
        message: err.message || 'An unexpected error occurred while saving.',
      });
    } finally {
      setSaving(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const busy = saving || isSubmitting;

  return (
    <div className="min-h-[50vh] sm:min-h-[70vh] flex flex-col items-center justify-start sm:justify-center px-4 py-3 sm:py-8 max-w-2xl mx-auto">
      <div className="text-center mb-3 sm:mb-6">
        <div className="inline-flex items-center justify-center p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl mb-2 sm:mb-4 text-brand-400">
          <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-brand-400" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-400 mt-1 sm:mt-2">
            {subtitle}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="w-full relative flex flex-col">
        {/* Status notification (Success / Submission Error) */}
        {status.type === 'success' && (
          <div className="mb-3 w-full bg-emerald-950/60 border border-emerald-800/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 flex items-start gap-3 shadow-xl animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-semibold text-emerald-300">{status.message}</h4>
              {lastSavedSummary && (
                <p className="text-[11px] sm:text-xs text-emerald-400/90 mt-0.5 truncate sm:whitespace-normal">{lastSavedSummary}</p>
              )}
            </div>
          </div>
        )}

        {status.type === 'error' && (
          <div className="mb-3 w-full bg-rose-950/60 border border-rose-800/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 flex items-start gap-3 shadow-xl animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-semibold text-rose-300">{status.message}</h4>
            </div>
          </div>
        )}

        {/* Live Parsed Preview or Parse Error (Above the input!) */}
        <div className="mb-3 w-full min-h-[48px] transition-all">
          {progress.stage === 'error' && (
            <div className="flex items-center gap-2.5 text-amber-300 bg-amber-950/50 border border-amber-800/60 rounded-2xl px-3.5 py-2.5 shadow-md animate-in fade-in duration-150 text-xs">
              <AlertCircle size={16} className="shrink-0 text-amber-400" />
              <span className="font-medium">{progress.error}</span>
            </div>
          )}

          {progress.valid && progress.values && (
            <div className="flex items-center justify-between bg-slate-900/95 border border-slate-800/90 rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-xl animate-in fade-in duration-150 backdrop-blur-sm">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 min-w-0">
                <span className="font-bold text-emerald-400 text-sm">
                  {formatCurrency(Number(progress.values.amount), currency)}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                    progress.values.type === 'income'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {progress.values.type}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">
                  Account: <strong className="text-slate-100">{progress.values.account}</strong>
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">
                  Category: <strong className="text-slate-100">{progress.values.category}</strong>
                </span>
                {progress.values.subCategory && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">
                      Subcategory: <strong className="text-slate-100">{progress.values.subCategory}</strong>
                    </span>
                  </>
                )}
                {progress.values.note && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="italic text-slate-300">"{progress.values.note}"</span>
                  </>
                )}
              </div>
              <span className="hidden md:inline-flex shrink-0 text-[11px] text-brand-400 font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 ml-2">
                Ready to save ↵
              </span>
            </div>
          )}

          {!progress.valid && progress.stage !== 'error' && progress.stage !== 'empty' && progress.partial && (
            <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800/80 rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-lg animate-in fade-in duration-150 backdrop-blur-sm">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 min-w-0">
                {progress.partial.amount && (
                  <>
                    <span className="font-bold text-emerald-400 text-sm">
                      {formatCurrency(Number(progress.partial.amount), currency)}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                        progress.partial.type === 'income'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {progress.partial.type}
                    </span>
                  </>
                )}
                {progress.partial.account && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">
                      Account: <strong className="text-slate-100">{progress.partial.account}</strong>
                    </span>
                  </>
                )}
                {progress.partial.category && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">
                      Category: <strong className="text-slate-100">{progress.partial.category}</strong>
                    </span>
                  </>
                )}
                {progress.partial.subCategory && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">
                      Subcategory: <strong className="text-slate-100">{progress.partial.subCategory}</strong>
                    </span>
                  </>
                )}
              </div>
              {progress.hint && (
                <span className="shrink-0 text-[11px] text-amber-400/90 font-medium px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 ml-2">
                  {progress.hint}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Suggestions Chips Bar (Above the input!) */}
        {filteredSuggestions.length > 0 && (
          <div
            data-testid="quick-entry-suggestions"
            className="mb-2 w-full animate-in fade-in slide-in-from-bottom-1 duration-150"
          >
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-0.5 scrollbar-none text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-0.5 flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700/60 shadow-sm">
                {fieldState.field === 'account' ? '🏦 Account' : '🏷️ Category'}
              </span>
              {filteredSuggestions.map((item, idx) => (
                <button
                  key={item}
                  type="button"
                  tabIndex={-1}
                  data-testid={`suggestion-${item}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectSuggestion(item);
                  }}
                  onClick={() => {
                    handleSelectSuggestion(item);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all flex items-center gap-1.5 border shadow-sm select-none cursor-pointer ${
                    idx === activeSuggestionIndex
                      ? 'bg-brand-600 text-white border-brand-400 ring-2 ring-brand-400/40'
                      : 'bg-slate-900/90 text-slate-200 hover:text-white hover:bg-slate-800 hover:border-slate-700 border-slate-800'
                  }`}
                >
                  {fieldState.field === 'category' && (
                    <span className="text-sm leading-none">{getCategoryIcon(item)}</span>
                  )}
                  <span>{item}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
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
              setCursorPosition(e.target.selectionStart ?? e.target.value.length);
              setShowSuggestions(true);
              if (status.type !== 'idle') {
                setStatus({ type: 'idle', message: '' });
              }
            }}
            onClick={(e) => {
              const target = e.target as HTMLInputElement;
              setCursorPosition(target.selectionStart ?? target.value.length);
              setShowSuggestions(true);
            }}
            onKeyUp={(e) => {
              const target = e.target as HTMLInputElement;
              setCursorPosition(target.selectionStart ?? target.value.length);
            }}
            disabled={busy}
            placeholder={placeholder}
            className="w-full pl-12 pr-14 py-4 sm:py-5 bg-slate-900/90 text-white placeholder-slate-500 rounded-3xl border-2 border-slate-800 shadow-2xl focus:border-brand-500 focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-brand-500/20 text-base sm:text-lg transition-all duration-200"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck="false"
            inputMode="text"
            enterKeyHint="send"
            onKeyDown={(e) => {
              if (filteredSuggestions.length > 0) {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setActiveSuggestionIndex((prev) => (prev + 1) % filteredSuggestions.length);
                  return;
                }

                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setActiveSuggestionIndex((prev) => (prev <= 0 ? filteredSuggestions.length - 1 : prev - 1));
                  return;
                }

                if (e.key === 'Tab' && !e.shiftKey) {
                  e.preventDefault();
                  const targetIndex = activeSuggestionIndex >= 0 ? activeSuggestionIndex : 0;
                  handleSelectSuggestion(filteredSuggestions[targetIndex]);
                  return;
                }

                if (e.key === 'Enter' && activeSuggestionIndex >= 0) {
                  e.preventDefault();
                  handleSelectSuggestion(filteredSuggestions[activeSuggestionIndex]);
                  return;
                }

                if (e.key === 'Escape') {
                  e.preventDefault();
                  setShowSuggestions(false);
                  return;
                }
              }

              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />

          <button
            type="submit"
            disabled={busy || !progress.valid}
            className="absolute inset-y-2 right-2 px-4 flex items-center justify-center bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:hover:bg-brand-600 text-white rounded-2xl transition-all duration-150 active:scale-95 shadow-md"
            title="Save Transaction (Enter)"
          >
            {busy ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
          </button>
        </div>
      </form>

      <div className="mt-10 w-full rounded-3xl border border-slate-800/60 bg-slate-900/40 p-5 backdrop-blur">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Quick entry format
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Type entries separated by 2 or more spaces, or commas:
        </p>
        <div className="mt-3 space-y-2 font-mono text-xs">
          {examples.map((ex, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-2xl bg-slate-950/80 text-slate-300 border border-slate-800/80 flex items-center justify-between"
            >
              <span>{ex.text}</span>
              <span
                className={`text-[10px] uppercase font-sans ${
                  ex.type === 'income' ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {ex.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
