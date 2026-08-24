import { test, expect } from '@playwright/test';

test.describe('TransactionCard Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/transaction-card');
    await page.waitForSelector('[data-testid="card-fixture-container"]');
  });

  test('renders expense card with category, note, account and formatted amount', async ({ page }) => {
    const expenseCard = page.locator('[data-testid="card-expense"]');
    await expect(expenseCard).toBeVisible();

    await expect(expenseCard.getByText('Food & Dining')).toBeVisible();
    await expect(expenseCard.getByText('Dinner Buffet')).toBeVisible();
    await expect(expenseCard.getByText('Team dinner celebration at BBQ Nation')).toBeVisible();
    await expect(expenseCard.getByText('HDFC Credit Card')).toBeVisible();
    await expect(expenseCard.getByText('-₹4,250.75')).toBeVisible();

    // Visual snapshot
    await expect(expenseCard).toHaveScreenshot('transaction-card-expense.png');
  });

  test('renders income card with positive green styling', async ({ page }) => {
    const incomeCard = page.locator('[data-testid="card-income"]');
    await expect(incomeCard).toBeVisible();

    await expect(incomeCard.getByText('Salary', { exact: true })).toBeVisible();
    await expect(incomeCard.getByText('Salary Account')).toBeVisible();
    await expect(incomeCard.getByText('Tech Corp')).toBeVisible();
    await expect(incomeCard.getByText('+₹95,000.00')).toBeVisible();

    // Visual snapshot
    await expect(incomeCard).toHaveScreenshot('transaction-card-income.png');
  });

  test('renders voided card with strike-through and VOID badge', async ({ page }) => {
    const voidCard = page.locator('[data-testid="card-void"]');
    await expect(voidCard).toBeVisible();

    await expect(voidCard.getByText('VOIDED')).toBeVisible();
    await expect(voidCard.getByText('Returned jacket (Order cancelled)')).toBeVisible();

    // Visual snapshot
    await expect(voidCard).toHaveScreenshot('transaction-card-void.png');
  });

  test('handles edit button click', async ({ page }) => {
    const expenseCard = page.locator('[data-testid="card-expense"]');
    const editBtn = expenseCard.locator('button[title="Edit transaction"]');
    await editBtn.click();

    const actionLog = page.locator('[data-testid="action-log"]');
    await expect(actionLog).toHaveText(/Edited tx-card-expense/);
  });

  test('opens and confirms delete modal', async ({ page }) => {
    const expenseCard = page.locator('[data-testid="card-expense"]');
    const deleteBtn = expenseCard.locator('button[title="Delete transaction"]');
    await deleteBtn.click();

    // Check modal opened
    const modal = page.locator('text=Delete Transaction');
    await expect(modal).toBeVisible();
    await expect(page.getByText('Are you sure you want to delete this transaction?')).toBeVisible();

    // Click confirm Delete
    const confirmDeleteBtn = page.getByRole('button', { name: 'Delete', exact: true });
    await confirmDeleteBtn.click();

    // Verify action log updated
    const actionLog = page.locator('[data-testid="action-log"]');
    await expect(actionLog).toHaveText('Deleted tx-card-expense');
  });

  test('opens and cancels void modal', async ({ page }) => {
    const expenseCard = page.locator('[data-testid="card-expense"]');
    const voidBtn = expenseCard.locator('button[title="Void transaction (Ledger)"]');
    await voidBtn.click();

    // Check void modal opened
    await expect(page.getByText('Void this ledger entry?')).toBeVisible();

    // Click Cancel
    const cancelBtn = page.getByRole('button', { name: 'Cancel' });
    await cancelBtn.click();

    await expect(page.getByText('Void this ledger entry?')).not.toBeVisible();
  });
});
