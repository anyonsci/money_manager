import React from 'react';
import { render, screen } from '@testing-library/react';
import { CategoryPieChart } from '../src/components/analytics/CategoryPieChart';
import { UnifiedTransaction } from '@money-manager/core';

describe('UI Component - CategoryPieChart', () => {
  it('renders empty message when no expense transactions exist', () => {
    render(<CategoryPieChart transactions={[]} />);
    expect(
      screen.getByText('No expense data available for the selected period')
    ).toBeInTheDocument();
  });

  it('renders chart and legends when expenses are present', () => {
    const transactions: UnifiedTransaction[] = [
      {
        id: '1',
        amount: 300,
        type: 'expense',
        category: 'food',
        account: 'Card',
      },
      {
        id: '2',
        amount: 700,
        type: 'expense',
        category: 'travel',
        account: 'Card',
      },
      {
        id: '3',
        amount: 2000,
        type: 'income',
        category: 'salary',
        account: 'Bank',
      },
      {
        id: '4',
        amount: 500,
        type: 'expense',
        category: 'entertainment',
        account: 'Cash',
        status: 'VOID', // Ignored
      },
    ];

    render(
      <CategoryPieChart
        transactions={transactions}
        currency="USD"
        locale="en-US"
        title="Monthly Breakdown"
      />
    );

    expect(screen.getByText('Monthly Breakdown')).toBeInTheDocument();
    expect(screen.getByText(/Total:/)).toBeInTheDocument();
    expect(screen.getByText('$1,000.00')).toBeInTheDocument();

    // Legends
    expect(screen.getByText('travel')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText('food')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
  });
});
