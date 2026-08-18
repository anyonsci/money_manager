import { useEffect, useState, type FormEvent } from 'react';
import { Transaction, TransactionFormValues } from '../../types';
import { Modal } from '../layout/Modal';
import { ALLOWED_CATEGORIES } from '../../constants/categories';

interface TransactionModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  transaction?: Transaction;
  onClose: () => void;
  onSubmit: (values: TransactionFormValues) => Promise<void>;
  onDelete?: (transaction: Transaction) => Promise<void>;
}

const defaultValues: TransactionFormValues = {
  amount: '',
  account: 'Checking',
  category: ALLOWED_CATEGORIES[0],
  subCategory: '',
  note: '',
  type: 'expense',
  date: new Date().toISOString().slice(0, 10)
};

export const TransactionModal = ({ open, mode, transaction, onClose, onSubmit, onDelete }: TransactionModalProps) => {
  const [values, setValues] = useState<TransactionFormValues>(defaultValues);
  const [submitting, setSubmitting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (transaction) {
      let formattedDate = new Date().toISOString().slice(0, 10);
      if (transaction.timestamp) {
        try {
          const d = new Date(transaction.timestamp);
          if (!isNaN(d.getTime())) {
            formattedDate = d.toISOString().slice(0, 10);
          }
        } catch {
          formattedDate = transaction.timestamp.slice(0, 10);
        }
      }
      setValues({
        amount: String(transaction.amount),
        account: transaction.account,
        category: transaction.category,
        subCategory: transaction.subCategory,
        note: transaction.note,
        type: transaction.type,
        date: formattedDate
      });
    } else {
      setValues(defaultValues);
    }
  }, [transaction, open]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(values);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!transaction || !onDelete) return;
    setSubmitting(true);
    try {
      await onDelete(transaction);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={mode === 'create' ? 'Add transaction' : 'Edit transaction'}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm text-slate-300">
            <span className="mb-1 block">Amount</span>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={values.amount}
              onChange={(event) => setValues((prev) => ({ ...prev, amount: event.target.value }))}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-white outline-none ring-0"
            />
          </label>
          <label className="block text-sm text-slate-300">
            <span className="mb-1 block">Account</span>
            <input
              required
              value={values.account}
              onChange={(event) => setValues((prev) => ({ ...prev, account: event.target.value }))}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-white outline-none ring-0"
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="block text-sm text-slate-300">
            <label htmlFor="modal-category-input" className="mb-1 block">Category</label>
            <div className="relative flex items-center">
              <input
                id="modal-category-input"
                required
                type="text"
                list="modal-preset-categories"
                value={values.category}
                onChange={(event) => setValues((prev) => ({ ...prev, category: event.target.value }))}
                placeholder="Enter or select category"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 pl-3 pr-24 py-2 text-white outline-none ring-0 focus:border-brand-500"
              />
              <select
                value=""
                onChange={(event) => {
                  if (event.target.value) {
                    setValues((prev) => ({ ...prev, category: event.target.value }));
                  }
                }}
                className="absolute right-1.5 rounded-xl border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-300 outline-none hover:bg-slate-800 hover:text-white cursor-pointer transition"
                title="Select pre-decided category"
              >
                <option value="" disabled>Presets ▼</option>
                {ALLOWED_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
              <datalist id="modal-preset-categories">
                {ALLOWED_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {ALLOWED_CATEGORIES.slice(0, 6).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setValues((prev) => ({ ...prev, category: cat }))}
                  className={`rounded-lg border px-2 py-0.5 text-xs transition ${
                    values.category.toLowerCase() === cat.toLowerCase()
                      ? 'border-brand-500 bg-brand-600/20 text-brand-300 font-medium'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <label className="block text-sm text-slate-300">
            <span className="mb-1 block">Type</span>
            <select
              value={values.type}
              onChange={(event) => setValues((prev) => ({ ...prev, type: event.target.value as Transaction['type'] }))}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-white outline-none ring-0"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>
        </div>

        <label className="block text-sm text-slate-300">
          <span className="mb-1 block">Description</span>
          <input
            value={values.note}
            onChange={(event) => setValues((prev) => ({ ...prev, note: event.target.value }))}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-white outline-none ring-0"
            placeholder="Weekly need"
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm text-slate-300">
            <span className="mb-1 block">Subcategory</span>
            <input
              value={values.subCategory}
              onChange={(event) => setValues((prev) => ({ ...prev, subCategory: event.target.value }))}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-white outline-none ring-0"
            />
          </label>
          <label className="block text-sm text-slate-300">
            <span className="mb-1 block">Date</span>
            <input
              type="date"
              value={values.date}
              onChange={(event) => setValues((prev) => ({ ...prev, date: event.target.value }))}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-white outline-none ring-0"
            />
          </label>
        </div>

        <div className="flex flex-col gap-2 pt-2 md:flex-row">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-2xl bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
          >
            {submitting ? 'Saving...' : mode === 'create' ? 'Create transaction' : 'Update transaction'}
          </button>
          {mode === 'edit' && onDelete && (
            <button
              type="button"
              onClick={() => setConfirmingDelete((prev) => !prev)}
              className="rounded-2xl border border-rose-500/30 px-4 py-3 font-semibold text-rose-300 transition hover:bg-rose-500/10"
            >
              {confirmingDelete ? 'Cancel delete' : 'Delete'}
            </button>
          )}
        </div>

        {mode === 'edit' && transaction && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Created by: <strong className="text-slate-300">{transaction.createdBy || 'N/A'}</strong></span>
              <span>{transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : ''}</span>
            </div>
            <div className="flex justify-between">
              <span>Updated by: <strong className="text-slate-300">{transaction.updatedBy || 'N/A'}</strong></span>
              <span>{transaction.updatedAt ? new Date(transaction.updatedAt).toLocaleString() : ''}</span>
            </div>
          </div>
        )}

        {mode === 'edit' && confirmingDelete && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
            <p className="mb-2">Delete this transaction permanently?</p>
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              className="rounded-full bg-rose-500 px-3 py-2 font-medium text-white"
            >
              Confirm delete
            </button>
          </div>
        )}
      </form>
    </Modal>
  );
};
