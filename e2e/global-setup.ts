import { chromium, FullConfig } from "@playwright/test";

const AUTH_FILE = "e2e/.auth/user.json";

async function globalSetup(config: FullConfig) {
	const { baseURL } = config.projects[0].use;
	const browser = await chromium.launch();
	const page = await browser.newPage();

	await page.goto(`${baseURL}/login`);
	await page.getByTestId("login-email-input").fill("testadmin@tapan-cargo.test");
	await page.getByTestId("login-password-input").fill("TestAdmin2024!");
	await page.getByTestId("login-submit-button").click();

	await page.waitForURL(/\/dashboard/, { timeout: 30000 });

	await page.context().storageState({ path: AUTH_FILE });
	await browser.close();
}

export default globalSetup;
