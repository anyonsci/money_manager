import React, { useState, useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext.js';
import { useWorkspace } from '../context/WorkspaceContext.js';
import { AnalyticsSummary } from '../components/analytics/AnalyticsSummary.js';
import { CategoryPieChart } from '../components/analytics/CategoryPieChart.js';
import { BarChart3 } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { transactions } = useTransactions();
  const { activeWorkspace } = useWorkspace();

  const [dateFilter, setDateFilter] = useState<'month' | 'year' | 'all'>('all');

  const filteredTransactions = useMemo(() => {
    if (dateFilter === 'all') return transactions;

    const now = new Date();
    return transactions.filter((t) => {
      const txDate = new Date(t.transactionDate);
      if (dateFilter === 'month') {
        return (
          txDate.getMonth() === now.getMonth() &&
          txDate.getFullYear() === now.getFullYear()
        );
      }
      if (dateFilter === 'year') {
        return txDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [transactions, dateFilter]);

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of filteredTransactions) {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    }
    return {
      totalIncome: income,
      totalExpense: expense,
      netBalance: income - expense,
    };
  }, [filteredTransactions]);

  return (
    <div className="space-y-6">
      {/* Top Header with Time Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="text-brand-400" size={22} />
            Analytics & Reports
          </h2>
          <p className="text-xs text-slate-400">
            Real-time financial insights in {activeWorkspace?.name || 'current workspace'}
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 rounded-2xl bg-slate-900 border border-slate-800 p-1">
          <button
            onClick={() => setDateFilter('month')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              dateFilter === 'month'
                ? 'bg-brand-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setDateFilter('year')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              dateFilter === 'year'
                ? 'bg-brand-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            This Year
          </button>
          <button
            onClick={() => setDateFilter('all')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              dateFilter === 'all'
                ? 'bg-brand-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <AnalyticsSummary
        totalIncome={summary.totalIncome}
        totalExpense={summary.totalExpense}
        netBalance={summary.netBalance}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6">
        <CategoryPieChart transactions={filteredTransactions} />
      </div>
    </div>
  );
};
