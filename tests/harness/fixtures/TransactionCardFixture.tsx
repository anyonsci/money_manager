import React, { useState } from 'react';
import { TransactionCard } from '@money-manager/ui';
import { UnifiedTransaction } from '@money-manager/core';

const expenseTx: UnifiedTransaction = {
  id: 'tx-card-expense',
  amount: 4250.75,
  type: 'expense',
  category: 'Food & Dining',
  subCategory: 'Dinner Buffet',
  account: 'HDFC Credit Card',
  note: 'Team dinner celebration at BBQ Nation',
  transactionDate: '2026-08-20',
  status: 'CLEARED'
};

const incomeTx: UnifiedTransaction = {
  id: 'tx-card-income',
  amount: 95000,
  type: 'income',
  category: 'Salary',
  subCategory: 'Tech Corp',
  account: 'Salary Account',
  note: 'August compensation & bonus',
  transactionDate: '2026-08-01',
  status: 'CLEARED'
};

const voidTx: UnifiedTransaction = {
  id: 'tx-card-void',
  amount: 8999,
  type: 'expense',
  category: 'Shopping',
  subCategory: 'Apparel',
  account: 'SBI Debit',
  note: 'Returned jacket (Order cancelled)',
  transactionDate: '2026-08-15',
  status: 'VOID'
};

export const TransactionCardFixture: React.FC = () => {
  const [actionLog, setActionLog] = useState<string>('No actions yet');

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto" data-testid="card-fixture-container">
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-300">
        <span className="text-slate-500 font-semibold uppercase mr-2">Action Event Log:</span>
        <span data-testid="action-log" className="font-mono text-brand-400">{actionLog}</span>
      </div>

      <section id="section-expense-card">
        <h2 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
          Expense Transaction Card
        </h2>
        <div data-testid="card-expense">
          <TransactionCard
            transaction={expenseTx}
            currency="INR"
            locale="en-IN"
            onEdit={(tx) => setActionLog(`Edited ${tx.id} (${tx.category})`)}
            onDelete={async (tx) => {
              setActionLog(`Deleted ${tx.id}`);
            }}
            onVoid={async (tx) => {
              setActionLog(`Voided ${tx.id}`);
            }}
          />
        </div>
      </section>

      <section id="section-income-card">
        <h2 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
          Income Transaction Card
        </h2>
        <div data-testid="card-income">
          <TransactionCard
            transaction={incomeTx}
            currency="INR"
            locale="en-IN"
            onEdit={(tx) => setActionLog(`Edited ${tx.id}`)}
          />
        </div>
      </section>

      <section id="section-void-card">
        <h2 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
          Voided Transaction Card
        </h2>
        <div data-testid="card-void">
          <TransactionCard
            transaction={voidTx}
            currency="INR"
            locale="en-IN"
          />
        </div>
      </section>
    </div>
  );
};
