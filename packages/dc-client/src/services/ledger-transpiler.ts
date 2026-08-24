import { api } from '../api/endpoints';
import type {
  TransactionFormValues,
  FormattedTransaction,
  DeriveCountTransaction,
  Account,
  AccountGroup,
} from '../types/index';
import { getCanonicalCategory } from '@money-manager/core';

export class LedgerTranspilerService {
  private static groupCache: Map<string, AccountGroup[]> = new Map();
  private static accountCache: Map<string, Account[]> = new Map();

  static async refreshCache(workspaceId: string) {
    try {
      const [groupsRes, accountsRes] = await Promise.all([
        api.accountGroups.list(workspaceId),
        api.accounts.list(workspaceId),
      ]);

      if (groupsRes.success && groupsRes.data) {
        this.groupCache.set(workspaceId, groupsRes.data);
      }
      if (accountsRes.success && accountsRes.data) {
        this.accountCache.set(workspaceId, accountsRes.data);
      }
    } catch (e) {
      console.error('Failed to refresh ledger cache', e);
    }
  }

  static async ensureChartOfAccounts(
    workspaceId: string,
    assetAccountName: string,
    categoryName: string,
    type: 'expense' | 'income',
    currency: string = 'INR'
  ): Promise<{ assetAccount: Account; categoryAccount: Account }> {
    let groups = this.groupCache.get(workspaceId);
    let accounts = this.accountCache.get(workspaceId);

    if (!groups || !accounts) {
      await this.refreshCache(workspaceId);
      groups = this.groupCache.get(workspaceId) || [];
      accounts = this.accountCache.get(workspaceId) || [];
    }

    let assetGroup = groups.find((g) => g.accountType === 'ASSET');
    if (!assetGroup) {
      const res = await api.accountGroups.create(workspaceId, {
        name: 'Assets',
        accountType: 'ASSET',
      });
      if (res.success && res.data) {
        assetGroup = res.data;
        groups.push(assetGroup);
        this.groupCache.set(workspaceId, groups);
      } else {
        throw new Error('Failed to create Asset Group');
      }
    }

    const targetCategoryType = type === 'expense' ? 'EXPENSE' : 'INCOME';
    let categoryGroup = groups.find((g) => g.accountType === targetCategoryType);
    if (!categoryGroup) {
      const groupName = type === 'expense' ? 'Expenses' : 'Income';
      const res = await api.accountGroups.create(workspaceId, {
        name: groupName,
        accountType: targetCategoryType,
      });
      if (res.success && res.data) {
        categoryGroup = res.data;
        groups.push(categoryGroup);
        this.groupCache.set(workspaceId, groups);
      } else {
        throw new Error(`Failed to create ${groupName} Group`);
      }
    }

    let assetAccount = accounts.find(
      (a) =>
        a.accountGroupId === assetGroup!.id &&
        a.name.toLowerCase() === assetAccountName.toLowerCase()
    );
    if (!assetAccount) {
      const res = await api.accounts.create(workspaceId, {
        name: assetAccountName,
        accountGroupId: assetGroup.id,
        unitSymbol: currency,
      });
      if (res.success && res.data) {
        assetAccount = res.data;
        accounts.push(assetAccount);
        this.accountCache.set(workspaceId, accounts);
      } else {
        throw new Error(`Failed to create account ${assetAccountName}`);
      }
    }

    const canonicalCatName = getCanonicalCategory(categoryName);
    let categoryAccount = accounts.find(
      (a) =>
        a.accountGroupId === categoryGroup!.id &&
        a.name.toLowerCase() === canonicalCatName.toLowerCase()
    );
    if (!categoryAccount) {
      const res = await api.accounts.create(workspaceId, {
        name: canonicalCatName,
        accountGroupId: categoryGroup.id,
        unitSymbol: currency,
      });
      if (res.success && res.data) {
        categoryAccount = res.data;
        accounts.push(categoryAccount);
        this.accountCache.set(workspaceId, accounts);
      } else {
        throw new Error(`Failed to create category account ${canonicalCatName}`);
      }
    }

    return { assetAccount, categoryAccount };
  }

  static async transpileAndPost(
    workspaceId: string,
    formValues: TransactionFormValues,
    currency: string = 'INR'
  ): Promise<DeriveCountTransaction> {
    const numAmount = parseFloat(formValues.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Invalid transaction amount');
    }

    const { assetAccount, categoryAccount } = await this.ensureChartOfAccounts(
      workspaceId,
      formValues.account,
      formValues.category,
      formValues.type,
      currency
    );

    let legs: Array<{ accountId: string; amount: number; unitSymbol: string }> = [];

    if (formValues.type === 'expense') {
      legs = [
        {
          accountId: assetAccount.id,
          amount: -numAmount,
          unitSymbol: currency,
        },
        {
          accountId: categoryAccount.id,
          amount: numAmount,
          unitSymbol: currency,
        },
      ];
    } else {
      legs = [
        {
          accountId: assetAccount.id,
          amount: numAmount,
          unitSymbol: currency,
        },
        {
          accountId: categoryAccount.id,
          amount: -numAmount,
          unitSymbol: currency,
        },
      ];
    }

    const tags = [
      `type:${formValues.type}`,
      `category:${getCanonicalCategory(formValues.category)}`,
      `account:${formValues.account}`,
    ];
    if (formValues.subCategory?.trim()) {
      tags.push(`subcategory:${formValues.subCategory.trim()}`);
    }

    const res = await api.transactions.create(workspaceId, {
      transactionDate: formValues.date || new Date().toISOString().split('T')[0],
      description: formValues.note || `${formValues.type} - ${formValues.category}`,
      tags,
      status: 'POSTED',
      legs,
    });

    if (res.success && res.data) {
      return res.data;
    }

    const errStr = typeof res.error === 'string' ? res.error : res.error?.message;
    throw new Error(errStr || 'Failed to post transaction');
  }

  static transpileToFrontend(
    tx: DeriveCountTransaction,
    accountsMap: Map<string, Account> = new Map()
  ): FormattedTransaction {
    let type: 'expense' | 'income' = 'expense';
    let category = 'Others';
    let subCategory = '';
    let account = 'Default Account';

    for (const tag of tx.tags || []) {
      if (tag.startsWith('type:')) type = tag.replace('type:', '') as 'expense' | 'income';
      if (tag.startsWith('category:')) category = tag.replace('category:', '');
      if (tag.startsWith('subcategory:')) subCategory = tag.replace('subcategory:', '');
      if (tag.startsWith('account:')) account = tag.replace('account:', '');
    }

    let primaryAmount = 0;
    if (tx.legs && tx.legs.length > 0) {
      const legAmounts = tx.legs.map((l) => Math.abs(parseFloat(String(l.amount))));
      primaryAmount = Math.max(...legAmounts);

      if (account === 'Default Account') {
        const assetLeg = tx.legs.find((l) => {
          const acc = accountsMap.get(l.accountId);
          return acc && acc.name;
        });
        if (assetLeg) {
          const acc = accountsMap.get(assetLeg.accountId);
          if (acc) account = acc.name;
        }
      }
    }

    return {
      id: tx.id,
      transactionDate: tx.transactionDate || tx.postedAt,
      amount: primaryAmount,
      account,
      category,
      subCategory,
      note: tx.description,
      type,
      status: tx.status,
      raw: tx,
    };
  }
}
