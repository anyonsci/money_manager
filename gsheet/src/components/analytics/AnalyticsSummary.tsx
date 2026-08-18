import { Transaction } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface AnalyticsSummaryProps {
  transactions: Transaction[];
}

export const AnalyticsSummary = ({ transactions }: AnalyticsSummaryProps) => {
  const expenses = transactions.filter((item) => item.type === 'expense');
  const incomes = transactions.filter((item) => item.type === 'income');
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
  const net = totalIncome - totalExpenses;

  const categoryTotals = Object.entries(
    expenses.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-sm text-slate-400">Total income</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-300">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-sm text-slate-400">Total expenses</p>
          <p className="mt-2 text-2xl font-semibold text-rose-300">{formatCurrency(totalExpenses)}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
        <h3 className="text-base font-semibold text-white">Top categories</h3>
        <div className="mt-3 space-y-2">
          {categoryTotals.map(([category, amount]) => (
            <div key={category} className="flex items-center justify-between rounded-2xl bg-slate-800/70 px-3 py-2 text-sm">
              <span className="text-slate-300">{category}</span>
              <span className="font-medium text-white">{formatCurrency(amount)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-brand-500/20 to-slate-900/80 p-4">
        <p className="text-sm text-slate-400">Net balance</p>
        <p className={`mt-2 text-2xl font-semibold ${net >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{formatCurrency(net)}</p>
      </div>
    </div>
  );
};
