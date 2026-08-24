import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
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

  it('renders expense transaction details correctly', () => {
    render(
      <TransactionCard
        transaction={expenseTx}
        currency="USD"
        locale="en-US"
      />
    );

    expect(screen.getByText('food')).toBeInTheDocument();
    expect(screen.getByText('groceries')).toBeInTheDocument();
    expect(screen.getByText('Supermarket shopping')).toBeInTheDocument();
    expect(screen.getByText('HDFC Card')).toBeInTheDocument();
    expect(screen.getByText('-$150.00')).toBeInTheDocument();
  });

  it('renders income transaction details correctly with positive sign', () => {
    render(
      <TransactionCard
        transaction={incomeTx}
        currency="USD"
        locale="en-US"
      />
    );

    expect(screen.getByText('salary')).toBeInTheDocument();
    expect(screen.getByText('+$5,000.00')).toBeInTheDocument();
    expect(screen.getByText('+$5,000.00').className).toContain('text-emerald-400');
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

  it('calls onEdit when edit button is clicked', () => {
    const handleEdit = jest.fn();
    render(
      <TransactionCard
        transaction={expenseTx}
        onEdit={handleEdit}
      />
    );

    const editBtn = screen.getByTitle('Edit transaction');
    fireEvent.click(editBtn);
    expect(handleEdit).toHaveBeenCalledWith(expenseTx);
  });

  it('opens delete confirmation modal and executes onDelete callback', async () => {
    const handleDelete = jest.fn().mockResolvedValue(undefined);
    render(
      <TransactionCard
        transaction={expenseTx}
        onDelete={handleDelete}
      />
    );

    const deleteBtn = screen.getByTitle('Delete transaction');
    fireEvent.click(deleteBtn);

    expect(screen.getByText('Are you sure you want to delete this transaction?')).toBeInTheDocument();

    const confirmDeleteBtn = screen.getAllByRole('button', { name: /delete/i })[1];
    await act(async () => {
      fireEvent.click(confirmDeleteBtn);
    });

    expect(handleDelete).toHaveBeenCalledWith(expenseTx);
  });

  it('opens void confirmation modal and executes onVoid callback', async () => {
    const handleVoid = jest.fn().mockResolvedValue(undefined);
    render(
      <TransactionCard
        transaction={expenseTx}
        onVoid={handleVoid}
      />
    );

    const voidBtn = screen.getByTitle('Void transaction (Ledger)');
    fireEvent.click(voidBtn);

    expect(screen.getByText('Void this ledger entry?')).toBeInTheDocument();

    const confirmVoidBtn = screen.getByRole('button', { name: /void entry/i });
    await act(async () => {
      fireEvent.click(confirmVoidBtn);
    });

    expect(handleVoid).toHaveBeenCalledWith(expenseTx);
  });
});
