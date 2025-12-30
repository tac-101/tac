import { test, expect } from "@playwright/test";

test.describe("Invoices", () => {

	test("TC012 - should create invoice with GST calculations", async ({ page }) => {
		await page.goto("/dashboard/invoices/new");
		
		await page.locator('button:has-text("Select customer")').click();
		await page.locator('[role="option"]').first().click();
		
		await page.locator('input[name="freightAmount"]').fill("1000");
		await page.locator('input[name="handlingCharges"]').fill("100");
		
		const summary = page.locator("text=Invoice Summary").locator("..");
		await expect(summary.locator("text=Total Amount")).toBeVisible();
		
		await page.getByTestId("invoice-submit-button").click();
		
		await expect(page).toHaveURL(/\/dashboard\/invoices$/, { timeout: 15000 });
	});

	test("should navigate to invoices list", async ({ page }) => {
		await page.goto("/dashboard/invoices");
		
		await expect(page.locator("h2:has-text('Invoices')")).toBeVisible();
		await expect(page.locator("text=New Invoice")).toBeVisible();
	});

	test("should display GST calculations in real-time", async ({ page }) => {
		await page.goto("/dashboard/invoices/new");
		
		await page.locator('input[name="freightAmount"]').fill("1000");
		
		const gstRow = page.locator("text=GST (18%)").locator("..");
		await expect(gstRow).toContainText("180");
	});
});
