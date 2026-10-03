import React, { useMemo } from 'react';
import { UnifiedTransaction, formatCurrency } from '@money-manager/core';
import { CalendarDays, Flame } from 'lucide-react';

export interface DayOfWeekSpendingProps {
  transactions: UnifiedTransaction[];
  currency?: string;
  locale?: string;
  title?: string;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DayOfWeekSpending: React.FC<DayOfWeekSpendingProps> = ({
  transactions,
  currency = 'INR',
  locale = 'en-IN',
  title = 'Day of Week Spending Pattern',
}) => {
  const {
    dayTotals,
    maxSpend,
    totalExpense,
    weekdayAvg,
    weekendAvg,
    weekendMultiplier,
  } = useMemo(() => {
    // 0 = Sun, 1 = Mon, ..., 6 = Sat in JS getDay()
    // We map to Mon = 0, ..., Sun = 6
    const totals = [0, 0, 0, 0, 0, 0, 0];
    let total = 0;

    for (const t of transactions) {
      if (t.status === 'VOID') continue;
      if (t.type !== 'expense') continue;

      const amt = Number(t.amount) || 0;
      if (amt <= 0) continue;

      const d = new Date(t.transactionDate || t.timestamp || '');
      if (isNaN(d.getTime())) continue;

      const jsDay = d.getDay(); // 0 is Sun
      const dayIndex = jsDay === 0 ? 6 : jsDay - 1; // Mon = 0, Sun = 6
      totals[dayIndex] += amt;
      total += amt;
    }

    const max = Math.max(...totals, 1);
    const wkday = totals[0] + totals[1] + totals[2] + totals[3] + totals[4];
    const wkend = totals[5] + totals[6];
    const wkdayAvg = wkday / 5;
    const wkendAvg = wkend / 2;
    const mult = wkdayAvg > 0 ? wkendAvg / wkdayAvg : wkendAvg > 0 ? 2 : 1;

    return {
      dayTotals: totals,
      maxSpend: max,
      totalExpense: total,
      weekdayTotal: wkday,
      weekendTotal: wkend,
      weekdayAvg: wkdayAvg,
      weekendAvg: wkendAvg,
      weekendMultiplier: mult,
    };
  }, [transactions]);

  if (totalExpense === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-400 backdrop-blur shadow-lg">
        <CalendarDays className="mb-2 h-8 w-8 text-slate-600" />
        <p className="text-sm font-medium">No day-of-week spending data</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Lifestyle trends: Weekdays vs. Weekends</p>
          </div>
          {weekendMultiplier >= 1.25 && (
            <span className="inline-flex items-center gap-1 rounded-xl bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-400">
              <Flame size={13} />
              <span>Weekend Spike ({weekendMultiplier.toFixed(1)}x)</span>
            </span>
          )}
        </div>

        {/* 7 Column Bars */}
        <div className="mt-6 mb-4 flex items-end justify-between gap-2 h-36 px-2">
          {DAY_LABELS.map((label, idx) => {
            const val = dayTotals[idx];
            const heightPct = maxSpend > 0 ? Math.max(8, (val / maxSpend) * 100) : 8;
            const isWeekend = idx >= 5;

            return (
              <div key={label} className="flex-1 flex flex-col items-center h-full justify-end group">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-1 text-[10px] font-semibold text-white bg-slate-950 px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap shadow-lg pointer-events-none">
                  {formatCurrency(val, currency, locale)}
                </div>

                {/* Column */}
                <div
                  className={`w-full max-w-[36px] rounded-t-xl transition-all duration-300 group-hover:brightness-110 ${
                    isWeekend
                      ? 'bg-gradient-to-t from-purple-600 to-indigo-400 shadow-sm shadow-purple-500/20'
                      : 'bg-gradient-to-t from-brand-700 to-brand-500'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />

                {/* Label */}
                <span
                  className={`mt-2 text-[11px] font-semibold ${
                    isWeekend ? 'text-purple-300' : 'text-slate-400'
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekday vs Weekend Comparison Footer */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 mt-2 text-xs">
        <div className="rounded-xl bg-slate-800/50 p-2.5 border border-slate-800">
          <span className="text-slate-400 block text-[11px]">Weekday Daily Avg</span>
          <strong className="text-slate-200 text-sm">
            {formatCurrency(weekdayAvg, currency, locale)}
          </strong>
        </div>
        <div className="rounded-xl bg-purple-500/10 p-2.5 border border-purple-500/20">
          <span className="text-purple-300 block text-[11px]">Weekend Daily Avg</span>
          <strong className="text-purple-200 text-sm">
            {formatCurrency(weekendAvg, currency, locale)}
          </strong>
        </div>
      </div>
    </div>
  );
};

export default DayOfWeekSpending;
