import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { TransactionProvider, useTransactions } from '../TransactionContext';
import { gsheetStorageAdapter } from '../../adapters/GSheetStorageAdapter';

jest.mock('../../adapters/GSheetStorageAdapter', () => ({
  gsheetStorageAdapter: {
    fetchTransactions: jest.fn().mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 200, total: 0, totalPages: 1 },
    }),
  },
}));

jest.mock('../AuthContext', () => ({
  useAuth: () => ({
    accessToken: 'test-mock-token',
  }),
}));

const TestConsumer: React.FC = () => {
  const { transactions, loading } = useTransactions();
  return (
    <div>
      <div data-testid="tx-count">{transactions.length}</div>
      <div data-testid="loading">{loading ? 'loading' : 'idle'}</div>
    </div>
  );
};

describe('gsheet TransactionContext Deferral', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('does not fetch transactions on initial home page load', async () => {
    window.location.hash = '#/';

    render(
      <TransactionProvider>
        <TestConsumer />
      </TransactionProvider>
    );

    // Give microtasks time to execute
    await new Promise((r) => setTimeout(r, 50));

    expect(gsheetStorageAdapter.fetchTransactions).not.toHaveBeenCalled();
  });

  test('fetches transactions on non-home route load', async () => {
    window.location.hash = '#/transactions';

    render(
      <TransactionProvider>
        <TestConsumer />
      </TransactionProvider>
    );

    await waitFor(() => {
      expect(gsheetStorageAdapter.fetchTransactions).toHaveBeenCalledWith({
        page: 1,
        limit: 200,
      });
    });
  });
});
