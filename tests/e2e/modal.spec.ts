import { test, expect } from '@playwright/test';

test.describe('Modal Dialog Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/modal');
    await page.waitForSelector('[data-testid="modal-standalone-container"]');
  });

  test('opens generic modal, displays title and body, and supports confirmation action', async ({ page }) => {
    // Open modal
    await page.click('#btn-open-generic-modal');

    const modalTitle = page.getByRole('heading', { name: 'Custom Confirmation Modal' });
    await expect(modalTitle).toBeVisible();

    const innerContent = page.locator('[data-testid="modal-inner-content"]');
    await expect(innerContent).toBeVisible();

    // Visual snapshot
    const modalContainer = page.locator('.relative.w-full.max-w-lg');
    await expect(modalContainer).toBeVisible();
    await expect(modalContainer).toHaveScreenshot('modal-dialog-open.png');

    // Click confirm action
    await page.click('#btn-modal-confirm');

    // Modal closes and counter updates
    await expect(modalTitle).not.toBeVisible();
    const counter = page.locator('[data-testid="counter-value"]');
    await expect(counter).toHaveText('1');
  });

  test('dismisses modal on Escape key press', async ({ page }) => {
    await page.click('#btn-open-generic-modal');
    await expect(page.getByRole('heading', { name: 'Custom Confirmation Modal' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'Custom Confirmation Modal' })).not.toBeVisible();
  });
});
