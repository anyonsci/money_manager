import React, { useState } from 'react';
import {
  UnifiedTransaction,
  formatCurrency,
  formatDate,
  CATEGORY_COLORS,
} from '@money-manager/core';
import {
  ArrowDownRight,
  ArrowUpRight,
  Edit2,
  Trash2,
  Ban,
  Tag,
  Calendar,
  CreditCard,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Modal } from '../layout/Modal';

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
  onDelete,
  onVoid,
  showActions = true,
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isConfirmingVoid, setIsConfirmingVoid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const isIncome = transaction.type === 'income';
  const isVoid = transaction.status === 'VOID';

  const categoryStyle =
    CATEGORY_COLORS[transaction.category] ||
    CATEGORY_COLORS.Others || {
      bg: 'bg-slate-500/10',
      text: 'text-slate-400',
      border: 'border-slate-500/20',
    };

  const handleExecuteDelete = async () => {
    if (!onDelete) return;
    setIsProcessing(true);
    try {
      await onDelete(transaction);
      setIsConfirmingDelete(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteVoid = async () => {
    if (!onVoid) return;
    setIsProcessing(true);
    try {
      await onVoid(transaction);
      setIsConfirmingVoid(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const dateToDisplay = transaction.transactionDate || transaction.timestamp || '';

  return (
    <>
      <div
        className={`group relative rounded-2xl border transition-all ${
          isVoid
            ? 'border-slate-800/40 bg-slate-950/40 opacity-60'
            : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90'
        } p-4 shadow-sm backdrop-blur`}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Left info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Icon */}
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
                isVoid
                  ? 'border-slate-800 bg-slate-900 text-slate-500'
                  : isIncome
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
              }`}
            >
              {isVoid ? <Ban size={18} /> : isIncome ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
                >
                  <Tag size={10} />
                  {transaction.category}
                </span>

                {transaction.subCategory && (
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                    {transaction.subCategory}
                  </span>
                )}

                {isVoid && (
                  <span className="rounded-full bg-rose-950/80 border border-rose-800/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-400">
                    Voided
                  </span>
                )}
              </div>

              {/* Note / Description */}
              {transaction.note && (
                <p className="mt-1.5 text-sm text-slate-200 line-clamp-2">
                  {transaction.note}
                </p>
              )}

              {/* Meta: Account & Date */}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <CreditCard size={12} className="text-slate-500" />
                  {transaction.account}
                </span>
                <span className="text-slate-700">•</span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} className="text-slate-500" />
                  {formatDate(dateToDisplay)}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Amount & Actions */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span
              className={`text-base sm:text-lg font-bold tracking-tight ${
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

            {showActions && !isVoid && (
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(transaction)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                    title="Edit transaction"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
                {onVoid && (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingVoid(true)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-950/40 hover:text-rose-400 transition"
                    title="Void transaction (Ledger)"
                  >
                    <Ban size={14} />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(true)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-950/40 hover:text-rose-400 transition"
                    title="Delete transaction"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {onDelete && (
        <Modal
          open={isConfirmingDelete}
          onClose={() => !isProcessing && setIsConfirmingDelete(false)}
          title="Delete Transaction"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle size={24} />
              <p className="text-sm font-semibold text-white">
                Are you sure you want to delete this transaction?
              </p>
            </div>
            <p className="text-xs text-slate-400">
              This will permanently remove the record of{' '}
              <strong>{formatCurrency(transaction.amount, currency, locale)}</strong> for{' '}
              <strong>{transaction.category}</strong>.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setIsConfirmingDelete(false)}
                className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExecuteDelete}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500"
              >
                {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Void Confirmation Modal */}
      {onVoid && (
        <Modal
          open={isConfirmingVoid}
          onClose={() => !isProcessing && setIsConfirmingVoid(false)}
          title="Void Transaction"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <Ban size={24} />
              <p className="text-sm font-semibold text-white">
                Void this ledger entry?
              </p>
            </div>
            <p className="text-xs text-slate-400">
              In double-entry accounting, voiding preserves the audit trail while nullifying its balance impact.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setIsConfirmingVoid(false)}
                className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExecuteVoid}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500"
              >
                {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
                Void Entry
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
