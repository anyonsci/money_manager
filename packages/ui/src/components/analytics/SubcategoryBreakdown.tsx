import React, { useState, useMemo } from 'react';
import {
  UnifiedTransaction,
  formatCurrency,
  getCanonicalCategory,
  getCategoryIcon,
} from '@money-manager/core';
import { Layers } from 'lucide-react';

export interface SubcategoryBreakdownProps {
  transactions: UnifiedTransaction[];
  currency?: string;
  locale?: string;
  title?: string;
}

export const SubcategoryBreakdown: React.FC<SubcategoryBreakdownProps> = ({
  transactions,
  currency = 'INR',
  locale = 'en-IN',
  title = 'Subcategory Deep Dive',
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const { availableCategories, subcategoryList, filteredTotal } = useMemo(() => {
    const catSet = new Set<string>();
    const subMap = new Map<string, { parentCat: string; name: string; amount: number }>();

    for (const t of transactions) {
      if (t.status === 'VOID') continue;
      if (t.type !== 'expense') continue;

      const amt = Number(t.amount) || 0;
      if (amt <= 0) continue;

      const cat = getCanonicalCategory(t.category) || 'others';
      const sub = t.subCategory ? t.subCategory.trim() : 'General / Unspecified';

      catSet.add(cat);

      if (selectedCategoryFilter !== 'all' && cat !== selectedCategoryFilter) {
        continue;
      }

      const key = `${cat}:::${sub}`;
      const existing = subMap.get(key) || { parentCat: cat, name: sub, amount: 0 };
      existing.amount += amt;
      subMap.set(key, existing);
    }

    const list = Array.from(subMap.values()).sort((a, b) => b.amount - a.amount);
    const total = list.reduce((sum, item) => sum + item.amount, 0);

    return {
      availableCategories: Array.from(catSet).sort(),
      subcategoryList: list,
      filteredTotal: total,
    };
  }, [transactions, selectedCategoryFilter]);

  if (subcategoryList.length === 0 && selectedCategoryFilter === 'all') {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-400 backdrop-blur shadow-lg">
        <Layers className="mb-2 h-8 w-8 text-slate-600" />
        <p className="text-sm font-medium">No subcategory data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">Granular item and merchant-level breakdown</p>
        </div>
        <span className="text-xs text-slate-400">
          Total: <strong className="text-slate-200">{formatCurrency(filteredTotal, currency, locale)}</strong>
        </span>
      </div>

      {/* Category Pills Filter */}
      {availableCategories.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1 rounded-xl font-medium shrink-0 transition ${
              selectedCategoryFilter === 'all'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            All Categories
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-xl font-medium shrink-0 flex items-center gap-1 transition ${
                selectedCategoryFilter === cat
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <span>{getCategoryIcon(cat)}</span>
              <span className="capitalize">{cat}</span>
            </button>
          ))}
        </div>
      )}

      {/* Subcategory List with Micro Bars */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {subcategoryList.slice(0, 8).map((item) => {
          const pct = filteredTotal > 0 ? (item.amount / filteredTotal) * 100 : 0;
          return (
            <div key={`${item.parentCat}-${item.name}`} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 truncate text-slate-200">
                  <span>{getCategoryIcon(item.parentCat)}</span>
                  <span className="font-semibold truncate">{item.name}</span>
                  {selectedCategoryFilter === 'all' && (
                    <span className="text-[10px] text-slate-500 capitalize px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700/50">
                      {item.parentCat}
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <strong className="text-slate-200">
                    {formatCurrency(item.amount, currency, locale)}
                  </strong>
                  <span className="text-[11px] text-slate-500 font-medium w-8 text-right">
                    {pct.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-brand-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(3, pct))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubcategoryBreakdown;
