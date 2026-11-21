import { test, expect } from '@playwright/test';

test.describe('SunPower Solar ERP End-to-End Test Suite', () => {

  test('01. Public Website & Interactive Solar Savings Calculator', async ({ page }) => {
    await page.goto('/');

    // Check title and header branding
    await expect(page).toHaveTitle(/SunPower ERP/);
    await expect(page.locator('h1').first()).toContainText('SunPower ERP');

    // Verify calculator exists and default values calculate
    const slider = page.locator('input[type="range"]');
    await expect(slider).toBeVisible();

    // Change slider value
    await slider.fill('8000');
    // Verify recommended size updates
    await expect(page.locator('text=Recommended Size')).toBeVisible();
    await expect(page.locator('text=Monthly Savings')).toBeVisible();

    // Verify On-Grid vs Off-Grid toggle
    const offGridBtn = page.locator('button:has-text("Off-Grid (Battery Storage)")');
    await offGridBtn.click();
    await expect(page.locator('text=24x7 Power Backup')).toBeVisible();
  });

  test('02. Top-bar 1-Click Role Switcher navigation', async ({ page }) => {
    await page.goto('/');

    // Switch to Sales persona
    const salesBtn = page.locator('button:has-text("Sales & Survey")');
    await salesBtn.click();
    await expect(page.locator('text=Active Role: Sales & Survey')).toBeVisible();

    // Switch to Field Technician
    const techBtn = page.locator('button:has-text("Field Technician")');
    await techBtn.click();
    await expect(page.locator('text=Active Role: Field Technician')).toBeVisible();
    await expect(page.locator('h2:has-text("Field Installation")')).toBeVisible();

    // Switch to Director / Admin
    const adminBtn = page.locator('button:has-text("Director / Admin")');
    await adminBtn.click();
    await expect(page.locator('text=Active Role: Director / Admin')).toBeVisible();
  });

  test('03. Customer CRM & Homeowner Portal', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("3. Customer Management")');

    // Verify customer leads loaded
    await expect(page.locator('text=Arvind Sharma')).toBeVisible();
    await expect(page.locator('text=Sunita Rao')).toBeVisible();
    await expect(page.locator('text=Rajesh Mehta')).toBeVisible();

    // Switch to Homeowner Self-Service Portal View
    await page.click('button:has-text("Customer Self-Service Portal View")');
    await expect(page.locator('text=Viewing Homeowner Portal as:')).toBeVisible();
    await expect(page.locator('text=Project Lifecycle Progress')).toBeVisible();
  });

  test('04. Site Survey & Gatekeeper Protocol', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("4. Site Surveys")');

    await expect(page.locator('text=Rooftop Site Survey Management')).toBeVisible();
    await expect(page.locator('text=FastAPI Gatekeeper Rule #1 Enforced')).toBeVisible();

    // Check survey records
    await expect(page.locator('text=Survey #1')).toBeVisible();
    await expect(page.locator('text=Survey Approved').first()).toBeVisible();
  });

  test('05. Quotation Engine & Turnkey BoM Calculation', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("5. Quotations")');

    await expect(page.locator('text=Quotation & Turnkey Pricing Engine')).toBeVisible();
    // Verify BoM breakdown is computed
    await expect(page.locator('text=Deterministic Bill of Materials (BoM) Calculation')).toBeVisible();

    // Change system capacity to 4 kW
    await page.click('button:has-text("4 kW")');
    await expect(page.locator('text=4 kW ON_GRID')).toBeVisible();
  });

  test('06. Inventory Stock Ledger & Reorder Alerts', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("7. Inventory & BoM")');

    await expect(page.locator('text=Live Hardware Inventory')).toBeVisible();
    await expect(page.locator('text=PNL-MONO-540W')).toBeVisible();
    await expect(page.locator('text=INV-GT-3KW')).toBeVisible();
    await expect(page.locator('text=BAT-TUB-150AH')).toBeVisible();

    // Check BoM kits tab
    await page.click('button:has-text("Pre-Configured BoM Kits")');
    await expect(page.locator('text=3 kW Rooftop On-Grid Solar Package')).toBeVisible();
  });

  test('07. Zero-Click Warranty Triage in Service Helpdesk (Rule 4)', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("11. Service Helpdesk")');

    await expect(page.locator('text=Service, Maintenance & Helpdesk')).toBeVisible();

    // Verify Active Inverter Serial shows Green ₹0 Free Repair Banner
    const serialSelect = page.locator('select').nth(1);
    await serialSelect.selectOption('INV-2025-0518');
    await expect(page.locator('text=UNDER ACTIVE WARRANTY — ₹0 FREE COMPONENT REPAIR / REPLACEMENT')).toBeVisible();
    await expect(page.locator('text=₹0').first()).toBeVisible();

    // Verify Expired Battery Serial shows Red Auto-Billed Invoice Banner
    await serialSelect.selectOption('BAT-2023-0104');
    await expect(page.locator('text=WARRANTY EXPIRED — AUTO-BILLED CUSTOMER INVOICE')).toBeVisible();
  });

  test('08. Executive Financial Analytics & Dynamic Project P&L (Rule 5)', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("13. Admin & Dynamic P&L")');

    await expect(page.locator('text=Executive Financial & Dynamic Job P&L Analytics')).toBeVisible();
    await expect(page.locator('text=Total Collected Revenue')).toBeVisible();
    await expect(page.locator('text=Itemized Project Job-Costing Ledger')).toBeVisible();

    // Check project rows
    await expect(page.locator('td:has-text("Arvind Sharma")').first()).toBeVisible();
    await expect(page.locator('td:has-text("Sunita Rao")').first()).toBeVisible();

    // Verify CSV export button exists
    const exportBtn = page.locator('button:has-text("Export P&L Report (CSV)")');
    await expect(exportBtn).toBeVisible();
  });

});
