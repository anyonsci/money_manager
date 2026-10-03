import React, { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from 'react';
import { UnifiedTransaction, TransactionFormValues } from '@money-manager/core';
import { gsheetStorageAdapter } from '../adapters/GSheetStorageAdapter';
import { useAuth } from './AuthContext';

const INITIAL_LIMIT = 10;
const SUBSEQUENT_LIMIT = 200;

interface TransactionContextType {
  transactions: UnifiedTransaction[];
  page: number;
  totalPages: number;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  hasLoadedInitially: boolean;
  totalCount?: number;
  loadTransactions: (nextPage?: number, forceRefresh?: boolean) => Promise<void>;
  loadMoreTransactions: () => Promise<void>;
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [hasLoadedInitially, setHasLoadedInitially] = useState(false);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);
  const isFetchingRef = useRef(false);
  const isFetchingMoreRef = useRef(false);

  const loadTransactions = useCallback(async (nextPage = 1, forceRefresh = false) => {
    if (!accessToken && !forceRefresh) return;
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    try {
      const response = await gsheetStorageAdapter.fetchTransactions({
        page: nextPage,
        limit: INITIAL_LIMIT,
        offset: 0,
      });
      setTransactions(response.data);
      setPage(response.meta.page);
      setTotalPages(response.meta.totalPages);
      const total = response.meta.totalRows ?? response.meta.total;
      setTotalCount(total);
      setHasMore(response.data.length === INITIAL_LIMIT && (total !== undefined ? response.data.length < total : true));
      setHasLoadedInitially(true);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [accessToken]);

  const loadMoreTransactions = useCallback(async () => {
    if (!accessToken || isFetchingMoreRef.current || loadingMore || loading || !hasMore) return;
    isFetchingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const currentOffset = transactions.length;
      const nextPage = Math.floor(currentOffset / SUBSEQUENT_LIMIT) + 1;
      const response = await gsheetStorageAdapter.fetchTransactions({
        page: nextPage,
        limit: SUBSEQUENT_LIMIT,
        offset: currentOffset,
      });

      const newItems = response.data;
      setTransactions((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const deduped = newItems.filter((t) => !existingIds.has(t.id));
        return [...prev, ...deduped];
      });

      const total = response.meta.totalRows ?? response.meta.total ?? totalCount;
      if (total !== undefined) {
        setTotalCount(total);
      }
      const updatedCount = currentOffset + newItems.length;
      const moreAvailable = newItems.length === SUBSEQUENT_LIMIT && (total !== undefined ? updatedCount < total : true);
      setHasMore(moreAvailable);
    } catch (error) {
      console.error('Failed to load more transactions:', error);
    } finally {
      setLoadingMore(false);
      isFetchingMoreRef.current = false;
    }
  }, [accessToken, loadingMore, loading, hasMore, transactions.length, totalCount]);

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
        loadingMore,
        hasMore,
        totalCount,
        hasLoadedInitially,
        loadTransactions,
        loadMoreTransactions,
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
