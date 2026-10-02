import React, { useMemo } from 'react';
import {
  UnifiedTransaction,
  formatCurrency,
  getCanonicalCategory,
  getCategoryIcon,
} from '@money-manager/core';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Compass } from 'lucide-react';
import { parseYearMonth } from './MonthlyExpenseChart';

export interface CategoryMoMTrendsProps {
  transactions: UnifiedTransaction[];
  currency?: string;
  locale?: string;
  referenceDate?: Date;
  title?: string;
}

interface CategoryTrendItem {
  category: string;
  currentAmount: number;
  previousAmount: number;
  diff: number;
  percentageChange: number;
  isNew: boolean;
}

export const CategoryMoMTrends: React.FC<CategoryMoMTrendsProps> = ({
  transactions,
  currency = 'INR',
  locale = 'en-IN',
  referenceDate,
  title = 'MoM Category Spikes & Drops',
}) => {
  const refDate = useMemo(() => referenceDate || new Date(), [referenceDate]);

  const { items, hasData } = useMemo(() => {
    const curYear = refDate.getFullYear();
    const curMonth = refDate.getMonth();

    const prevDate = new Date(curYear, curMonth - 1, 1);
    const prevYear = prevDate.getFullYear();
    const prevMonth = prevDate.getMonth();

    const curMap = new Map<string, number>();
    const prevMap = new Map<string, number>();

    for (const t of transactions) {
      if (t.status === 'VOID') continue;
      if (t.type !== 'expense') continue;

      const amt = Number(t.amount) || 0;
      if (amt <= 0) continue;

      const ym = parseYearMonth(t.transactionDate || t.timestamp);
      if (!ym) continue;

      const cat = getCanonicalCategory(t.category) || 'others';

      if (ym.year === curYear && ym.month === curMonth) {
        curMap.set(cat, (curMap.get(cat) || 0) + amt);
      } else if (ym.year === prevYear && ym.month === prevMonth) {
        prevMap.set(cat, (prevMap.get(cat) || 0) + amt);
      }
    }

    const allCats = new Set([...curMap.keys(), ...prevMap.keys()]);
    const list: CategoryTrendItem[] = [];

    for (const cat of allCats) {
      const cur = curMap.get(cat) || 0;
      const prev = prevMap.get(cat) || 0;
      const diff = cur - prev;

      let pct = 0;
      let isNew = false;

      if (prev > 0) {
        pct = (diff / prev) * 100;
      } else if (cur > 0) {
        pct = 100;
        isNew = true;
      }

      list.push({
        category: cat,
        currentAmount: cur,
        previousAmount: prev,
        diff,
        percentageChange: pct,
        isNew,
      });
    }

    // Sort by magnitude of change
    list.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

    return {
      items: list,
      hasData: list.length > 0 && (curMap.size > 0 || prevMap.size > 0),
    };
  }, [transactions, refDate]);

  if (!hasData) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-400 backdrop-blur shadow-lg">
        <Compass className="mb-2 h-8 w-8 text-slate-600" />
        <p className="text-sm font-medium">No Month-over-Month comparison data</p>
        <p className="text-xs text-slate-500 mt-1">
          Requires transactions across consecutive months to calculate trend spikes and drops.
        </p>
      </div>
    );
  }

  const spikes = items.filter((i) => i.diff > 0);
  const drops = items.filter((i) => i.diff < 0);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">Top increases and decreases vs last month</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-rose-400">
            <TrendingUp size={14} /> {spikes.length} Increased
          </span>
          <span className="text-slate-600">·</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <TrendingDown size={14} /> {drops.length} Decreased
          </span>
        </div>
      </div>

      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {items.slice(0, 6).map((item) => {
          const isIncrease = item.diff > 0;
          return (
            <div
              key={item.category}
              className="flex items-center justify-between rounded-2xl bg-slate-800/40 border border-slate-800 p-3 text-xs"
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className="text-base">{getCategoryIcon(item.category)}</span>
                <div className="truncate">
                  <span className="font-semibold text-white capitalize truncate block">
                    {item.category}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {formatCurrency(item.currentAmount, currency, locale)} vs{' '}
                    <span className="text-slate-500">{formatCurrency(item.previousAmount, currency, locale)}</span>
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`inline-flex items-center gap-0.5 font-bold ${
                    isIncrease ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {isIncrease ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {item.isNew
                    ? 'NEW'
                    : `${isIncrease ? '+' : ''}${item.percentageChange.toFixed(0)}%`}
                </span>
                <span className="block text-[10px] text-slate-500 font-medium">
                  {isIncrease ? '+' : ''}
                  {formatCurrency(item.diff, currency, locale)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryMoMTrends;
