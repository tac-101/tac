import asyncio
import os
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    # Use environment variables for URL to avoid hardcoding
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
        portal_button = page.get_by_role("button", name="Access Portal")
        if await portal_button.is_hidden():
            portal_button = page.locator("button:has-text('Portal')").first
            
        await portal_button.click()
        print("Clicked 'Access Portal' button.")

        # 2. Fill Login Form with INVALID credentials
        email_input = page.get_by_placeholder("name@example.com")
        password_input = page.get_by_placeholder("••••••••")
        
        await email_input.fill("nonexistent@user.com")
        await password_input.fill("WrongPassword123!")
        print("Filled invalid login credentials.")

        # 3. Click Sign In
        sign_in_button = page.get_by_role("button", name="Sign In")
        await sign_in_button.click()
        print("Clicked 'Sign In' button.")

        # 4. Assertions to verify failure state
        # The login page should show an error message or toast
        # Depending on implementation, look for 'Invalid' or remains on login
        # For now, we expect NOT to see Dashboard
        await expect(page.get_by_text("Dashboard")).not_to_be_visible(timeout=5000)
        
        # Check for error toast if possible
        # await expect(page.get_by_text("Invalid credentials")).to_be_visible(timeout=5000)
        
        print("Login denied as expected.")
        
        await asyncio.sleep(2)
    
    except Exception as e:
        print(f"Test failed or unexpected behavior: {str(e)}")
        if page:
            await page.screenshot(path="test_failure_TC002.png")
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