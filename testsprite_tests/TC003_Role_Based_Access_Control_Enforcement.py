import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        pw = await async_api.async_playwright().start()
        
        # Removed --single-process as it is brittle and not recommended for production environments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host"
            ],
        )
        
        context = await browser.new_context()
        context.set_default_timeout(10000)
        
        page = await context.new_page()
        
        # Navigate and wait for stability
        await page.goto("http://localhost:3000", wait_until="networkidle", timeout=15000)
        
        # Navigate to Portal (Login page)
        # Using role-based selectors instead of brittle XPath
        portal_button = page.get_by_role("link", name="Portal")
        await expect(portal_button).to_be_visible()
        await portal_button.click()
        
        # Enter limited role user credentials
        # Selectors match the Login Page implementation
        await page.get_by_label("Email Address").fill('user@limited.role')
        await page.get_by_label("Password").fill('LimitedUserPass123')
        
        # Click Sign In
        sign_in_button = page.get_by_role("button", name="Sign In")
        await sign_in_button.click()
        
        # Verify landing on dashboard
        await expect(page).to_have_url(lambda url: "/dashboard" in url, timeout=10000)

        # Assertion: Verify that Admin-only elements are NOT visible for a limited user
        # We check both the text and potential links to admin pages
        admin_gate_text = page.get_by_text("Admin Access Granted")
        await expect(admin_gate_text).not_to_be_visible(timeout=5000)
        
        # Additionally check if the Admin Nav item is hidden
        admin_nav = page.get_by_role("link", name="Admin")
        await expect(admin_nav).not_to_be_visible(timeout=2000)

    except Exception as e:
        print(f"Test failed: {e}")
        raise e
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
if __name__ == "__main__":
    asyncio.run(run_test())