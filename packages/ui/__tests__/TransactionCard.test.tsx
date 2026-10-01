import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionCard } from '../src/components/transactions/TransactionCard';
import { UnifiedTransaction } from '@money-manager/core';

describe('UI Component - TransactionCard', () => {
  const expenseTx: UnifiedTransaction = {
    id: 'tx-1',
    amount: 150,
    type: 'expense',
    category: 'food',
    subCategory: 'groceries',
    note: 'Supermarket shopping',
    account: 'HDFC Card',
    transactionDate: '2025-01-15',
  };

  const incomeTx: UnifiedTransaction = {
    id: 'tx-2',
    amount: 5000,
    type: 'income',
    category: 'salary',
    account: 'Checking Account',
    transactionDate: '2025-01-31',
  };

  const voidTx: UnifiedTransaction = {
    id: 'tx-3',
    amount: 200,
    type: 'expense',
    category: 'entertainment',
    account: 'Cash',
    status: 'VOID',
    transactionDate: '2025-01-20',
  };

  it('renders expense transaction with 2-line date, category/subcategory title, notes, amount, and account', () => {
    render(
      <TransactionCard
        transaction={expenseTx}
        currency="USD"
        locale="en-US"
      />
    );

    // Left date badge in 2 lines
    const dateBadge = screen.getByTestId('transaction-date-badge');
    expect(dateBadge).toHaveTextContent('15 Jan');
    expect(dateBadge).toHaveTextContent('2025');

    // Middle title & subtitle
    expect(screen.getByText('food')).toBeInTheDocument();
    expect(screen.getByTestId('category-badge-icon')).toHaveTextContent('🍽️');
    expect(screen.getByText('groceries')).toBeInTheDocument();
    expect(screen.getByText('Supermarket shopping')).toBeInTheDocument();

    // Right amount & account
    expect(screen.getByText('-$150.00')).toBeInTheDocument();
    expect(screen.getByText('HDFC Card')).toBeInTheDocument();

    // Verify edit/delete icon buttons are NOT present in the card
    expect(screen.queryByTitle('Edit transaction')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Delete transaction')).not.toBeInTheDocument();
  });

  it('renders income transaction with positive amount styling', () => {
    render(
      <TransactionCard
        transaction={incomeTx}
        currency="USD"
        locale="en-US"
      />
    );

    expect(screen.getByText('salary')).toBeInTheDocument();
    expect(screen.getByTestId('category-badge-icon')).toHaveTextContent('💼');
    expect(screen.getByText('+$5,000.00')).toBeInTheDocument();
    expect(screen.getByText('+$5,000.00').className).toContain('text-emerald-400');
    expect(screen.getByText('Checking Account')).toBeInTheDocument();
  });

  it('renders void status badge and line-through amount', () => {
    render(
      <TransactionCard
        transaction={voidTx}
        currency="USD"
        locale="en-US"
      />
    );

    expect(screen.getByText('Voided')).toBeInTheDocument();
    const amountElem = screen.getByText('-$200.00');
    expect(amountElem.className).toContain('line-through');
  });

  it('triggers onEdit when the whole card is clicked', () => {
    const handleEdit = jest.fn();
    render(
      <TransactionCard
        transaction={expenseTx}
        onEdit={handleEdit}
      />
    );

    const card = screen.getByTestId('transaction-card');
    fireEvent.click(card);
    expect(handleEdit).toHaveBeenCalledWith(expenseTx);
  });

  it('triggers onEdit via Enter keypress on card', () => {
    const handleEdit = jest.fn();
    render(
      <TransactionCard
        transaction={expenseTx}
        onEdit={handleEdit}
      />
    );

    const card = screen.getByTestId('transaction-card');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleEdit).toHaveBeenCalledWith(expenseTx);
  });
});
