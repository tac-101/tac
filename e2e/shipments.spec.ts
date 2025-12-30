import { test, expect } from "@playwright/test";

test.describe("Shipments", () => {

	test("TC004 - should create shipment with valid data", async ({ page }) => {
		await page.goto("/dashboard/shipments/new");
		await page.waitForLoadState("networkidle");
		
		await page.getByTestId("shipment-sender-name").fill("John Sender");
		await page.getByTestId("shipment-sender-phone").fill("9876543210");
		await page.getByTestId("shipment-receiver-name").fill("Jane Receiver");
		await page.locator('[data-testid="shipment-receiver-phone"], input[name="receiverPhone"]').fill("9123456789");
		
		await page.locator('button:has-text("Select origin")').click();
		await page.locator('[role="option"]:has-text("Imphal")').click();
		
		await page.locator('button:has-text("Select destination")').click();
		await page.locator('[role="option"]:has-text("Delhi")').click();
		
		await page.getByTestId("shipment-weight").fill("5");
		
		await page.getByTestId("shipment-submit-button").click();
		
		await expect(page).toHaveURL(/\/dashboard\/shipments$/, { timeout: 15000 });
	});

	test("TC005 - should show validation errors for missing required fields", async ({ page }) => {
		await page.goto("/dashboard/shipments/new");
		
		await page.getByTestId("shipment-submit-button").click();
		
		await expect(page.locator("text=Sender name is required")).toBeVisible();
	});

	test("should navigate to shipments list", async ({ page }) => {
		await page.goto("/dashboard/shipments");
		
		await expect(page.locator("h2:has-text('Shipments')")).toBeVisible();
		await expect(page.locator("text=New Shipment")).toBeVisible();
	});
});
