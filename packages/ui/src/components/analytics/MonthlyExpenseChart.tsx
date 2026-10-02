import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  UnifiedTransaction,
  formatCurrency,
  getCategoryIcon,
  getCanonicalCategory,
  getCategoryHexColor,
} from '@money-manager/core';
import { Calendar, FilterX } from 'lucide-react';

export interface MonthlyExpenseChartProps {
  transactions: UnifiedTransaction[];
  currency?: string;
  locale?: string;
  title?: string;
  monthsCount?: number;
  referenceDate?: Date;
  selectedMonth?: string | null;
  onSelectMonth?: (monthKey: string | null) => void;
}

export interface MonthBucket {
  key: string;        // '2026-05'
  year: number;
  month: number;      // 0-11
  shortLabel: string; // "May '26"
  fullLabel: string;  // "May 2026"
}

export function parseYearMonth(dateStr?: string | Date): { year: number; month: number } | null {
  if (!dateStr) return null;
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}/.test(dateStr.trim())) {
    const parts = dateStr.trim().split(/[-T ]/);
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (!isNaN(y) && !isNaN(m) && m >= 1 && m <= 12) {
      return { year: y, month: m - 1 };
    }
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return { year: d.getFullYear(), month: d.getMonth() };
}

export function getPastMonthsBuckets(count = 6, referenceDate = new Date()): MonthBucket[] {
  const buckets: MonthBucket[] = [];
  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth();

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(refYear, refMonth - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const key = `${y}-${String(m + 1).padStart(2, '0')}`;
    const shortMonth = d.toLocaleDateString('en-US', { month: 'short' });
    const fullMonth = d.toLocaleDateString('en-US', { month: 'long' });
    const shortYear = String(y).slice(-2);
    buckets.push({
      key,
      year: y,
      month: m,
      shortLabel: `${shortMonth} '${shortYear}`,
      fullLabel: `${fullMonth} ${y}`,
    });
  }
  return buckets;
}

