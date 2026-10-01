import React, { useMemo, useEffect } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { QuickEntryView } from '@money-manager/ui';

const ACCOUNTS_STORAGE_KEY = 'gsheet_cached_accounts';

export const HomePage: React.FC = () => {
  const { transactions, createTransactionItem } = useTransactions();

  const accounts = useMemo(() => {
    const set = new Set<string>();
    const list: string[] = [];

    if (transactions && Array.isArray(transactions)) {
      for (const tx of transactions) {
        const acc = tx.account?.trim();
        if (acc && !set.has(acc.toLowerCase())) {
          set.add(acc.toLowerCase());
          list.push(acc);
        }
      }
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const cached = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            for (const acc of parsed) {
              const trimmed = typeof acc === 'string' ? acc.trim() : '';
              if (trimmed && !set.has(trimmed.toLowerCase())) {
                set.add(trimmed.toLowerCase());
                list.push(trimmed);
              }
            }
          }
        }
      } catch {
        // Ignore cache parse error
      }
    }

    return list;
  }, [transactions]);

  useEffect(() => {
    if (accounts.length > 0 && typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
      } catch {
        // Ignore storage error
      }
    }
  }, [accounts]);

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
