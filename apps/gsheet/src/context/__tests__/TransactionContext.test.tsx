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

describe('gsheet TransactionContext Page-Managed Data Loading', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('does not fetch transactions automatically on provider mount (pages manage their own data)', async () => {
    window.location.hash = '#/transactions';

    render(
      <TransactionProvider>
        <TestConsumer />
      </TransactionProvider>
    );

    // Give microtasks time to execute
    await new Promise((r) => setTimeout(r, 50));

    expect(gsheetStorageAdapter.fetchTransactions).not.toHaveBeenCalled();
  });

  test('fetches initial 10 transactions when page explicitly invokes loadTransactions', async () => {
    const ExplicitCaller: React.FC = () => {
      const { loadTransactions, transactions } = useTransactions();
      React.useEffect(() => {
        loadTransactions(1);
      }, [loadTransactions]);
      return <div data-testid="tx-count">{transactions.length}</div>;
    };

    render(
      <TransactionProvider>
        <ExplicitCaller />
      </TransactionProvider>
    );

    await waitFor(() => {
      expect(gsheetStorageAdapter.fetchTransactions).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        offset: 0,
      });
    });
  });

  test('deduplicates concurrent loadTransactions calls with isFetchingRef', async () => {
    const ConcurrentCaller: React.FC = () => {
      const { loadTransactions } = useTransactions();
      React.useEffect(() => {
        loadTransactions(1);
        loadTransactions(1);
      }, [loadTransactions]);
      return <div>Concurrent</div>;
    };

    render(
      <TransactionProvider>
        <ConcurrentCaller />
      </TransactionProvider>
    );

    await waitFor(() => {
      expect(gsheetStorageAdapter.fetchTransactions).toHaveBeenCalledTimes(1);
    });
  });

  test('deduplicates concurrent loadMoreTransactions calls with isFetchingMoreRef', async () => {
    (gsheetStorageAdapter.fetchTransactions as jest.Mock)
      .mockResolvedValueOnce({
        data: Array.from({ length: 10 }, (_, i) => ({ id: `tx-${i}` })),
        meta: { page: 1, limit: 10, total: 50, totalRows: 50, totalPages: 5 },
      })
      .mockResolvedValueOnce({
        data: Array.from({ length: 20 }, (_, i) => ({ id: `tx-more-${i}` })),
        meta: { page: 1, limit: 200, total: 50, totalRows: 50, totalPages: 1 },
      });

    const ConcurrentMoreCaller: React.FC = () => {
      const { loadTransactions, loadMoreTransactions, hasLoadedInitially } = useTransactions();
      React.useEffect(() => {
        loadTransactions(1);
      }, [loadTransactions]);

      React.useEffect(() => {
        if (hasLoadedInitially) {
          loadMoreTransactions();
          loadMoreTransactions();
        }
      }, [hasLoadedInitially, loadMoreTransactions]);

      return <div>ConcurrentMore</div>;
    };

    render(
      <TransactionProvider>
        <ConcurrentMoreCaller />
      </TransactionProvider>
    );

    // Initial 1 call + only 1 loadMore call (not 2)
    await waitFor(() => {
      expect(gsheetStorageAdapter.fetchTransactions).toHaveBeenCalledTimes(2);
    });

    expect(gsheetStorageAdapter.fetchTransactions).toHaveBeenLastCalledWith({
      page: 1,
      limit: 200,
      offset: 10,
    });
  });
});
