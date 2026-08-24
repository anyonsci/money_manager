import React, { useMemo } from 'react';
import { UnifiedTransaction, formatCurrency } from '@money-manager/core';
import { Wallet, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export interface AnalyticsSummaryProps {
  transactions?: UnifiedTransaction[];
  summaryData?: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
  };
  currency?: string;
  locale?: string;
}

export const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({
  transactions = [],
  summaryData,
  currency = 'INR',
  locale = 'en-IN'
}) => {
  const totals = useMemo(() => {
    if (summaryData) return summaryData;

    let income = 0;
    let expense = 0;

    for (const t of transactions) {
      if (t.status === 'VOID') continue;
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expense += t.amount;
      }
    }

    return {
      totalIncome: income,
      totalExpense: expense,
      netBalance: income - expense,
    };
  }, [transactions, summaryData]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Total Income */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Income</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <ArrowDownRight size={18} />
          </div>
        </div>
        <p className="mt-3 text-2xl font-bold text-emerald-400">
          {formatCurrency(totals.totalIncome, currency, locale)}
        </p>
      </div>

      {/* Total Expense */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Expenses</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
            <ArrowUpRight size={18} />
          </div>
        </div>
        <p className="mt-3 text-2xl font-bold text-rose-400">
          {formatCurrency(totals.totalExpense, currency, locale)}
        </p>
      </div>

      {/* Net Balance */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Balance</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
            <Wallet size={18} />
          </div>
        </div>
        <p
          className={`mt-3 text-2xl font-bold ${
            totals.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {formatCurrency(totals.netBalance, currency, locale)}
        </p>
      </div>
    </div>
  );
};
