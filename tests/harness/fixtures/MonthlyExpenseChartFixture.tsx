import React, { useState } from 'react';
import { MonthlyExpenseChart } from '@money-manager/ui';
import { UnifiedTransaction } from '@money-manager/core';

const sampleTransactions: UnifiedTransaction[] = [
  // May 2026
  { id: '1', amount: 350, type: 'expense', category: 'food', account: 'Card', transactionDate: '2026-05-10' },
  { id: '2', amount: 150, type: 'expense', category: 'travel', account: 'Card', transactionDate: '2026-05-18' },
  // June 2026
  { id: '3', amount: 500, type: 'expense', category: 'food', account: 'Card', transactionDate: '2026-06-05' },
  { id: '4', amount: 800, type: 'expense', category: 'rent', account: 'Bank', transactionDate: '2026-06-01' },
  { id: '5', amount: 120, type: 'expense', category: 'entertainment', account: 'Cash', transactionDate: '2026-06-20' },
  // July 2026
  { id: '6', amount: 420, type: 'expense', category: 'food', account: 'Card', transactionDate: '2026-07-12' },
  { id: '7', amount: 300, type: 'expense', category: 'need', account: 'Bank', transactionDate: '2026-07-15' },
  // August 2026
  { id: '8', amount: 480, type: 'expense', category: 'food', account: 'Card', transactionDate: '2026-08-04' },
  { id: '9', amount: 260, type: 'expense', category: 'travel', account: 'Card', transactionDate: '2026-08-22' },
  { id: '10', amount: 800, type: 'expense', category: 'rent', account: 'Bank', transactionDate: '2026-08-01' },
  // September 2026
  { id: '11', amount: 600, type: 'expense', category: 'food', account: 'Card', transactionDate: '2026-09-08' },
  { id: '12', amount: 450, type: 'expense', category: 'need', account: 'Bank', transactionDate: '2026-09-14' },
  // October 2026
  { id: '13', amount: 250, type: 'expense', category: 'food', account: 'Card', transactionDate: '2026-10-01' },
  { id: '14', amount: 180, type: 'expense', category: 'wellness', account: 'Card', transactionDate: '2026-10-02' },
  // Income & Void (should be excluded)
  { id: '15', amount: 3000, type: 'income', category: 'salary', account: 'Bank', transactionDate: '2026-09-01' },
  { id: '16', amount: 9999, type: 'expense', category: 'shopping', account: 'Card', transactionDate: '2026-09-01', status: 'VOID' },
];

export const MonthlyExpenseChartFixture: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const fixedRefDate = new Date(2026, 9, 2); // Oct 2, 2026

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto" data-testid="monthly-expense-fixture-container">
      <section id="section-populated">
        <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          Populated 6-Month Stacked Spending
        </h2>
        <div data-testid="monthly-expense-populated">
          <MonthlyExpenseChart
            transactions={sampleTransactions}
            referenceDate={fixedRefDate}
            currency="USD"
            locale="en-US"
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
          />
        </div>
      </section>

      <section id="section-empty">
        <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          Empty State (Zero Expenses)
        </h2>
        <div data-testid="monthly-expense-empty">
          <MonthlyExpenseChart
            transactions={[]}
            referenceDate={fixedRefDate}
            currency="USD"
            locale="en-US"
          />
        </div>
      </section>
    </div>
  );
};
