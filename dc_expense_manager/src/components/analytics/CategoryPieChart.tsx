import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/formatters.js';
import { useWorkspace } from '../../context/WorkspaceContext.js';
import type { FormattedTransaction } from '../../types/index.js';

const COLORS = [
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#eab308', // Yellow
  '#64748b', // Slate
];

export const CategoryPieChart: React.FC<{ transactions: FormattedTransaction[] }> = ({
  transactions,
}) => {
  const { activeWorkspace } = useWorkspace();
  const currency = activeWorkspace?.defaultCurrency || 'USD';

  // Aggregate expenses by category
  const expenseMap = new Map<string, number>();
  let totalExpense = 0;

  for (const t of transactions) {
    if (t.type === 'expense') {
      const current = expenseMap.get(t.category) || 0;
      expenseMap.set(t.category, current + t.amount);
      totalExpense += t.amount;
    }
  }

  const data = Array.from(expenseMap.entries())
    .map(([name, value]) => ({
      name,
      value,
      percentage: totalExpense > 0 ? ((value / totalExpense) * 100).toFixed(1) : '0',
    }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 text-center text-xs text-slate-500">
        No expense data available to display chart.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
        Expenses by Category
      </h3>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: number) => [formatCurrency(val, currency), 'Amount']}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#fff',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category Legend List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
        {data.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center justify-between rounded-xl bg-slate-950/40 px-3 py-2 text-xs"
          >
            <div className="flex items-center gap-2 truncate">
              <span
                className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="font-semibold text-slate-200 truncate">{item.name}</span>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <span className="font-bold text-white">
                {formatCurrency(item.value, currency)}
              </span>
              <span className="text-[10px] text-slate-400 ml-1.5">({item.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
