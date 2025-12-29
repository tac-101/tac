import asyncio
import os
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    # Use environment variables for credentials - NO HARDCODED DEFAULTS
    admin_email = os.getenv("TEST_ADMIN_EMAIL")
    admin_password = os.getenv("TEST_ADMIN_PASSWORD")
    
    if not admin_email or not admin_password:
        raise ValueError(
            "Test credentials not configured. Please set TEST_ADMIN_EMAIL and "
            "TEST_ADMIN_PASSWORD environment variables."
        )
    base_url = os.getenv("TEST_BASE_URL", "http://localhost:3000")

    try:
        pw = await async_api.async_playwright().start()
        
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
            ],
        )
        
        context = await browser.new_context()
        context.set_default_timeout(10000)
        
        page = await context.new_page()
        
        print(f"Navigating to {base_url}...")
        await page.goto(base_url, wait_until="networkidle", timeout=30000)
        
        # 1. Access the Portal
        # Use a more stable selector like text or role
        portal_button = page.get_by_role("button", name="Access Portal")
        if await portal_button.is_hidden():
            # Fallback if the button text is slightly different or wrapped
            portal_button = page.locator("button:has-text('Portal')").first
            
        await portal_button.click()
        print("Clicked 'Access Portal' button.")

        # 2. Fill Login Form
        # Since we removed hardcoded defaults in the UI, we must fill them here
        email_input = page.get_by_placeholder("name@example.com")
        password_input = page.get_by_placeholder("••••••••")
        
        await email_input.fill(admin_email)
        await password_input.fill(admin_password)
        print("Filled login credentials.")

        # 3. Click Sign In
        sign_in_button = page.get_by_role("button", name="Sign In")
        await sign_in_button.click()
        print("Clicked 'Sign In' button.")

        # 4. Assertions to verify final state
        # Usually dashboard or profile name is visible after login
        await expect(page.get_by_text("Dashboard").first).to_be_visible(timeout=15000)
        print("Login successful: Dashboard visible.")
        
        await asyncio.sleep(2)
    
    except Exception as e:
        print(f"Test failed: {str(e)}")
        # Take a screenshot on failure for debugging
        if page:
            await page.screenshot(path="test_failure_TC001.png")
        raise
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
if __name__ == "__main__":
    asyncio.run(run_test())
