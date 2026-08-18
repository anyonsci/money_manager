import React, { useState } from 'react';
import type { FormattedTransaction } from '../../types/index.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { CATEGORY_COLORS } from '../../constants/categories.js';
import { useWorkspace } from '../../context/WorkspaceContext.js';
import { useTransactions } from '../../context/TransactionContext.js';
import {
  MoreVertical,
  Edit2,
  Trash2,
  Tag,
  CreditCard,
  Calendar,
} from 'lucide-react';

interface TransactionCardProps {
  transaction: FormattedTransaction;
  onEdit: (tx: FormattedTransaction) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onEdit }) => {
  const { activeWorkspace } = useWorkspace();
  const { deleteTransaction, isSubmitting } = useTransactions();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const colors = CATEGORY_COLORS[transaction.category] || CATEGORY_COLORS.Others;
  const isIncome = transaction.type === 'income';

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to void this transaction?')) {
      await deleteTransaction(transaction.id);
    }
  };

  return (
    <div className="relative flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 transition hover:bg-slate-900 hover:border-slate-700/80">
      {/* Left Details */}
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Category Avatar Badge */}
        <div
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border ${colors.bg} ${colors.text} ${colors.border} font-bold text-sm`}
        >
          {transaction.category.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-white truncate">
              {transaction.category}
            </span>
            {transaction.subCategory && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300 border border-slate-700">
                <Tag size={10} className="text-brand-400" />
                {transaction.subCategory}
              </span>
            )}
          </div>

          {transaction.note && (
            <p className="text-xs text-slate-400 line-clamp-1">{transaction.note}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {formatDate(transaction.transactionDate)}
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <CreditCard size={11} />
              {transaction.account}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Amount & Actions */}
      <div className="flex items-center gap-3 pl-3">
        <div className="text-right">
          <span
            className={`text-sm sm:text-base font-bold ${
              isIncome ? 'text-emerald-400' : 'text-slate-100'
            }`}
          >
            {isIncome ? '+' : '-'}
            {formatCurrency(transaction.amount, activeWorkspace?.defaultCurrency || 'USD')}
          </span>
          <p className="text-[10px] text-slate-500 font-mono capitalize">
            {transaction.type}
          </p>
        </div>

        {/* Action Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-white transition"
          >
            <MoreVertical size={16} />
          </button>

          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-40 w-32 rounded-xl border border-slate-800 bg-slate-900 p-1.5 shadow-xl animate-in fade-in">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onEdit(transaction);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
                >
                  <Edit2 size={13} />
                  Edit
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleDelete();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition"
                >
                  <Trash2 size={13} />
                  Void
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
