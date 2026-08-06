import { useEffect, useMemo, useState } from 'react';
import { TransactionList } from '../components/transactions/TransactionList';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { useTransactions } from '../context/TransactionContext';
import { Transaction, TransactionFormValues } from '../types';
import { formatCurrency } from '../utils/formatters';

export const TransactionsPage = () => {
  const {
    transactions,
    page,
    totalPages,
    loading,
    hasLoadedInitially,
    loadTransactions,
    createTransactionItem,
    updateTransactionItem,
    deleteTransactionItem
  } = useTransactions();

  useEffect(() => {
    if (!hasLoadedInitially && !loading) {
      loadTransactions(1);
    }
  }, [hasLoadedInitially, loading, loadTransactions]);

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>();

  const handleCreate = () => {
    setMode('create');
    setSelectedTransaction(undefined);
    setModalOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setMode('edit');
    setSelectedTransaction(transaction);
    setModalOpen(true);
  };

  const handleSubmit = async (values: TransactionFormValues) => {
    if (mode === 'create') {
      await createTransactionItem(values);
    } else if (selectedTransaction) {
      await updateTransactionItem(selectedTransaction, values);
    }
  };

  const handleDelete = async (transaction: Transaction) => {
    await deleteTransactionItem(transaction);
  };

  const summary = useMemo(() => {
    const expenseTotal = transactions.reduce((sum, item) => sum + (item.type === 'expense' ? item.amount : 0), 0);
    const incomeTotal = transactions.reduce((sum, item) => sum + (item.type === 'income' ? item.amount : 0), 0);
    const balance = incomeTotal - expenseTotal;
    return { expenseTotal, incomeTotal, balance };
  }, [transactions]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-soft">
          <p className="text-sm text-slate-400">Balance</p>
          <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(summary.balance)}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-soft">
          <p className="text-sm text-slate-400">Income</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-300">{formatCurrency(summary.incomeTotal)}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-soft">
          <p className="text-sm text-slate-400">Expenses</p>
          <p className="mt-2 text-2xl font-semibold text-rose-300">{formatCurrency(summary.expenseTotal)}</p>
        </div>
      </div>

      <TransactionList
        transactions={transactions}
        page={page}
        totalPages={totalPages}
        loading={loading}
        onRefresh={() => loadTransactions(1, true)}
        onLoadMore={() => loadTransactions(page + 1)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
      />

      <TransactionModal
        open={modalOpen}
        mode={mode}
        transaction={selectedTransaction}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default TransactionsPage;
