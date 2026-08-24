import { test, expect } from '@playwright/test';

test.describe('Pagination & PageLoader Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pagination-loader');
    await page.waitForSelector('[data-testid="pagination-loader-container"]');
  });

  test('renders pagination controls and responds to next/prev page clicks', async ({ page }) => {
    const pagination = page.locator('[data-testid="pagination-interactive"]');
    await expect(pagination).toBeVisible();

    // Initial state: Page 2 of 5
    await expect(pagination.getByText(/Page\s+2\s+of\s+5/)).toBeVisible();
    await expect(pagination.getByText('(125 total entries)')).toBeVisible();

    // Visual snapshot
    await expect(pagination).toHaveScreenshot('pagination-component.png');

    // Click Next
    const nextBtn = pagination.getByRole('button', { name: 'Next' });
    await nextBtn.click();

    // Now Page 3 of 5
    await expect(pagination.getByText(/Page\s+3\s+of\s+5/)).toBeVisible();

    // Click Prev
    const prevBtn = pagination.getByRole('button', { name: 'Prev' });
    await prevBtn.click();
    await expect(pagination.getByText(/Page\s+2\s+of\s+5/)).toBeVisible();
  });

  test('renders page loader spinner with custom message', async ({ page }) => {
    const pageLoader = page.locator('[data-testid="page-loader-box"]');
    await expect(pageLoader).toBeVisible();
    await expect(pageLoader.getByText('Loading financial transactions and analytics...')).toBeVisible();

    // Visual snapshot
    await expect(pageLoader).toHaveScreenshot('page-loader.png');
  });
});
