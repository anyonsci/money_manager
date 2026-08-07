import { ApiResponse, Transaction, TransactionFormValues } from '../types';
import { apiClient, getApiUrl } from './apiClient';

const DEFAULT_LIMIT = 8;

const mockTransactions: Transaction[] = [
  {
    id: 'tx-001',
    timestamp: '2026-08-01T09:30:00.000Z',
    amount: 24.5,
    account: 'Checking',
    category: 'need',
    subCategory: 'Supermarket',
    note: 'Weekly need',
    type: 'expense',
    createdAt: '2026-08-01T09:30:00.000Z',
    updatedAt: '2026-08-01T09:30:00.000Z',
    createdBy: 'family@example.com',
    updatedBy: 'family@example.com'
  },
  {
    id: 'tx-002',
    timestamp: '2026-07-30T14:15:00.000Z',
    amount: 3200,
    account: 'Checking',
    category: 'Salary',
    subCategory: 'Payroll',
    note: 'Monthly salary',
    type: 'income',
    createdAt: '2026-07-30T14:15:00.000Z',
    updatedAt: '2026-07-30T14:15:00.000Z',
    createdBy: 'parent@example.com',
    updatedBy: 'parent@example.com'
  },
  {
    id: 'tx-003',
    timestamp: '2026-07-29T18:20:00.000Z',
    amount: 42.0,
    account: 'Checking',
    category: 'Dining',
    subCategory: 'Dinner',
    note: 'Dinner out',
    type: 'expense',
    createdAt: '2026-07-29T18:20:00.000Z',
    updatedAt: '2026-07-29T18:20:00.000Z',
    createdBy: 'family@example.com',
    updatedBy: 'family@example.com'
  },
  {
    id: 'tx-004',
    timestamp: '2026-07-28T07:45:00.000Z',
    amount: 89.0,
    account: 'Savings',
    category: 'Transport',
    subCategory: 'Fuel',
    note: 'Gas refill',
    type: 'expense',
    createdAt: '2026-07-28T07:45:00.000Z',
    updatedAt: '2026-07-28T07:45:00.000Z',
    createdBy: 'parent@example.com',
    updatedBy: 'parent@example.com'
  },
  {
    id: 'tx-005',
    timestamp: '2026-07-25T12:00:00.000Z',
    amount: 1500,
    account: 'Checking',
    category: 'Freelance',
    subCategory: 'Design',
    note: 'Project payment',
    type: 'income',
    createdAt: '2026-07-25T12:00:00.000Z',
    updatedAt: '2026-07-25T12:00:00.000Z',
    createdBy: 'family@example.com',
    updatedBy: 'family@example.com'
  },
  {
    id: 'tx-006',
    timestamp: '2026-07-20T16:30:00.000Z',
    amount: 63.2,
    account: 'Checking',
    category: 'Utilities',
    subCategory: 'Electricity',
    note: 'Power bill',
    type: 'expense',
    createdAt: '2026-07-20T16:30:00.000Z',
    updatedAt: '2026-07-20T16:30:00.000Z',
    createdBy: 'parent@example.com',
    updatedBy: 'parent@example.com'
  }
];

const buildMockResponse = (page: number, limit: number): ApiResponse<Transaction> => {
  const start = (page - 1) * limit;
  const end = start + limit;
  const pageItems = mockTransactions.slice(start, end);
  const totalRows = mockTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / limit));

  return {
    success: true,
    data: pageItems,
    meta: {
      page,
      limit,
      totalRows,
      totalPages
    }
  };
};

const formatIsoTimestamp = (dateString?: string, fallback?: string) => {
  if (!dateString) return fallback || new Date().toISOString();
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return `${dateString}T12:00:00.000Z`;
  }
  try {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? (fallback || new Date().toISOString()) : d.toISOString();
  } catch {
    return fallback || new Date().toISOString();
  }
};

export const fetchTransactions = async (page = 1, limit = DEFAULT_LIMIT): Promise<ApiResponse<Transaction>> => {
  const apiUrl = getApiUrl();
  if (!apiUrl) {
    return buildMockResponse(page, limit);
  }

  const response = await apiClient.post(apiUrl, JSON.stringify({
    action: 'read',
    page,
    limit
  }));

  return response.data as ApiResponse<Transaction>;
};

export const createTransaction = async (values: TransactionFormValues): Promise<Transaction> => {
  const apiUrl = getApiUrl();
  const timestamp = formatIsoTimestamp(values.date);

  if (!apiUrl) {
    const created: Transaction = {
      id: `tx-${Date.now()}`,
      timestamp,
      amount: Number(values.amount),
      account: values.account,
      category: values.category,
      subCategory: values.subCategory,
      note: values.note,
      type: values.type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'demo@example.com',
      updatedBy: 'demo@example.com'
    };
    mockTransactions.unshift(created);
    return created;
  }

  const response = await apiClient.post(apiUrl, JSON.stringify({
    action: 'create',
    timestamp,
    date: values.date,
    type: values.type,
    amount: Number(values.amount),
    account: values.account,
    category: values.category,
    subCategory: values.subCategory,
    note: values.note
  }));

  return response.data.data as Transaction;
};

export const updateTransaction = async (transaction: Transaction, values: TransactionFormValues): Promise<Transaction> => {
  const apiUrl = getApiUrl();
  const timestamp = formatIsoTimestamp(values.date, transaction.timestamp);

  if (!apiUrl) {
    const updated = {
      ...transaction,
      ...values,
      amount: Number(values.amount),
      timestamp,
      updatedAt: new Date().toISOString()
    } as Transaction;
    const index = mockTransactions.findIndex((item) => item.id === transaction.id);
    if (index >= 0) {
      mockTransactions[index] = updated;
    }
    return updated;
  }

  const response = await apiClient.post(apiUrl, JSON.stringify({
    action: 'update',
    id: transaction.id,
    timestamp,
    date: values.date,
    type: values.type,
    amount: Number(values.amount),
    account: values.account,
    category: values.category,
    subCategory: values.subCategory,
    note: values.note
  }));

  return response.data.data as Transaction;
};

export const deleteTransaction = async (transactionId: string): Promise<{ deletedId: string }> => {
  const apiUrl = getApiUrl();

  if (!apiUrl) {
    const index = mockTransactions.findIndex((item) => item.id === transactionId);
    if (index >= 0) {
      mockTransactions.splice(index, 1);
    }
    return { deletedId: transactionId };
  }

  const response = await apiClient.post(apiUrl, JSON.stringify({
    action: 'delete',
    id: transactionId
  }));

  return response.data.data as { deletedId: string };
};
