import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { UnifiedTransaction, formatCurrency } from '@money-manager/core';

export interface CategoryPieChartProps {
  transactions: UnifiedTransaction[];
  currency?: string;
  locale?: string;
  title?: string;
}

const PALETTE = [
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#10b981', // Emerald
  '#6366f1', // Indigo
  '#f43f5e', // Rose
  '#14b8a6', // Teal
  '#0ea5e9', // Sky
  '#f97316', // Orange
  '#ef4444', // Red
  '#a855f7', // Violet
  '#06b6d4', // Cyan
  '#64748b', // Slate
];

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
  transactions,
  currency = 'INR',
  locale = 'en-IN',
  title = 'Spending by Category'
}) => {
  const chartData = useMemo(() => {
    const map = new Map<string, number>();

    transactions
      .filter((t) => t.type === 'expense' && t.status !== 'VOID')
      .forEach((t) => {
        const cat = t.category || 'Others';
        map.set(cat, (map.get(cat) || 0) + t.amount);
      });

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const totalExpense = useMemo(
    () => chartData.reduce((sum, item) => sum + item.value, 0),
    [chartData]
  );

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-400">
        <p className="text-sm">No expense data available for the selected period</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
        <span className="text-xs text-slate-400">
          Total: <strong className="text-slate-200">{formatCurrency(totalExpense, currency, locale)}</strong>
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PALETTE[index % PALETTE.length]}
                  stroke="#0f172a"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0];
                  const value = Number(data.value);
                  const percentage = totalExpense > 0 ? ((value / totalExpense) * 100).toFixed(1) : '0';
                  return (
                    <div className="rounded-2xl border border-slate-700 bg-slate-950 p-3 shadow-xl text-xs">
                      <p className="font-semibold text-white">{data.name}</p>
                      <p className="text-brand-400 font-bold mt-1">
                        {formatCurrency(value, currency, locale)}{' '}
                        <span className="text-slate-400 font-normal">({percentage}%)</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category Legends */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 max-h-40 overflow-y-auto pr-1">
        {chartData.map((item, index) => {
          const color = PALETTE[index % PALETTE.length];
          const pct = totalExpense > 0 ? ((item.value / totalExpense) * 100).toFixed(0) : '0';
          return (
            <div key={item.name} className="flex items-center gap-2 text-xs">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="truncate text-slate-300 flex-1">{item.name}</span>
              <span className="text-[11px] text-slate-500 font-medium">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
