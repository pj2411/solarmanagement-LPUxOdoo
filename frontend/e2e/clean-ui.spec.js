import { test, expect } from '@playwright/test';

test.describe('SunPower ERP - Clean UI Suite (No Top Bars / No Accordions)', () => {

  test('01. Clean Layout: Top Bars Removed, Direct Sidebar Navigation', async ({ page }) => {
    await page.goto('/');

    // 1. Verify NO bulky top bar exists (e.g. RoleSwitcher, Switch Persona, or sub-nav tabs)
    await expect(page.locator('text=Switch persona:')).not.toBeVisible();
    await expect(page.locator('text=SunPower ERP Standalone Pro')).not.toBeVisible();

    // 2. Verify clean minimal header bar (Breadcrumb + Actions only)
    await expect(page.getByText('SUNPOWER ERP', { exact: true })).toBeVisible();
    await expect(page.getByText('DASHBOARD', { exact: true })).toBeVisible();

    // 3. Verify direct sidebar navigation (All groups directly visible, no hamburger/accordions)
    await expect(page.getByText('WORKSPACE', { exact: true })).toBeVisible();
    await expect(page.getByText('OPERATIONS', { exact: true })).toBeVisible();
    await expect(page.getByText('SETUP', { exact: true })).toBeVisible();
    await expect(page.getByText('SYSTEM', { exact: true })).toBeVisible();

    // 4. Verify Dashboard contents
    const main = page.getByRole('main');
    await expect(main.getByText('Free to use')).toBeVisible();
    await expect(main.getByText('On hand')).toBeVisible();
    await expect(main.getByText('Receipts')).toBeVisible();
    await expect(main.getByText('Deliveries')).toBeVisible();

    // 5. Direct navigation to Stock without dropdown clicks
    await page.click('button:has-text("Stock")');
    await expect(page.locator('text=Live Hardware Inventory')).toBeVisible();

    // 6. Direct navigation to Move History
    await page.click('button:has-text("Move history")');
    await expect(page.locator('text=Warehouse Dispatch')).toBeVisible();

    // 7. Direct navigation back to Dashboard
    await page.click('button:has-text("Dashboard")');
    await expect(main.getByText('Dashboard')).toBeVisible();
  });

  test('02. Dark Mode and Quick Persona in Sidebar Footer', async ({ page }) => {
    await page.goto('/');

    // Toggle theme
    const themeBtn = page.locator('button[title="Toggle Theme"]');
    await themeBtn.click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await themeBtn.click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    // Verify persona selector in sidebar footer
    const roleSelect = page.locator('select[title="Change Persona"]');
    await expect(roleSelect).toBeVisible();
    await roleSelect.selectOption('WAREHOUSE');
    await expect(page.getByText('WAREHOUSE', { exact: true })).toBeVisible();
  });

});
