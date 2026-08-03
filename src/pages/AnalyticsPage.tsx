import { useMemo, useState } from 'react';
import { AnalyticsSummary } from '../components/analytics/AnalyticsSummary';
import { CategoryPieChart } from '../components/analytics/CategoryPieChart';
import { useTransactions } from '../context/TransactionContext';

export const AnalyticsPage = () => {
  const { transactions } = useTransactions();
  const [range, setRange] = useState<'month' | 'all'>('month');

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    if (range === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      return transactions.filter((item) => new Date(item.timestamp).getTime() >= start);
    }
    return transactions;
  }, [range, transactions]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(['month', 'all'] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setRange(item)}
            className={`rounded-full px-3 py-2 text-sm font-medium transition ${range === item ? 'bg-brand-600 text-white' : 'bg-slate-900 text-slate-300'}`}
          >
            {item === 'month' ? 'This Month' : 'All Time'}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CategoryPieChart transactions={filteredTransactions} />
        <AnalyticsSummary transactions={filteredTransactions} />
      </div>
    </div>
  );
};

export default AnalyticsPage;
