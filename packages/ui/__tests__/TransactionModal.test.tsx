import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TransactionModal } from '../src/components/transactions/TransactionModal';
import { UnifiedTransaction } from '@money-manager/core';

describe('UI Component - TransactionModal', () => {
  it('renders create mode modal with default empty values', () => {
    render(
      <TransactionModal
        open={true}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
        defaultAccount="Savings"
      />
    );

    expect(screen.getByText('New Transaction')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0.00')).toHaveValue(null);
    expect(screen.getByDisplayValue('Savings')).toBeInTheDocument();
  });

  it('renders edit mode modal prepopulating existing transaction', () => {
    const tx: UnifiedTransaction = {
      id: 'tx-edit-1',
      amount: 450.5,
      type: 'income',
      category: 'salary',
      subCategory: 'bonus',
      note: 'Performance bonus',
      account: 'HDFC',
      transactionDate: '2025-02-28',
    };

    render(
      <TransactionModal
        open={true}
        transaction={tx}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />
    );

    expect(screen.getByText('Edit Transaction')).toBeInTheDocument();
    expect(screen.getByDisplayValue('450.5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('HDFC')).toBeInTheDocument();
    expect(screen.getByDisplayValue('salary')).toBeInTheDocument();
    expect(screen.getByDisplayValue('bonus')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Performance bonus')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2025-02-28')).toBeInTheDocument();
  });

  it('shows error if submitting non-positive amount', async () => {
    const handleSubmit = jest.fn();
    render(
      <TransactionModal
        open={true}
        onClose={jest.fn()}
        onSubmit={handleSubmit}
      />
    );

    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '0' } });

    const form = amountInput.closest('form')!;
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(
      screen.getByText('Please enter a valid amount greater than 0')
    ).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid values and calls onClose', async () => {
    const handleSubmit = jest.fn().mockResolvedValue(undefined);
    const handleClose = jest.fn();

    render(
      <TransactionModal
        open={true}
        onClose={handleClose}
        onSubmit={handleSubmit}
        defaultAccount="HDFC Bank"
      />
    );

    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '350' } });

    const noteInput = screen.getByPlaceholderText('Short description...');
    fireEvent.change(noteInput, { target: { value: 'Grocery shopping' } });

    const form = amountInput.closest('form')!;
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: '350',
        account: 'HDFC Bank',
        category: 'food',
        note: 'Grocery shopping',
        type: 'expense',
      })
    );
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('handles submission error and displays error message', async () => {
    const handleSubmit = jest.fn().mockRejectedValue(new Error('Server failed to save transaction'));
    const handleClose = jest.fn();

    render(
      <TransactionModal
        open={true}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    );

    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '100' } });

    const form = amountInput.closest('form')!;
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(handleSubmit).toHaveBeenCalled();
    expect(screen.getByText('Server failed to save transaction')).toBeInTheDocument();
    expect(handleClose).not.toHaveBeenCalled();
  });
});
