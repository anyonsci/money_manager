import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionsPage } from '../TransactionsPage';
import { UnifiedTransaction } from '@money-manager/core';

let mockTransactionsList: UnifiedTransaction[] = [];
let mockLoading = false;
let mockLoadingMore = false;
let mockHasMore = true;
const mockLoadMoreTransactions = jest.fn();

jest.mock('../../context/TransactionContext', () => ({
  useTransactions: () => ({
    transactions: mockTransactionsList,
    loading: mockLoading,
    loadingMore: mockLoadingMore,
    hasMore: mockHasMore,
    totalCount: 50,
    hasLoadedInitially: true,
    page: 1,
    totalPages: 1,
    loadTransactions: jest.fn(),
    loadMoreTransactions: mockLoadMoreTransactions,
    createTransactionItem: jest.fn(),
    updateTransactionItem: jest.fn(),
    deleteTransactionItem: jest.fn(),
  }),
}));

describe('TransactionsPage Search', () => {
  beforeEach(() => {
    mockTransactionsList = [
      {
        id: 'tx-1',
        amount: 50,
        account: 'Cash',
        category: 'Food',
        subCategory: 'Lunch',
        note: 'Tasty meal',
        type: 'expense',
        status: 'POSTED',
        transactionDate: '2026-08-01',
      },
    ];
  });

  it('renders without error and searches', () => {
    render(<TransactionsPage />);
    const searchInput = screen.getByPlaceholderText('Search transactions...');
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'Tasty' } });
    expect(screen.getByText('Tasty meal')).toBeInTheDocument();
  });

  it('handles transactions with numeric or missing account, note, category', () => {
    mockTransactionsList = [
      {
        id: 'tx-num',
        amount: 100,
        account: 1234 as any,
        category: 'Food',
        subCategory: undefined,
        note: 500 as any,
        type: 'expense',
        status: 'POSTED',
        transactionDate: '2026-08-01',
      },
      {
        id: 'tx-null',
        amount: 200,
        account: undefined as any,
        category: undefined as any,
        subCategory: 42 as any,
        note: undefined,
        type: 'expense',
        status: 'POSTED',
        transactionDate: '2026-08-01',
      }
    ];

    render(<TransactionsPage />);
    const searchInput = screen.getByPlaceholderText('Search transactions...');
    fireEvent.change(searchInput, { target: { value: '1' } });
  });

  it('renders load more button and triggers loadMoreTransactions on click', () => {
    render(<TransactionsPage />);
    const loadMoreBtn = screen.getByRole('button', { name: /load more/i });
    expect(loadMoreBtn).toBeInTheDocument();

    fireEvent.click(loadMoreBtn);
    expect(mockLoadMoreTransactions).toHaveBeenCalled();
  });
});
