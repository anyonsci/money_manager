import { test, expect } from '@playwright/test';

test.describe('TransactionList Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/transaction-list');
    await page.waitForSelector('[data-testid="list-fixture-container"]');
  });

  test('renders populated list with multiple items and supports item deletion', async ({ page }) => {
    const listPopulated = page.locator('[data-testid="list-populated"]');
    await expect(listPopulated).toBeVisible();

    // Verify list item counts and contents
    await expect(listPopulated.getByText('Weekly vegetable market')).toBeVisible();
    await expect(listPopulated.getByText('Petrol refuel')).toBeVisible();
    await expect(listPopulated.getByText('UI Design project milestone 1')).toBeVisible();

    // Visual snapshot of loaded list
    await expect(listPopulated).toHaveScreenshot('transaction-list-populated.png');

    // Test deleting the first transaction
    const firstItemDeleteBtn = listPopulated.locator('button[title="Delete transaction"]').first();
    await firstItemDeleteBtn.click();

    // Confirm deletion
    const confirmBtn = page.getByRole('button', { name: 'Delete', exact: true });
    await confirmBtn.click();

    // Verify the item is removed from the DOM
    await expect(listPopulated.getByText('Weekly vegetable market')).not.toBeVisible();
  });

  test('renders loading state with spinner and placeholder text', async ({ page }) => {
    const listLoading = page.locator('[data-testid="list-loading"]');
    await expect(listLoading).toBeVisible();
    await expect(listLoading.getByText('Loading transactions...')).toBeVisible();

    // Visual snapshot
    await expect(listLoading).toHaveScreenshot('transaction-list-loading.png');
  });

  test('renders empty state with custom empty message and inbox icon', async ({ page }) => {
    const listEmpty = page.locator('[data-testid="list-empty"]');
    await expect(listEmpty).toBeVisible();
    await expect(listEmpty.getByText('No ledger entries found for this workspace.')).toBeVisible();

    // Visual snapshot
    await expect(listEmpty).toHaveScreenshot('transaction-list-empty.png');
  });
});
