import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { UnifiedTransaction, formatCurrency } from '@money-manager/core';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { parseYearMonth } from './MonthlyExpenseChart';

export interface SpendingPaceChartProps {
  transactions: UnifiedTransaction[];
  currency?: string;
  locale?: string;
  referenceDate?: Date;
  title?: string;
}

export const SpendingPaceChart: React.FC<SpendingPaceChartProps> = ({
  transactions,
  currency = 'INR',
  locale = 'en-IN',
  referenceDate,
  title = 'Spending Pace (This Month vs. Last Month)',
}) => {
  const refDate = useMemo(() => referenceDate || new Date(), [referenceDate]);

  const {
    chartData,
    currentMonthTotalToDate,
    prevMonthTotalToDate,
    prevMonthFullTotal,
    pacePercentage,
    isPacingHigher,
    hasCurrentData,
  } = useMemo(() => {
    const curYear = refDate.getFullYear();
    const curMonth = refDate.getMonth();
    const curDay = refDate.getDate();

    const prevDate = new Date(curYear, curMonth - 1, 1);
    const prevYear = prevDate.getFullYear();
    const prevMonth = prevDate.getMonth();

    const daysInCurMonth = new Date(curYear, curMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
    const maxDays = Math.max(daysInCurMonth, daysInPrevMonth);

    // Arrays to collect daily spend (1-indexed, size maxDays + 1)
    const curDaily = new Array(maxDays + 1).fill(0);
    const prevDaily = new Array(maxDays + 1).fill(0);

    for (const t of transactions) {
      if (t.status === 'VOID') continue;
      if (t.type !== 'expense') continue;

      const ym = parseYearMonth(t.transactionDate || t.timestamp);
      if (!ym) continue;

      const dObj = new Date(t.transactionDate || t.timestamp || '');
      let day = dObj.getDate();
      if (typeof t.transactionDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(t.transactionDate.trim())) {
        const parts = t.transactionDate.trim().split(/[-T ]/);
        const parsedDay = parseInt(parts[2], 10);
        if (!isNaN(parsedDay)) day = parsedDay;
      }
      if (day < 1 || day > maxDays) continue;

      const amt = Number(t.amount) || 0;
      if (amt <= 0) continue;

      if (ym.year === curYear && ym.month === curMonth) {
        curDaily[day] += amt;
      } else if (ym.year === prevYear && ym.month === prevMonth) {
        prevDaily[day] += amt;
      }
    }

    let curCum = 0;
    let prevCum = 0;
    const points: Array<{
      day: number;
      dayLabel: string;
      currentMonth: number | null;
      previousMonth: number;
    }> = [];

    for (let day = 1; day <= maxDays; day++) {
      if (day <= daysInPrevMonth) {
        prevCum += prevDaily[day];
      }

      let curVal: number | null = null;
      if (day <= Math.min(curDay, daysInCurMonth)) {
        curCum += curDaily[day];
        curVal = curCum;
      }

      points.push({
        day,
        dayLabel: `Day ${day}`,
        currentMonth: curVal,
        previousMonth: prevCum,
      });
    }

    // Prev month up to today
    let prevToDate = 0;
    for (let d = 1; d <= Math.min(curDay, daysInPrevMonth); d++) {
      prevToDate += prevDaily[d];
    }

    const diff = curCum - prevToDate;
    const pct = prevToDate > 0 ? (diff / prevToDate) * 100 : curCum > 0 ? 100 : 0;

    return {
      chartData: points,
      currentMonthTotalToDate: curCum,
      prevMonthTotalToDate: prevToDate,
      prevMonthFullTotal: prevCum,
      pacePercentage: Math.abs(pct),
      isPacingHigher: diff > 0,
      hasCurrentData: curCum > 0 || prevCum > 0,
    };
  }, [transactions, refDate]);

  if (!hasCurrentData) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-400 backdrop-blur shadow-lg">
        <Clock className="mb-2 h-8 w-8 text-slate-600" />
        <p className="text-sm font-medium">No recent spending pace data</p>
        <p className="text-xs text-slate-500 mt-1">
          Add expenses for this month to track your cumulative spending pace vs last month.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-semibold ${
                isPacingHigher
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {isPacingHigher ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              <span>
                {isPacingHigher ? '+' : '-'}
                {pacePercentage.toFixed(1)}% vs. same time last month
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
            <span className="text-slate-300">This Month: </span>
            <strong className="text-white">
              {formatCurrency(currentMonthTotalToDate, currency, locale)}
            </strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-500 border border-dashed border-slate-400" />
            <span className="text-slate-400">Last Month: </span>
            <span className="text-slate-300">
              {formatCurrency(prevMonthFullTotal, currency, locale)}
            </span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%" minHeight={250}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="brandPaceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(d) => `D${d}`}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => {
                if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                return String(val);
              }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length > 0) {
                  const data = payload[0].payload;
                  const curVal = data.currentMonth;
                  const prevVal = data.previousMonth;

                  return (
                    <div className="rounded-2xl border border-slate-700 bg-slate-950/95 p-3.5 shadow-2xl backdrop-blur text-xs min-w-[200px]">
                      <p className="font-bold text-white mb-2 pb-1.5 border-b border-slate-800">
                        Day {label} Cumulative
                      </p>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-brand-400 font-medium">
                            <span className="h-2 w-2 rounded-full bg-brand-500" />
                            This Month
                          </span>
                          <span className="font-bold text-white">
                            {curVal !== null ? formatCurrency(curVal, currency, locale) : '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <span className="h-2 w-2 rounded-full bg-slate-500" />
                            Last Month
                          </span>
                          <span className="font-medium text-slate-300">
                            {formatCurrency(prevVal, currency, locale)}
                          </span>
                        </div>
                        {curVal !== null && (
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Difference:</span>
                            <span
                              className={`font-semibold ${
                                curVal > prevVal ? 'text-rose-400' : 'text-emerald-400'
                              }`}
                            >
                              {curVal >= prevVal ? '+' : ''}
                              {formatCurrency(curVal - prevVal, currency, locale)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Previous Month Benchmark (dashed line) */}
            <Line
              type="monotone"
              dataKey="previousMonth"
              stroke="#64748b"
              strokeDasharray="4 4"
              strokeWidth={2}
              dot={false}
              name="Last Month"
            />
            {/* Current Month Trajectory (solid area) */}
            <Area
              type="monotone"
              dataKey="currentMonth"
              stroke="#6366f1"
              strokeWidth={3}
              fill="url(#brandPaceGradient)"
              dot={false}
              name="This Month"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SpendingPaceChart;
