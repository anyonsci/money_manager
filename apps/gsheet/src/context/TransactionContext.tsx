import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { UnifiedTransaction, TransactionFormValues } from '@money-manager/core';
import { gsheetStorageAdapter } from '../adapters/GSheetStorageAdapter';
import { useAuth } from './AuthContext';

const DEFAULT_LIMIT = 200;

interface TransactionContextType {
  transactions: UnifiedTransaction[];
  page: number;
  totalPages: number;
  loading: boolean;
  hasLoadedInitially: boolean;
  loadTransactions: (nextPage?: number, forceRefresh?: boolean) => Promise<void>;
  createTransactionItem: (values: TransactionFormValues) => Promise<UnifiedTransaction | undefined>;
  updateTransactionItem: (selectedTransaction: UnifiedTransaction, values: TransactionFormValues) => Promise<UnifiedTransaction | undefined>;
  deleteTransactionItem: (transaction: UnifiedTransaction) => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { accessToken } = useAuth();
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasLoadedInitially, setHasLoadedInitially] = useState(false);

  const loadTransactions = useCallback(async (nextPage = 1, forceRefresh = false) => {
    if (!accessToken && !forceRefresh) return;
    setLoading(true);
    try {
      const response = await gsheetStorageAdapter.fetchTransactions({
        page: nextPage,
        limit: DEFAULT_LIMIT
      });
      setTransactions(response.data);
      setPage(response.meta.page);
      setTotalPages(response.meta.totalPages);
      setHasLoadedInitially(true);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken && !hasLoadedInitially) {
      loadTransactions(1);
    }
  }, [accessToken, hasLoadedInitially, loadTransactions]);

  const createTransactionItem = async (values: TransactionFormValues): Promise<UnifiedTransaction | undefined> => {
    try {
      const created = await gsheetStorageAdapter.createTransaction(values);
      setTransactions((prev) => [created, ...prev]);
      return created;
    } catch (error) {
      console.error('Failed to create transaction:', error);
      throw error;
    }
  };

  const updateTransactionItem = async (
    selectedTransaction: UnifiedTransaction,
    values: TransactionFormValues
  ): Promise<UnifiedTransaction | undefined> => {
    try {
      const updated = await gsheetStorageAdapter.updateTransaction(
        selectedTransaction.id,
        values,
        selectedTransaction
      );
      setTransactions((prev) =>
        prev.map((item) => (item.id === selectedTransaction.id ? updated : item))
      );
      return updated;
    } catch (error) {
      console.error('Failed to update transaction:', error);
      throw error;
    }
  };

  const deleteTransactionItem = async (transaction: UnifiedTransaction) => {
    try {
      await gsheetStorageAdapter.deleteTransaction(transaction.id);
      setTransactions((prev) => prev.filter((item) => item.id !== transaction.id));
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      throw error;
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        page,
        totalPages,
        loading,
        hasLoadedInitially,
        loadTransactions,
        createTransactionItem,
        updateTransactionItem,
        deleteTransactionItem,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
