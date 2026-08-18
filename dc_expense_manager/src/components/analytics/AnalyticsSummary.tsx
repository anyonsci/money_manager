import React from 'react';
import { formatCurrency } from '../../utils/formatters.js';
import { useWorkspace } from '../../context/WorkspaceContext.js';
import { Wallet, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface AnalyticsSummaryProps {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}

export const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({
  totalIncome,
  totalExpense,
  netBalance,
}) => {
  const { activeWorkspace } = useWorkspace();
  const currency = activeWorkspace?.defaultCurrency || 'USD';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Total Income */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Total Income</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <ArrowDownRight size={16} />
          </div>
        </div>
        <div className="mt-2">
          <h3 className="text-xl font-bold text-emerald-400">
            {formatCurrency(totalIncome, currency)}
          </h3>
        </div>
      </div>

      {/* Total Expenses */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Total Expenses</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
            <ArrowUpRight size={16} />
          </div>
        </div>
        <div className="mt-2">
          <h3 className="text-xl font-bold text-rose-400">
            {formatCurrency(totalExpense, currency)}
          </h3>
        </div>
      </div>

      {/* Net Balance */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Net Ledger Balance</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
            <Wallet size={16} />
          </div>
        </div>
        <div className="mt-2">
          <h3
            className={`text-xl font-bold ${
              netBalance >= 0 ? 'text-white' : 'text-rose-400'
            }`}
          >
            {formatCurrency(netBalance, currency)}
          </h3>
        </div>
      </div>
    </div>
  );
};
