import { useEffect, useState } from 'react';
import { TransactionList } from '../components/transactions/TransactionList';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { useTransactions } from '../context/TransactionContext';
import { Transaction, TransactionFormValues } from '../types';

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

  return (
    <div className="space-y-4">
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