export const MonthlyExpenseChart: React.FC<MonthlyExpenseChartProps> = ({
  transactions,
  currency = 'INR',
  locale = 'en-IN',
  title = 'Monthly Spending (Past 6 Months)',
  monthsCount = 6,
  referenceDate,
  selectedMonth = null,
  onSelectMonth,
}) => {
  const effectiveRefDate = useMemo(() => referenceDate || new Date(), [referenceDate]);

  const monthBuckets = useMemo(
    () => getPastMonthsBuckets(monthsCount, effectiveRefDate),
    [monthsCount, effectiveRefDate]
  );

  const { chartData, sortedCategories, totalSixMonthExpense, monthlyAverage } = useMemo(() => {
    const monthKeysSet = new Set(monthBuckets.map((b) => b.key));

    const monthMap = new Map<
      string,
      {
        monthKey: string;
        monthLabel: string;
        fullLabel: string;
        totalExpense: number;
        categories: Record<string, number>;
      }
    >();

    for (const b of monthBuckets) {
      monthMap.set(b.key, {
        monthKey: b.key,
        monthLabel: b.shortLabel,
        fullLabel: b.fullLabel,
        totalExpense: 0,
        categories: {},
      });
    }

    const categoryTotals = new Map<string, number>();

    for (const t of transactions) {
      if (t.status === 'VOID') continue;
      if (t.type !== 'expense') continue;

      const ym = parseYearMonth(t.transactionDate || t.timestamp);
      if (!ym) continue;

      const ymKey = `${ym.year}-${String(ym.month + 1).padStart(2, '0')}`;
      if (!monthKeysSet.has(ymKey)) continue;

      const bucket = monthMap.get(ymKey);
      if (!bucket) continue;

      const amount = Number(t.amount) || 0;
      if (amount <= 0) continue;

      const cat = getCanonicalCategory(t.category) || 'others';

      bucket.totalExpense += amount;
      bucket.categories[cat] = (bucket.categories[cat] || 0) + amount;
      categoryTotals.set(cat, (categoryTotals.get(cat) || 0) + amount);
    }

    const sortedCats = Array.from(categoryTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);

    const rows = monthBuckets.map((b) => {
      const bucket = monthMap.get(b.key)!;
      const row: Record<string, any> = {
        monthKey: bucket.monthKey,
        monthLabel: bucket.monthLabel,
        fullLabel: bucket.fullLabel,
        totalExpense: bucket.totalExpense,
      };
      for (const cat of sortedCats) {
        row[cat] = bucket.categories[cat] || 0;
      }
      return row;
    });

    const totalExpense = Array.from(categoryTotals.values()).reduce((sum, v) => sum + v, 0);
    const avg = totalExpense / (monthBuckets.length || 1);

    return {
      chartData: rows,
      sortedCategories: sortedCats,
      totalSixMonthExpense: totalExpense,
      monthlyAverage: avg,
    };
  }, [transactions, monthBuckets]);

  const selectedMonthBucket = useMemo(
    () => monthBuckets.find((b) => b.key === selectedMonth),
    [monthBuckets, selectedMonth]
  );

  if (totalSixMonthExpense === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-400 backdrop-blur shadow-lg">
        <Calendar className="mb-2 h-8 w-8 text-slate-600" />
        <p className="text-sm font-medium">No expense data available for the past 6 months</p>
        <p className="text-xs text-slate-500 mt-1">Expenses recorded in this period will appear here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur shadow-lg">
      {/* Header with Title & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            {selectedMonthBucket && onSelectMonth && (
              <button
                type="button"
                onClick={() => onSelectMonth(null)}
                className="inline-flex items-center gap-1 rounded-lg bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 text-[11px] font-semibold text-brand-400 hover:bg-brand-500/20 transition"
                title="Clear month filter"
              >
                <span>Filtered: {selectedMonthBucket.shortLabel}</span>
                <FilterX size={12} />
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Category-stacked expense trends over time
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="rounded-xl bg-slate-800/80 px-3 py-1.5 border border-slate-700/60">
            <span className="text-slate-400">Total: </span>
            <strong className="text-rose-400 font-bold">
              {formatCurrency(totalSixMonthExpense, currency, locale)}
            </strong>
          </div>
          <div className="rounded-xl bg-slate-800/80 px-3 py-1.5 border border-slate-700/60">
            <span className="text-slate-400">Monthly Avg: </span>
            <strong className="text-slate-200 font-bold">
              {formatCurrency(monthlyAverage, currency, locale)}
            </strong>
          </div>
        </div>
      </div>

      {/* Stacked Bar Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
            onClick={(state) => {
              if (onSelectMonth && state && state.activePayload && state.activePayload.length > 0) {
                const item = state.activePayload[0].payload;
                if (item && item.monthKey) {
                  onSelectMonth(selectedMonth === item.monthKey ? null : item.monthKey);
                }
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
            <XAxis
              dataKey="monthLabel"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => {
                if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                return String(val);
              }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length > 0) {
                  const data = payload[0].payload;
                  const total = Number(data.totalExpense) || 0;
                  const items = payload
                    .filter((p: any) => Number(p.value) > 0)
                    .sort((a: any, b: any) => Number(b.value) - Number(a.value));

                  return (
                    <div className="rounded-2xl border border-slate-700 bg-slate-950/95 p-3.5 shadow-2xl backdrop-blur text-xs min-w-[200px]">
                      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2 mb-2">
                        <span className="font-bold text-white">{data.fullLabel || label}</span>
                        <span className="font-bold text-rose-400">
                          {formatCurrency(total, currency, locale)}
                        </span>
                      </div>
                      {items.length === 0 ? (
                        <p className="text-slate-400 italic">No expenses</p>
                      ) : (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {items.map((item: any) => {
                            const val = Number(item.value);
                            const pct = total > 0 ? ((val / total) * 100).toFixed(0) : '0';
                            const catName = String(item.dataKey);
                            return (
                              <div
                                key={catName}
                                className="flex items-center justify-between gap-2 text-slate-300"
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <span
                                    className="h-2 w-2 rounded-full shrink-0"
                                    style={{ backgroundColor: item.color || item.fill }}
                                  />
                                  <span>{getCategoryIcon(catName)}</span>
                                  <span className="capitalize truncate">{catName}</span>
                                </div>
                                <div className="font-medium text-slate-200 shrink-0">
                                  {formatCurrency(val, currency, locale)}{' '}
                                  <span className="text-[10px] text-slate-500 font-normal">
                                    ({pct}%)
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {onSelectMonth && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-brand-400 font-medium text-center">
                          Click bar to {selectedMonth === data.monthKey ? 'clear filter' : 'filter category split'}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            {sortedCategories.map((cat, idx) => (
              <Bar
                key={cat}
                dataKey={cat}
                stackId="expense"
                fill={getCategoryHexColor(cat, idx)}
                cursor={onSelectMonth ? 'pointer' : 'default'}
                opacity={
                  selectedMonth
                    ? selectedMonth === cat
                      ? 1
                      : 0.85
                    : 1
                }
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown Legend */}
      <div className="mt-6 border-t border-slate-800/80 pt-4">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
          6-Month Category Breakdown
        </span>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 max-h-44 overflow-y-auto pr-1">
          {sortedCategories.map((cat, idx) => {
            const color = getCategoryHexColor(cat, idx);
            const totalForCat = chartData.reduce((sum, row) => sum + (Number(row[cat]) || 0), 0);
            const pct =
              totalSixMonthExpense > 0
                ? ((totalForCat / totalSixMonthExpense) * 100).toFixed(0)
                : '0';

            return (
              <div
                key={cat}
                className="flex items-center justify-between rounded-xl bg-slate-800/40 p-2 text-xs border border-slate-800"
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate text-slate-300 flex items-center gap-1.5">
                    <span className="text-sm leading-none">{getCategoryIcon(cat)}</span>
                    <span className="capitalize">{cat}</span>
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-semibold text-slate-200">
                    {formatCurrency(totalForCat, currency, locale)}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MonthlyExpenseChart;
