import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
	test("TC001 - should login with valid credentials", async ({ page }) => {
		await page.goto("/login");

		const email = process.env.TEST_USER_EMAIL || "admin@tapango.logistics";
		const password = process.env.TEST_USER_PASSWORD || "TestAdmin2024!";

		await page.getByTestId("login-email-input").fill(email);
		await page.getByTestId("login-password-input").fill(password);
		await page.getByTestId("login-submit-button").click();

		await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
	});

	test("TC002 - should show error with invalid credentials", async ({ page }) => {
		await page.goto("/login");

		await page.getByTestId("login-email-input").fill("invalid@test.com");
		await page.getByTestId("login-password-input").fill("wrongpassword");
		await page.getByTestId("login-submit-button").click();

		await expect(page.getByTestId("login-error")).toBeVisible({ timeout: 10000 });
	});

	test("TC003 - should redirect unauthenticated users to login", async ({ page }) => {
		await page.goto("/dashboard");

		await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
	});
});
