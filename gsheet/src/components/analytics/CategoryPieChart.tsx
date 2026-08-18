import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Transaction } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface CategoryPieChartProps {
  transactions: Transaction[];
}

const COLORS = ['#5b7cff', '#34d399', '#f59e0b', '#fb7185', '#8b5cf6', '#22d3ee'];

export const CategoryPieChart = ({ transactions }: CategoryPieChartProps) => {
  const data = Object.entries(
    transactions.reduce<Record<string, number>>((acc, transaction) => {
      if (transaction.type === 'expense') {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      }
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Spending mix</h3>
          <p className="text-sm text-slate-400">Category breakdown by total expense</p>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={2}>
              {data.map((entry, index) => (
                <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
