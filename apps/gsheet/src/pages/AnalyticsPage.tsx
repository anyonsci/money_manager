import React, { useState, useMemo, useEffect } from 'react';
import { useTransactions } from '../context/TransactionContext';
import {
  MonthlyExpenseChart,
  CategoryPieChart,
  SpendingPaceChart,
  NeedsWantsSplit,
  AccountOutflowList,
  DayOfWeekSpending,
  CategoryMoMTrends,
  SubcategoryBreakdown,
} from '@money-manager/ui';

const getTxYmKey = (dateStr?: string | Date): string | null => {
  if (!dateStr) return null;
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}/.test(dateStr.trim())) {
    const parts = dateStr.trim().split(/[-T ]/);
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (!isNaN(y) && !isNaN(m) && m >= 1 && m <= 12) {
      return `${y}-${String(m).padStart(2, '0')}`;
    }
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const AnalyticsPage: React.FC = () => {
  const {
    transactions,
    loading,
    hasLoadedInitially,
    loadTransactions,
    hasMore,
    loadMoreTransactions
  } = useTransactions();

  const [dateFilter, setDateFilter] = useState<'6months' | 'month' | 'year' | 'all'>('6months');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  useEffect(() => {
    if (!hasLoadedInitially && !loading) {
      loadTransactions(1);
    } else if (hasLoadedInitially && hasMore && transactions.length <= 10 && !loading && loadMoreTransactions) {
      loadMoreTransactions();
    }
  }, [hasLoadedInitially, loading, loadTransactions, hasMore, transactions.length, loadMoreTransactions]);

  const past6MonthKeys = useMemo(() => {
    const keys = new Set<string>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      keys.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return keys;
  }, []);

  const filteredCategoryTransactions = useMemo(() => {
    const expenseOnly = transactions.filter((t) => t.type === 'expense' && t.status !== 'VOID');

    if (selectedMonth) {
      return expenseOnly.filter((t) => {
        const ym = getTxYmKey(t.transactionDate || t.timestamp);
        return ym === selectedMonth;
      });
    }

    if (dateFilter === 'all') return expenseOnly;

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentYear = now.getFullYear();

    return expenseOnly.filter((t) => {
      const ym = getTxYmKey(t.transactionDate || t.timestamp);
      if (!ym) return false;

      if (dateFilter === '6months') {
        return past6MonthKeys.has(ym);
      }
      if (dateFilter === 'month') {
        return ym === currentMonthKey;
      }
      if (dateFilter === 'year') {
        return ym.startsWith(String(currentYear));
      }
      return true;
    });
  }, [transactions, selectedMonth, dateFilter, past6MonthKeys]);

  const categoryChartSubtitle = useMemo(() => {
    if (selectedMonth) {
      const [y, m] = selectedMonth.split('-');
      const d = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
      const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      return `Filtered to ${label} (Click bar to reset)`;
    }
    if (dateFilter === '6months') return 'Past 6 Months';
    if (dateFilter === 'month') return 'This Month';
    if (dateFilter === 'year') return 'This Year';
    return 'All Time';
  }, [selectedMonth, dateFilter]);

  const handleFilterChange = (range: '6months' | 'month' | 'year' | 'all') => {
    setSelectedMonth(null);
    setDateFilter(range);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Range Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Spending Analytics</h2>
          <p className="text-xs text-slate-400 mt-1">
            Visual breakdown of your expenses, velocity, and behavioral patterns
          </p>
        </div>

        <div className="flex items-center rounded-2xl bg-slate-900 p-1 border border-slate-800">
          {(['6months', 'month', 'year', 'all'] as const).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => handleFilterChange(range)}
              className={`rounded-xl px-3 sm:px-4 py-1.5 text-xs font-semibold capitalize transition ${
                dateFilter === range && !selectedMonth
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range === '6months'
                ? 'Past 6 Months'
                : range === 'month'
                ? 'This Month'
                : range === 'year'
                ? 'This Year'
                : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Row: 6-Month Stacked Spend & Cumulative Pace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyExpenseChart
          transactions={transactions}
          currency="INR"
          locale="en-IN"
          selectedMonth={selectedMonth}
          onSelectMonth={setSelectedMonth}
        />
        <SpendingPaceChart
          transactions={transactions}
          currency="INR"
          locale="en-IN"
        />
      </div>

      {/* Secondary Row: Category Split & Needs vs. Wants Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart
          transactions={filteredCategoryTransactions}
          currency="INR"
          locale="en-IN"
          title="Spending by Category"
          subtitle={categoryChartSubtitle}
        />
        <NeedsWantsSplit
          transactions={filteredCategoryTransactions}
          currency="INR"
          locale="en-IN"
        />
      </div>

      {/* Tertiary Row: Day-of-Week Habits & Account Outflow Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DayOfWeekSpending
          transactions={filteredCategoryTransactions}
          currency="INR"
          locale="en-IN"
        />
        <AccountOutflowList
          transactions={filteredCategoryTransactions}
          currency="INR"
          locale="en-IN"
        />
      </div>

      {/* Quaternary Row: MoM Movers & Subcategory Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryMoMTrends
          transactions={transactions}
          currency="INR"
          locale="en-IN"
        />
        <SubcategoryBreakdown
          transactions={filteredCategoryTransactions}
          currency="INR"
          locale="en-IN"
        />
      </div>
    </div>
  );
};

export default AnalyticsPage;
