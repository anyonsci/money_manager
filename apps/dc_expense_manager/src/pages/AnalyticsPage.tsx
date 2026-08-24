import React, { useState, useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useWorkspace } from '../context/WorkspaceContext';
import {
  AnalyticsSummary,
  CategoryPieChart
} from '@money-manager/ui';

export const AnalyticsPage: React.FC = () => {
  const { transactions } = useTransactions();
  const { activeWorkspace } = useWorkspace();
  const [dateFilter, setDateFilter] = useState<'month' | 'year' | 'all'>('month');

  const currency = activeWorkspace?.defaultCurrency || 'USD';

  const filteredTransactions = useMemo(() => {
    if (dateFilter === 'all') return transactions;

    const now = new Date();
    return transactions.filter((t) => {
      const txDate = new Date(t.transactionDate || t.timestamp || '');
      if (isNaN(txDate.getTime())) return true;
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Ledger Analytics</h2>
          <p className="text-xs text-slate-400 mt-1">
            Financial metrics for {activeWorkspace?.name || 'Workspace'}
          </p>
        </div>

        <div className="flex items-center rounded-2xl bg-slate-900 p-1 border border-slate-800">
          {(['month', 'year', 'all'] as const).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setDateFilter(range)}
              className={`rounded-xl px-4 py-1.5 text-xs font-semibold capitalize transition ${
                dateFilter === range
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range === 'month' ? 'This Month' : range === 'year' ? 'This Year' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      <AnalyticsSummary
        transactions={filteredTransactions}
        currency={currency}
      />

      <CategoryPieChart
        transactions={filteredTransactions}
        currency={currency}
      />
    </div>
  );
};

export default AnalyticsPage;
