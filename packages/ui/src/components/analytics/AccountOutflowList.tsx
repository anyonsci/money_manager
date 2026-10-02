import React, { useMemo } from 'react';
import { UnifiedTransaction, formatCurrency } from '@money-manager/core';
import { CreditCard, Landmark, Banknote, Smartphone, Wallet } from 'lucide-react';

export interface AccountOutflowListProps {
  transactions: UnifiedTransaction[];
  currency?: string;
  locale?: string;
  title?: string;
}

const getAccountIcon = (accountName: string) => {
  const norm = accountName.toLowerCase();
  if (norm.includes('card') || norm.includes('credit') || norm.includes('debit')) {
    return <CreditCard size={16} className="text-amber-400" />;
  }
  if (norm.includes('cash')) {
    return <Banknote size={16} className="text-emerald-400" />;
  }
  if (norm.includes('upi') || norm.includes('pay') || norm.includes('phone') || norm.includes('gpay')) {
    return <Smartphone size={16} className="text-cyan-400" />;
  }
  if (norm.includes('bank') || norm.includes('checking') || norm.includes('savings')) {
    return <Landmark size={16} className="text-blue-400" />;
  }
  return <Wallet size={16} className="text-brand-400" />;
};

export const AccountOutflowList: React.FC<AccountOutflowListProps> = ({
  transactions,
  currency = 'INR',
  locale = 'en-IN',
  title = 'Payment Mode & Outflow Distribution',
}) => {
  const { accountData, totalExpense } = useMemo(() => {
    const map = new Map<string, number>();
    let total = 0;

    for (const t of transactions) {
      if (t.status === 'VOID') continue;
      if (t.type !== 'expense') continue;

      const amt = Number(t.amount) || 0;
      if (amt <= 0) continue;

      const acc = t.account ? t.account.trim() : 'Other Account';
      map.set(acc, (map.get(acc) || 0) + amt);
      total += amt;
    }

    const list = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }));

    return { accountData: list, totalExpense: total };
  }, [transactions]);

  if (accountData.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-400 backdrop-blur shadow-lg">
        <CreditCard className="mb-2 h-8 w-8 text-slate-600" />
        <p className="text-sm font-medium">No account outflow data</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">Where your money flows out from</p>
        </div>
        <span className="text-xs text-slate-400">
          Total: <strong className="text-slate-200">{formatCurrency(totalExpense, currency, locale)}</strong>
        </span>
      </div>

      <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
        {accountData.map((item) => (
          <div key={item.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium text-slate-200 truncate">
                <span className="p-1 rounded-lg bg-slate-800 border border-slate-700/60">
                  {getAccountIcon(item.name)}
                </span>
                <span className="truncate">{item.name}</span>
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <strong className="text-slate-200">{formatCurrency(item.amount, currency, locale)}</strong>
                <span className="text-[11px] text-slate-500 font-medium w-9 text-right">
                  {item.percentage.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(3, item.percentage))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountOutflowList;
