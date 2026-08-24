import { test, expect } from '@playwright/test';

test.describe('ResponsiveLayout & Navigation Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/layout-nav');
    await page.waitForSelector('[data-testid="layout-fixture-container"]');
  });

  test('renders header with brand title, badge, icon, controls, and avatar', async ({ page }) => {
    const layout = page.locator('[data-testid="layout-fixture-container"]');
    await expect(layout).toBeVisible();

    // Check Header Brand
    await expect(page.getByRole('heading', { name: 'DeriveCount Money' })).toBeVisible();
    await expect(page.getByText('Double-Entry Financial Suite')).toBeVisible();
    await expect(page.getByText('LEDGER')).toBeVisible();
    await expect(page.getByText('JD')).toBeVisible();

    // Check header controls (Notification & Settings buttons)
    await expect(page.locator('button[title="Notifications"]')).toBeVisible();
    await expect(page.locator('button[title="Settings"]')).toBeVisible();

    // Check main slot content
    await expect(page.getByText('Welcome back, John!')).toBeVisible();

    // Check Navigation bar links
    await expect(page.getByText('Quick Entry')).toBeVisible();
    await expect(page.getByText('Transactions')).toBeVisible();
    await expect(page.getByText('Analytics')).toBeVisible();

    // Visual snapshot
    await expect(page).toHaveScreenshot('layout-and-navigation.png');
  });

  test('triggers logo click callback', async ({ page }) => {
    const brandButton = page.locator('header button').first();
    await brandButton.click();

    await expect(page.locator('[data-testid="logo-click-indicator"]')).toBeVisible();
  });
});
