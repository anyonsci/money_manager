import React from 'react';
import { render, screen } from '@testing-library/react';
import { AnalyticsSummary } from '../src/components/analytics/AnalyticsSummary';
import { UnifiedTransaction } from '@money-manager/core';

describe('UI Component - AnalyticsSummary', () => {
  const sampleTransactions: UnifiedTransaction[] = [
    {
      id: '1',
      amount: 5000,
      type: 'income',
      category: 'salary',
      account: 'Bank',
    },
    {
      id: '2',
      amount: 1500,
      type: 'expense',
      category: 'food',
      account: 'Cash',
    },
    {
      id: '3',
      amount: 500,
      type: 'expense',
      category: 'travel',
      account: 'Card',
      status: 'VOID', // Should be skipped in totals
    },
  ];

  it('calculates income, expense, and net balance from transactions', () => {
    render(
      <AnalyticsSummary
        transactions={sampleTransactions}
        currency="USD"
        locale="en-US"
      />
    );

    expect(screen.getByText('Total Income')).toBeInTheDocument();
    expect(screen.getByText('Total Expenses')).toBeInTheDocument();
    expect(screen.getByText('Net Balance')).toBeInTheDocument();

    expect(screen.getByText('$5,000.00')).toBeInTheDocument();
    expect(screen.getByText('$1,500.00')).toBeInTheDocument();
    expect(screen.getByText('$3,500.00')).toBeInTheDocument();
  });

  it('renders precomputed summaryData when provided', () => {
    const summary = {
      totalIncome: 10000,
      totalExpense: 4000,
      netBalance: 6000,
    };

    render(
      <AnalyticsSummary
        summaryData={summary}
        currency="USD"
        locale="en-US"
      />
    );

    expect(screen.getByText('$10,000.00')).toBeInTheDocument();
    expect(screen.getByText('$4,000.00')).toBeInTheDocument();
    expect(screen.getByText('$6,000.00')).toBeInTheDocument();
  });

  it('applies rose color styling when net balance is negative', () => {
    const negativeSummary = {
      totalIncome: 1000,
      totalExpense: 3000,
      netBalance: -2000,
    };

    render(
      <AnalyticsSummary
        summaryData={negativeSummary}
        currency="USD"
        locale="en-US"
      />
    );

    const balanceElem = screen.getByText('-$2,000.00');
    expect(balanceElem.className).toContain('text-rose-400');
  });
});
