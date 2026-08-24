import React, { useState } from 'react';
import { TransactionList } from '@money-manager/ui';
import { UnifiedTransaction } from '@money-manager/core';

const initialList: UnifiedTransaction[] = [
  {
    id: 'tx-list-1',
    amount: 1250,
    type: 'expense',
    category: 'Groceries',
    account: 'Cash',
    note: 'Weekly vegetable market',
    transactionDate: '2026-08-22',
    status: 'CLEARED'
  },
  {
    id: 'tx-list-2',
    amount: 3400,
    type: 'expense',
    category: 'Fuel',
    account: 'Card',
    note: 'Petrol refuel',
    transactionDate: '2026-08-21',
    status: 'CLEARED'
  },
  {
    id: 'tx-list-3',
    amount: 25000,
    type: 'income',
    category: 'Freelance',
    account: 'Bank',
    note: 'UI Design project milestone 1',
    transactionDate: '2026-08-20',
    status: 'CLEARED'
  }
];

export const TransactionListFixture: React.FC = () => {
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>(initialList);

  return (
    <div className="space-y-8 p-6 max-w-3xl mx-auto" data-testid="list-fixture-container">
      <section id="section-list-populated">
        <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          Populated Transaction List
        </h2>
        <div data-testid="list-populated">
          <TransactionList
            transactions={transactions}
            currency="INR"
            locale="en-IN"
            onDelete={async (tx) => {
              setTransactions((prev) => prev.filter((t) => t.id !== tx.id));
            }}
          />
        </div>
      </section>

      <section id="section-list-loading">
        <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          Loading State
        </h2>
        <div data-testid="list-loading">
          <TransactionList
            transactions={[]}
            isLoading={true}
          />
        </div>
      </section>

      <section id="section-list-empty">
        <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          Empty State
        </h2>
        <div data-testid="list-empty">
          <TransactionList
            transactions={[]}
            emptyMessage="No ledger entries found for this workspace."
          />
        </div>
      </section>
    </div>
  );
};
