import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Transaction, TransactionFormValues } from '../types';
import { createTransaction, deleteTransaction, fetchTransactions, updateTransaction } from '../services/api';
import { useAuth } from './AuthContext';

const DEFAULT_LIMIT = 8;

interface TransactionContextType {
  transactions: Transaction[];
  page: number;
  totalPages: number;
  loading: boolean;
  loadTransactions: (nextPage?: number, forceRefresh?: boolean) => Promise<void>;
  createTransactionItem: (values: TransactionFormValues) => Promise<Transaction | undefined>;
  updateTransactionItem: (selectedTransaction: Transaction, values: TransactionFormValues) => Promise<Transaction | undefined>;
  deleteTransactionItem: (transaction: Transaction) => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

const sortByDateDesc = (list: Transaction[]): Transaction[] => {
  return [...list].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasLoadedInitially, setHasLoadedInitially] = useState(false);
  const { idToken } = useAuth();

  const loadTransactions = useCallback(async (nextPage = 1, forceRefresh = false) => {
    if (!idToken) return;
    setLoading(true);
    try {
      const response = await fetchTransactions(nextPage, DEFAULT_LIMIT);
      if (nextPage === 1 || forceRefresh) {
        setTransactions(sortByDateDesc(response.data || []));
      } else {
        setTransactions((prev) => sortByDateDesc([...prev, ...(response.data || [])]));
      }
      setPage(response.meta?.page ?? nextPage);
      setTotalPages(response.meta?.totalPages ?? 1);
      setHasLoadedInitially(true);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [idToken]);

  useEffect(() => {
    if (idToken && !hasLoadedInitially) {
      loadTransactions(1);
    }
  }, [idToken, hasLoadedInitially, loadTransactions]);

  const createTransactionItem = async (values: TransactionFormValues) => {
    try {
      const created = await createTransaction(values);
      if (created) {
        setTransactions((prev) => sortByDateDesc([created, ...prev]));
      }
      return created;
    } catch (err) {
      console.error('Failed to create transaction:', err);
      return undefined;
    }
  };

  const updateTransactionItem = async (selectedTransaction: Transaction, values: TransactionFormValues) => {
    try {
      const updated = await updateTransaction(selectedTransaction, values);
      if (updated) {
        setTransactions((prev) => sortByDateDesc(prev.map((item) => (item.id === selectedTransaction.id ? updated : item))));
      }
      return updated;
    } catch (err) {
      console.error('Failed to update transaction:', err);
      return undefined;
    }
  };

  const deleteTransactionItem = async (transaction: Transaction) => {
    try {
      await deleteTransaction(transaction.id);
      setTransactions((prev) => prev.filter((item) => item.id !== transaction.id));
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        page,
        totalPages,
        loading,
        loadTransactions,
        createTransactionItem,
        updateTransactionItem,
        deleteTransactionItem
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
