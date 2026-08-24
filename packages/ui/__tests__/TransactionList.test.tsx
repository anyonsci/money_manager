import React from 'react';
import { render, screen } from '@testing-library/react';
import { TransactionList } from '../src/components/transactions/TransactionList';
import { UnifiedTransaction } from '@money-manager/core';

describe('UI Component - TransactionList', () => {
  const sampleTransactions: UnifiedTransaction[] = [
    {
      id: 'tx-1',
      amount: 100,
      type: 'expense',
      category: 'food',
      account: 'Cash',
    },
    {
      id: 'tx-2',
      amount: 200,
      type: 'expense',
      category: 'travel',
      account: 'Card',
    },
  ];

  it('renders loading state when isLoading is true', () => {
    render(<TransactionList transactions={[]} isLoading={true} />);
    expect(screen.getByText('Loading transactions...')).toBeInTheDocument();
  });

  it('renders default empty message when transaction list is empty', () => {
    render(<TransactionList transactions={[]} />);
    expect(screen.getByText('No transactions found')).toBeInTheDocument();
  });

  it('renders custom empty message when provided', () => {
    render(
      <TransactionList
        transactions={[]}
        emptyMessage="No search results for this month"
      />
    );
    expect(
      screen.getByText('No search results for this month')
    ).toBeInTheDocument();
  });

  it('renders list of TransactionCard components', () => {
    render(
      <TransactionList
        transactions={sampleTransactions}
        currency="USD"
        locale="en-US"
      />
    );

    expect(screen.getByText('food')).toBeInTheDocument();
    expect(screen.getByText('travel')).toBeInTheDocument();
    expect(screen.getByText('-$100.00')).toBeInTheDocument();
    expect(screen.getByText('-$200.00')).toBeInTheDocument();
  });
});
