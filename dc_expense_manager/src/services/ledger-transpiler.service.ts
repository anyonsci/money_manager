import { api } from './api.js';
import type {
  TransactionFormValues,
  FormattedTransaction,
  DeriveCountTransaction,
  Account,
  AccountGroup,
} from '../types/index.js';
import { getCanonicalCategory } from '../constants/categories.js';

export class LedgerTranspilerService {
  // In-memory cache per workspace to minimize redundant network roundtrips
  private static groupCache: Map<string, AccountGroup[]> = new Map();
  private static accountCache: Map<string, Account[]> = new Map();

  /**
   * Refresh accounts and account groups for a workspace.
   */
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
    } catch (err) {
      console.warn('Failed to refresh account cache:', err);
    }
  }

  /**
   * Ensure a default Account Group of the given type exists in workspace.
   */
  static async ensureAccountGroup(
    workspaceId: string,
    type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE',
    defaultName: string
  ): Promise<AccountGroup> {
    let groups = this.groupCache.get(workspaceId);
    if (!groups) {
      await this.refreshCache(workspaceId);
      groups = this.groupCache.get(workspaceId) || [];
    }

    const found = groups.find((g) => g.accountType === type);
    if (found) return found;

    // Create group if missing
    const res = await api.accountGroups.create(workspaceId, {
      name: defaultName,
      accountType: type,
    });

    if (res.success && res.data) {
      groups.push(res.data);
      this.groupCache.set(workspaceId, groups);
      return res.data;
    }

    throw new Error(`Failed to provision ${type} account group`);
  }

  /**
   * Ensure an account exists under the corresponding group (auto-provision if absent).
   */
  static async ensureAccount(
    workspaceId: string,
    accountName: string,
    accountType: 'ASSET' | 'EXPENSE' | 'INCOME',
    unitSymbol: string = 'USD'
  ): Promise<Account> {
    let accounts = this.accountCache.get(workspaceId);
    if (!accounts) {
      await this.refreshCache(workspaceId);
      accounts = this.accountCache.get(workspaceId) || [];
    }

    const cleanName = accountName.trim();
    const existing = accounts.find(
      (a) => a.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (existing) return existing;

    // Determine group name and ensure group exists
    const groupNameMap: Record<string, string> = {
      ASSET: 'Liquid Assets & Bank Accounts',
      EXPENSE: 'Operating & Living Expenses',
      INCOME: 'Income & Revenue',
    };

    const group = await this.ensureAccountGroup(
      workspaceId,
      accountType,
      groupNameMap[accountType] || `${accountType} Group`
    );

    // Create the account on the fly
    const res = await api.accounts.create(workspaceId, {
      accountGroupId: group.id,
      name: cleanName,
      unitSymbol,
    });

    if (res.success && res.data) {
      accounts.push(res.data);
      this.accountCache.set(workspaceId, accounts);
      return res.data;
    }

    throw new Error(`Failed to auto-provision account: ${cleanName}`);
  }

  /**
   * Transpiles user form values into a balanced double-entry transaction and posts it.
   */
  static async postTranspiledTransaction(
    workspaceId: string,
    formValues: TransactionFormValues,
    currency: string = 'USD'
  ): Promise<DeriveCountTransaction> {
    const numAmount = parseFloat(formValues.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Please enter a valid positive transaction amount');
    }

    const sourceAccountName = formValues.account?.trim() || 'Cash';
    const categoryName = getCanonicalCategory(formValues.category || 'Others');
    const subcategoryName = formValues.subCategory?.trim() || '';
    const note = formValues.note?.trim() || '';
    const dateStr = formValues.date || new Date().toISOString().split('T')[0];

    // Ensure accounts exist on the fly
    const sourceAssetAccount = await this.ensureAccount(
      workspaceId,
      sourceAccountName,
      'ASSET',
      currency
    );

    let destinationAccount: Account;
    let legs: Array<{ accountId: string; amount: number; unitSymbol: string }>;

    if (formValues.type === 'income') {
      // Income: Debit Asset Account (+amount), Credit Income Account (-amount) -> Sum = 0
      destinationAccount = await this.ensureAccount(
        workspaceId,
        categoryName,
        'INCOME',
        currency
      );

      legs = [
        {
          accountId: sourceAssetAccount.id,
          amount: numAmount,
          unitSymbol: currency,
        },
        {
          accountId: destinationAccount.id,
          amount: -numAmount,
          unitSymbol: currency,
        },
      ];
    } else {
      // Expense: Credit Asset Account (-amount), Debit Expense Account (+amount) -> Sum = 0
      destinationAccount = await this.ensureAccount(
        workspaceId,
        categoryName,
        'EXPENSE',
        currency
      );

      legs = [
        {
          accountId: sourceAssetAccount.id,
          amount: -numAmount,
          unitSymbol: currency,
        },
        {
          accountId: destinationAccount.id,
          amount: numAmount,
          unitSymbol: currency,
        },
      ];
    }

    // Build tags
    const tags: string[] = [];
    if (subcategoryName) {
      tags.push(`subcategory:${subcategoryName}`);
    }
    if (categoryName) {
      tags.push(`category:${categoryName}`);
    }

    const description = note ? `${categoryName}: ${note}` : `${categoryName} Entry`;

    const createRes = await api.transactions.create(workspaceId, {
      transactionDate: `${dateStr}T12:00:00.000Z`,
      postedAt: new Date(),
      description,
      tags,
      legs,
    });

    if (!createRes.success || !createRes.data) {
      throw new Error(createRes.error?.message || 'Failed to post double-entry transaction');
    }

    return createRes.data;
  }

  /**
   * Edit transaction via double-entry immutable lifecycle:
   * 1. Void existing transaction
   * 2. Post updated transaction
   */
  static async editTransaction(
    workspaceId: string,
    existingTransactionId: string,
    formValues: TransactionFormValues,
    currency: string = 'USD'
  ): Promise<DeriveCountTransaction> {
    // 1. Void old transaction (reverting cached balance)
    await api.transactions.void(workspaceId, existingTransactionId);

    // 2. Post new balanced transaction
    return await this.postTranspiledTransaction(workspaceId, formValues, currency);
  }

  /**
   * Transpile raw DeriveCount double-entry transactions into user-friendly formatted items.
   */
  static formatTransaction(tx: DeriveCountTransaction): FormattedTransaction {
    const tags = tx.tags || [];
    let subCategory = '';
    let explicitCategory = '';

    for (const tag of tags) {
      if (tag.startsWith('subcategory:')) {
        subCategory = tag.substring(12);
      } else if (tag.startsWith('category:')) {
        explicitCategory = tag.substring(9);
      }
    }

    let type: 'expense' | 'income' = 'expense';
    let amount = 0;
    let account = 'General';
    let category = explicitCategory || 'Others';

    if (tx.legs && tx.legs.length > 0) {
      // Find asset leg and category leg
      const negLeg = tx.legs.find((l) => parseFloat(String(l.amount)) < 0);
      const posLeg = tx.legs.find((l) => parseFloat(String(l.amount)) > 0);

      // In expense: asset is negative, expense is positive
      // In income: income is negative, asset is positive
      if (tx.description.toLowerCase().includes('salary') || tx.description.toLowerCase().includes('income')) {
        type = 'income';
        amount = posLeg ? Math.abs(parseFloat(String(posLeg.amount))) : 0;
        account = posLeg?.accountName || 'Bank';
        category = explicitCategory || negLeg?.accountName || 'Income';
      } else {
        type = 'expense';
        amount = posLeg ? Math.abs(parseFloat(String(posLeg.amount))) : 0;
        account = negLeg?.accountName || 'Cash';
        category = explicitCategory || posLeg?.accountName || 'Others';
      }
    }

    // Clean note from description
    let note = tx.description;
    if (note.startsWith(`${category}: `)) {
      note = note.substring(category.length + 2);
    } else if (note.endsWith(' Entry')) {
      note = '';
    }

    return {
      id: tx.id,
      transactionDate: tx.transactionDate || tx.postedAt,
      amount,
      account,
      category,
      subCategory,
      note,
      type,
      status: tx.status,
      raw: tx,
    };
  }
}
