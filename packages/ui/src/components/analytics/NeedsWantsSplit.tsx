import React, { useMemo } from 'react';
import {
  UnifiedTransaction,
  formatCurrency,
  isEssentialCategory,
  getCanonicalCategory,
  getCategoryIcon,
} from '@money-manager/core';
import { ShieldCheck, Sparkles, Scale } from 'lucide-react';

export interface NeedsWantsSplitProps {
  transactions: UnifiedTransaction[];
  currency?: string;
  locale?: string;
  title?: string;
}

export const NeedsWantsSplit: React.FC<NeedsWantsSplitProps> = ({
  transactions,
  currency = 'INR',
  locale = 'en-IN',
  title = 'Needs vs. Wants (Essential Ratio)',
}) => {
  const {
    needsTotal,
    wantsTotal,
    grandTotal,
    needsPct,
    wantsPct,
    needsBreakdown,
    wantsBreakdown,
  } = useMemo(() => {
    let needsSum = 0;
    let wantsSum = 0;
    const needsMap = new Map<string, number>();
    const wantsMap = new Map<string, number>();

    for (const t of transactions) {
      if (t.status === 'VOID') continue;
      if (t.type !== 'expense') continue;

      const amt = Number(t.amount) || 0;
      if (amt <= 0) continue;

      const cat = getCanonicalCategory(t.category) || 'others';

      if (isEssentialCategory(cat)) {
        needsSum += amt;
        needsMap.set(cat, (needsMap.get(cat) || 0) + amt);
      } else {
        wantsSum += amt;
        wantsMap.set(cat, (wantsMap.get(cat) || 0) + amt);
      }
    }

    const total = needsSum + wantsSum;
    const nPct = total > 0 ? (needsSum / total) * 100 : 0;
    const wPct = total > 0 ? (wantsSum / total) * 100 : 0;

    const nList = Array.from(needsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => ({ name, amount }));

    const wList = Array.from(wantsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => ({ name, amount }));

    return {
      needsTotal: needsSum,
      wantsTotal: wantsSum,
      grandTotal: total,
      needsPct: nPct,
      wantsPct: wPct,
      needsBreakdown: nList,
      wantsBreakdown: wList,
    };
  }, [transactions]);

  if (grandTotal === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-400 backdrop-blur shadow-lg">
        <Scale className="mb-2 h-8 w-8 text-slate-600" />
        <p className="text-sm font-medium">No expenses for Needs vs. Wants breakdown</p>
      </div>
    );
  }

  const isBalanced = needsPct <= 65;

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur shadow-lg flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              50/30 financial health rule: Essentials vs. Lifestyle
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold ${
              isBalanced
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            {isBalanced ? 'Balanced Budget' : 'Needs-Heavy Spend'}
          </span>
        </div>

        {/* Dual Progress Bar */}
        <div className="mt-2 mb-4">
          <div className="flex justify-between text-xs font-semibold mb-1.5">
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck size={14} /> Needs ({needsPct.toFixed(0)}%)
            </span>
            <span className="text-purple-400 flex items-center gap-1">
              <Sparkles size={14} /> Wants ({wantsPct.toFixed(0)}%)
            </span>
          </div>
          <div className="h-4 w-full rounded-full bg-slate-800 overflow-hidden flex p-0.5 border border-slate-700/50">
            <div
              className="h-full rounded-l-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              style={{ width: `${needsPct}%` }}
              title={`Needs: ${needsPct.toFixed(1)}%`}
            />
            <div
              className="h-full rounded-r-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-500"
              style={{ width: `${wantsPct}%` }}
              title={`Wants: ${wantsPct.toFixed(1)}%`}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 mt-1">
            <span>Target: ≤ 50-60%</span>
            <span>Target: ≤ 30-40%</span>
          </div>
        </div>
      </div>

      {/* 2 Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
        {/* Needs Box */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={14} /> Needs (Essentials)
            </span>
            <span className="text-xs font-bold text-white">
              {formatCurrency(needsTotal, currency, locale)}
            </span>
          </div>
          <div className="mt-3 space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {needsBreakdown.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No essential expenses</p>
            ) : (
              needsBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1 truncate">
                    <span>{getCategoryIcon(item.name)}</span>
                    <span className="capitalize truncate">{item.name}</span>
                  </span>
                  <span className="font-medium text-slate-200 shrink-0">
                    {formatCurrency(item.amount, currency, locale)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Wants Box */}
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} /> Wants (Discretionary)
            </span>
            <span className="text-xs font-bold text-white">
              {formatCurrency(wantsTotal, currency, locale)}
            </span>
          </div>
          <div className="mt-3 space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {wantsBreakdown.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No discretionary expenses</p>
            ) : (
              wantsBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1 truncate">
                    <span>{getCategoryIcon(item.name)}</span>
                    <span className="capitalize truncate">{item.name}</span>
                  </span>
                  <span className="font-medium text-slate-200 shrink-0">
                    {formatCurrency(item.amount, currency, locale)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeedsWantsSplit;
