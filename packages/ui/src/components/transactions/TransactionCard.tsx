import React from 'react';
import {
  UnifiedTransaction,
  formatCurrency,
  formatTransactionDateParts,
  getCategoryColor,
  getCategoryIcon,
} from '@money-manager/core';
import { CreditCard } from 'lucide-react';

export interface TransactionCardProps {
  transaction: UnifiedTransaction;
  currency?: string;
  locale?: string;
  onEdit?: (tx: UnifiedTransaction) => void;
  onDelete?: (tx: UnifiedTransaction) => Promise<void> | void;
  onVoid?: (tx: UnifiedTransaction) => Promise<void> | void;
  showActions?: boolean;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  currency = 'INR',
  locale = 'en-IN',
  onEdit,
}) => {
  const isIncome = transaction.type === 'income';
  const isVoid = transaction.status === 'VOID';

  const categoryStyle = getCategoryColor(transaction.category);
  const categoryIcon = getCategoryIcon(transaction.category);

  const dateToDisplay = transaction.transactionDate || transaction.timestamp || '';
  const dateParts = formatTransactionDateParts(dateToDisplay);

  const handleCardClick = () => {
    if (onEdit) {
      onEdit(transaction);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div
      role={onEdit ? 'button' : undefined}
      tabIndex={onEdit ? 0 : undefined}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className={`group relative rounded-2xl border transition-all ${
        onEdit ? 'cursor-pointer active:scale-[0.99]' : ''
      } ${
        isVoid
          ? 'border-slate-800/40 bg-slate-950/40 opacity-60'
          : 'border-slate-800/80 bg-slate-900/60 hover:border-brand-500/50 hover:bg-slate-900/90 hover:shadow-md'
      } p-3.5 sm:p-4 shadow-sm backdrop-blur`}
      data-testid="transaction-card"
    >
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Date in 2 lines */}
        <div
          className="flex flex-col items-center justify-center shrink-0 w-12 sm:w-14 text-center select-none"
          data-testid="transaction-date-badge"
        >
          <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight">
            {dateParts.dayMonth}
          </span>
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 leading-tight mt-0.5">
            {dateParts.year}
          </span>
        </div>

        {/* Middle: Category & Subcategory as Title, Notes as Subtitle */}
        <div className="flex-1 min-w-0">
          {/* Top Title: Category & Subcategory */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
            >
              <span className="text-[12px] leading-none" data-testid="category-badge-icon">
                {categoryIcon}
              </span>
              <span>{transaction.category}</span>
            </span>

            {transaction.subCategory && (
              <span className="rounded-full bg-slate-800/90 border border-slate-700/60 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                {transaction.subCategory}
              </span>
            )}

            {isVoid && (
              <span className="rounded-full bg-rose-950/80 border border-rose-800/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-400">
                Voided
              </span>
            )}
          </div>

          {/* Subtitle: Notes */}
          {transaction.note ? (
            <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-snug">
              {transaction.note}
            </p>
          ) : null}
        </div>

        {/* Right: Amount on top, Account below it */}
        <div className="flex flex-col items-end shrink-0 gap-1 text-right">
          <span
            className={`text-base sm:text-lg font-bold tracking-tight leading-tight ${
              isVoid
                ? 'text-slate-500 line-through'
                : isIncome
                ? 'text-emerald-400'
                : 'text-rose-400'
            }`}
          >
            {isIncome ? '+' : '-'}
            {formatCurrency(transaction.amount, currency, locale)}
          </span>

          {transaction.account && (
            <span className="flex items-center gap-1 text-xs font-medium text-slate-400 leading-tight">
              <CreditCard size={11} className="text-slate-500 shrink-0" />
              <span className="truncate max-w-[100px] sm:max-w-[140px]">
                {transaction.account}
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
