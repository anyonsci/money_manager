import React from 'react';
import { CategoryPieChart } from '@money-manager/ui';
import { UnifiedTransaction } from '@money-manager/core';

const expenseTransactions: UnifiedTransaction[] = [
  {
    id: 'tx-1',
    amount: 28000,
    type: 'expense',
    category: 'Housing & Rent',
    account: 'Bank',
    timestamp: '2026-08-01',
    status: 'CLEARED'
  },
  {
    id: 'tx-2',
    amount: 14500,
    type: 'expense',
    category: 'Groceries',
    account: 'Card',
    timestamp: '2026-08-02',
    status: 'CLEARED'
  },
  {
    id: 'tx-3',
    amount: 6200,
    type: 'expense',
    category: 'Food & Dining',
    account: 'UPI',
    timestamp: '2026-08-03',
    status: 'CLEARED'
  },
  {
    id: 'tx-4',
    amount: 4500,
    type: 'expense',
    category: 'Transportation',
    account: 'Card',
    timestamp: '2026-08-04',
    status: 'CLEARED'
  },
  {
    id: 'tx-5',
    amount: 3200,
    type: 'expense',
    category: 'Entertainment',
    account: 'UPI',
    timestamp: '2026-08-05',
    status: 'CLEARED'
  },
  {
    id: 'tx-6',
    amount: 1800,
    type: 'expense',
    category: 'Utilities',
    account: 'Bank',
    timestamp: '2026-08-06',
    status: 'CLEARED'
  },
  // VOID expense should be ignored
  {
    id: 'tx-7',
    amount: 99999,
    type: 'expense',
    category: 'Shopping',
    account: 'Card',
    timestamp: '2026-08-07',
    status: 'VOID'
  },
  // Income should be ignored by pie chart
  {
    id: 'tx-8',
    amount: 100000,
    type: 'income',
    category: 'Salary',
    account: 'Bank',
    timestamp: '2026-08-01',
    status: 'CLEARED'
  }
];

export const CategoryPieChartFixture: React.FC = () => {
  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto" data-testid="piechart-fixture-container">
      <section id="section-populated">
        <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          Populated Expense Distribution
        </h2>
        <div data-testid="piechart-populated">
          <CategoryPieChart
            transactions={expenseTransactions}
            title="Monthly Expense Breakdown"
            currency="INR"
            locale="en-IN"
          />
        </div>
      </section>

      <section id="section-empty">
        <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          Empty State (Zero Expenses)
        </h2>
        <div data-testid="piechart-empty">
          <CategoryPieChart
            transactions={[]}
            title="Empty Chart"
            currency="INR"
            locale="en-IN"
          />
        </div>
      </section>
    </div>
  );
};
