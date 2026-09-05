import React, { useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useWorkspace } from '@money-manager/dc-client';
import { QuickEntryView } from '@money-manager/ui';

export const HomePage: React.FC = () => {
  const { transactions, addTransaction, isSubmitting } = useTransactions();
  const { activeWorkspace } = useWorkspace();

  const accounts = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) return [];
    const set = new Set<string>();
    const list: string[] = [];
    for (const tx of transactions) {
      const acc = tx.account?.trim();
      if (acc && !set.has(acc.toLowerCase())) {
        set.add(acc.toLowerCase());
        list.push(acc);
      }
    }
    return list;
  }, [transactions]);

  return (
    <QuickEntryView
      title="DC Expense"
      subtitle="Double-Entry Money Manager with Automated Ledger Transpilation"
      currency={activeWorkspace?.defaultCurrency || 'USD'}
      isSubmitting={isSubmitting}
      onSubmit={addTransaction}
      accounts={accounts}
      successMessage="Saved successfully! Posted to double-entry ledger."
      placeholder="30  HDFC  Groceries.Supermarket  Lunch note"
    />
  );
};

export default HomePage;
