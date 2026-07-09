import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const routes = [
  '/',
  '/CreatePlan',
  '/CRM/Audit',
  '/CRM/Customer/CreateCustomer',
  '/CRM/CustomerFilter/Index',
  '/CRM/Index',
  '/CRM/Order/CreateOrder',
  '/Error',
  '/Privacy',
  '/Production/Completed',
  '/Production/Create',
  '/Production/Customer/CreateCustomer',
  '/Production/Customer/Customers',
  '/Production/Drafts',
  '/Production/Index',
  '/Production/InHouse/CreateInHouse',
  '/Production/InProgress',
  '/Production/Outlet/CreateOutlet',
  '/Production/Outlet/Outlets',
  '/Production/Plan/CreateDetails',
  '/Production/Plan/Details',
  '/Production/Plan/Edit',
  '/Production/Plan/PlansDetails',
  '/Production/Plan/StageUpdate',
  '/Warehouse/Index',
  '/Warehouse/Stock',
  '/Warehouse/Visualization'
];

for (const route of routes) {
  test(`Deep test for route ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => {
      errors.push(`Page error: ${err.message}`);
    });
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(`Console error: ${msg.text()}`);
      }
    });

    const response = await page.goto(route, { waitUntil: 'networkidle' });
    if (response) {
      expect(response.status()).toBeLessThan(400);
    }

    // 1. Basic rendering
    await expect(page.locator('body')).toBeVisible();

    // 2. Generic Interaction: Fill all visible text inputs
    const textInputs = page.locator('input[type="text"], input[type="email"], input[type="number"], textarea');
    const inputCount = await textInputs.count();
    for (let i = 0; i < inputCount; i++) {
      const input = textInputs.nth(i);
      if (await input.isVisible() && await input.isEditable()) {
        try {
          await input.fill('test value', { timeout: 2000 });
        } catch (e) {
          // ignore if not fillable
        }
      }
    }

    // 3. Generic Interaction: Select first option in dropdowns
    const selects = page.locator('select');
    const selectCount = await selects.count();
    for (let i = 0; i < selectCount; i++) {
      const select = selects.nth(i);
      if (await select.isVisible()) {
        try {
          // Select by index 1 (usually first real option if 0 is placeholder)
          await select.selectOption({ index: 1 }, { timeout: 2000 });
        } catch (e) {
          // fallback
        }
      }
    }

    // 4. Look for action buttons like Save, Create, Submit, Search
    const actionButtons = page.locator('button:has-text("Save"), button:has-text("Submit"), button:has-text("Create"), button:has-text("Add"), button:has-text("Search")');
    if (await actionButtons.count() > 0) {
      const firstBtn = actionButtons.nth(0);
      if (await firstBtn.isVisible() && await firstBtn.isEnabled()) {
        try {
           // We intercept navigation to prevent leaving the page if it's a form submit
           await Promise.race([
             page.waitForNavigation({ timeout: 2000 }).catch(() => {}), // ignore timeout
             firstBtn.click({ timeout: 2000 })
           ]);
        } catch (e) {
          // Ignore click failures
        }
      }
    }

    // Wait a bit to catch async errors after interactions
    await page.waitForTimeout(1000);

    // 5. Final assertion: check for hydration or interaction crash errors
    const criticalErrors = errors.filter(e => 
      e.includes('Hydration') || 
      e.includes('Minified React error') ||
      e.includes('TypeError')
    );
    expect(criticalErrors, `Critical errors found during deep interaction: ${criticalErrors.join(', ')}`).toHaveLength(0);

    // 6. Screenshot after interaction
    const safeName = route === '/' ? 'home' : route.replace(/\//g, '_');
    const screenshotDir = path.join(__dirname, '..', 'playwright-report', 'screenshots_deep');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    await page.screenshot({ path: path.join(screenshotDir, `${safeName}_after_interaction.png`), fullPage: true });
  });
}
