import React, { useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { QuickEntryView } from '@money-manager/ui';

export const HomePage: React.FC = () => {
  const { transactions, createTransactionItem } = useTransactions();

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
      title="Quick entry"
      currency="INR"
      placeholder="30  diners cc  food.lunch  some note"
      onSubmit={createTransactionItem}
      accounts={accounts}
      examples={[
        { text: '30  diners cc  food.lunch  some note', type: 'expense' },
        { text: '+45000  Checking  salary  Monthly pay', type: 'income' },
      ]}
    />
  );
};

export default HomePage;
