import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  UnifiedTransaction,
  TransactionFormValues,
  PaginationMeta,
} from '@money-manager/core';
import { useWorkspace, DcLedgerStorageAdapter } from '@money-manager/dc-client';
import { useAuth } from './AuthContext';


interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}

interface TransactionContextType {
  transactions: UnifiedTransaction[];
  isLoading: boolean;
  isSubmitting: boolean;
  pagination: PaginationMeta;
  summary: SummaryData;
  fetchTransactions: (page?: number, search?: string) => Promise<void>;
  addTransaction: (formValues: TransactionFormValues) => Promise<void>;
  editTransaction: (id: string, formValues: TransactionFormValues) => Promise<void>;
  voidTransaction: (id: string) => Promise<void>;
  deleteTransactionItem: (tx: UnifiedTransaction) => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeWorkspace } = useWorkspace();
  const { isAuthenticated } = useAuth();

  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1,
  });

  const adapter = useMemo(() => {
    return new DcLedgerStorageAdapter(
      activeWorkspace?.id || '',
      activeWorkspace?.defaultCurrency || 'USD'
    );
  }, [activeWorkspace]);

  const fetchTransactions = useCallback(
    async (page = 1, search = '') => {
      if (!activeWorkspace || !isAuthenticated) return;

      setIsLoading(true);
      try {
        const result = await adapter.fetchTransactions({
          page,
          limit: 50,
          filters: { search },
        });
        setTransactions(result.data);
        setPagination(result.meta);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [activeWorkspace, isAuthenticated, adapter]
  );

  useEffect(() => {
    if (activeWorkspace && isAuthenticated) {
      fetchTransactions(1);
    } else {
      setTransactions([]);
    }
  }, [activeWorkspace, isAuthenticated, fetchTransactions]);

  const addTransaction = async (formValues: TransactionFormValues) => {
    if (!activeWorkspace) throw new Error('No active workspace selected');

    setIsSubmitting(true);
    try {
      const created = await adapter.createTransaction(formValues);
      setTransactions((prev) => [created, ...prev]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const editTransaction = async (id: string, formValues: TransactionFormValues) => {
    if (!activeWorkspace) throw new Error('No active workspace selected');

    setIsSubmitting(true);
    try {
      const updated = await adapter.updateTransaction(id, formValues);
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: 'VOID' } : t))
      );
      setTransactions((prev) => [updated, ...prev]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const voidTransaction = async (id: string) => {
    if (!activeWorkspace) throw new Error('No active workspace selected');

    setIsSubmitting(true);
    try {
      await adapter.deleteTransaction(id);
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: 'VOID' } : t))
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTransactionItem = async (tx: UnifiedTransaction) => {
    await voidTransaction(tx.id);
  };

  const summary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    for (const t of transactions) {
      if (t.status === 'VOID') continue;
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
      }
    }

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
    };
  }, [transactions]);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        isLoading,
        isSubmitting,
        pagination,
        summary,
        fetchTransactions,
        addTransaction,
        editTransaction,
        voidTransaction,
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
