import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  FormattedTransaction,
  TransactionFormValues,
  PaginationMeta,
} from '../types/index.js';
import { api } from '../services/api.js';
import { LedgerTranspilerService } from '../services/ledger-transpiler.service.js';
import { useWorkspace } from './WorkspaceContext.js';
import { useAuth } from './AuthContext.js';

interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}

interface TransactionContextType {
  transactions: FormattedTransaction[];
  isLoading: boolean;
  isSubmitting: boolean;
  pagination: PaginationMeta;
  summary: SummaryData;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  startDate: string;
  setStartDate: (d: string) => void;
  endDate: string;
  setEndDate: (d: string) => void;
  setPage: (page: number) => void;
  addTransaction: (values: TransactionFormValues) => Promise<void>;
  editTransaction: (id: string, values: TransactionFormValues) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { activeWorkspace } = useWorkspace();

  const [transactions, setTransactions] = useState<FormattedTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [summary, setSummary] = useState<SummaryData>({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
  });

  const fetchTransactions = useCallback(async () => {
    if (!isAuthenticated || !activeWorkspace) {
      setTransactions([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.transactions.list(activeWorkspace.id, {
        page,
        limit: 20,
        search: searchQuery || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status: 'POSTED',
      });

      if (res.success && res.data) {
        const formatted = res.data.map(LedgerTranspilerService.formatTransaction);

        // Client category filter if chosen
        const filtered =
          selectedCategory && selectedCategory !== 'All'
            ? formatted.filter(
                (t) => t.category.toLowerCase() === selectedCategory.toLowerCase()
              )
            : formatted;

        setTransactions(filtered);
        if (res.meta) {
          setPagination(res.meta);
        }

        // Compute summary from current set
        let income = 0;
        let expense = 0;
        for (const t of formatted) {
          if (t.type === 'income') income += t.amount;
          else expense += t.amount;
        }

        setSummary({
          totalIncome: income,
          totalExpense: expense,
          netBalance: income - expense,
        });
      }
    } catch (err) {
      console.warn('Failed to load transactions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, activeWorkspace, page, searchQuery, selectedCategory, startDate, endDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (values: TransactionFormValues) => {
    if (!activeWorkspace) throw new Error('No active workspace selected');
    setIsSubmitting(true);
    try {
      await LedgerTranspilerService.postTranspiledTransaction(
        activeWorkspace.id,
        values,
        activeWorkspace.defaultCurrency || 'USD'
      );
      await fetchTransactions();
    } finally {
      setIsSubmitting(false);
    }
  };

  const editTransaction = async (id: string, values: TransactionFormValues) => {
    if (!activeWorkspace) throw new Error('No active workspace selected');
    setIsSubmitting(true);
    try {
      await LedgerTranspilerService.editTransaction(
        activeWorkspace.id,
        id,
        values,
        activeWorkspace.defaultCurrency || 'USD'
      );
      await fetchTransactions();
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!activeWorkspace) throw new Error('No active workspace selected');
    setIsSubmitting(true);
    try {
      await api.transactions.void(activeWorkspace.id, id);
      await fetchTransactions();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        isLoading,
        isSubmitting,
        pagination,
        summary,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        setPage,
        addTransaction,
        editTransaction,
        deleteTransaction,
        refreshTransactions: fetchTransactions,
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
