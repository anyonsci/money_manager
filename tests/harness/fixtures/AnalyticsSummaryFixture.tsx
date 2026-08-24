import React from 'react';
import { AnalyticsSummary } from '@money-manager/ui';
import { UnifiedTransaction } from '@money-manager/core';

const sampleTransactions: UnifiedTransaction[] = [
  {
    id: 'tx-1',
    amount: 150000,
    type: 'income',
    category: 'Salary',
    account: 'Bank',
    timestamp: '2026-08-01T10:00:00Z',
    status: 'CLEARED'
  },
  {
    id: 'tx-2',
    amount: 35000,
    type: 'expense',
    category: 'Housing & Rent',
    account: 'Bank',
    timestamp: '2026-08-02T12:00:00Z',
    status: 'CLEARED'
  },
  {
    id: 'tx-3',
    amount: 12000,
    type: 'expense',
    category: 'Groceries',
    account: 'Credit Card',
    timestamp: '2026-08-03T15:30:00Z',
    status: 'CLEARED'
  },
  {
    id: 'tx-4',
    amount: 50000,
    type: 'expense',
    category: 'Travel',
    account: 'Credit Card',
    timestamp: '2026-08-04T09:00:00Z',
    status: 'VOID' // should be excluded from totals
  }
];

export const AnalyticsSummaryFixture: React.FC = () => {
  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto" data-testid="analytics-fixture-container">
      <section id="section-positive">
        <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          Direct Summary (Positive Net Balance)
        </h2>
        <div data-testid="analytics-positive">
          <AnalyticsSummary
            summaryData={{
              totalIncome: 125000,
              totalExpense: 48500,
              netBalance: 76500
            }}
            currency="INR"
            locale="en-IN"
          />
        </div>
      </section>

      <section id="section-negative">
        <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          Direct Summary (Negative Net Balance / Deficit)
        </h2>
        <div data-testid="analytics-negative">
          <AnalyticsSummary
            summaryData={{
              totalIncome: 30000,
              totalExpense: 52000,
              netBalance: -22000
            }}
            currency="USD"
            locale="en-US"
          />
        </div>
      </section>

      <section id="section-calculated">
        <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          Calculated from Transaction Array (Excludes VOID)
        </h2>
        <div data-testid="analytics-calculated">
          <AnalyticsSummary
            transactions={sampleTransactions}
            currency="INR"
            locale="en-IN"
          />
        </div>
      </section>
    </div>
  );
};
