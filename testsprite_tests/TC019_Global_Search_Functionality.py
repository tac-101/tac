import asyncio
import os
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    # Use environment variables
    admin_email = os.getenv("TEST_ADMIN_EMAIL", "admin@tapango.logistics")
    admin_password = os.getenv("TEST_ADMIN_PASSWORD", "Test@1498")
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
        
        # 1. Login first to access the dashboard search
        print(f"Navigating to {base_url} / login...")
        await page.goto(f"{base_url}/login", wait_until="networkidle")
        
        await page.get_by_placeholder("name@example.com").fill(admin_email)
        await page.get_by_placeholder("••••••••").fill(admin_password)
        await page.get_by_role("button", name="Sign In").click()
        
        await expect(page.get_by_text("Dashboard").first).to_be_visible()
        print("Logged in successfully.")

        # 2. Navigate to Global Search
        print("Navigating to Search page...")
        # Assuming URL is /dashboard/search or via clicking sidebar
        await page.goto(f"{base_url}/dashboard/search", wait_until="networkidle")
        
        # 3. Perform Search
        search_input = page.get_by_placeholder("Search anything...")
        await search_input.fill("TAC-2024-001")
        await page.keyboard.press("Enter")
        print("Performed search for 'TAC-2024-001'.")

        # 4. Assert Results
        # Check for the result card with the ID
        await expect(page.get_by_text("TAC-2024-001").first).to_be_visible(timeout=10000)
        await expect(page.get_by_text("Electronics from Shenzhen").first).to_be_visible()
        print("Search successful: Result found.")
        
        await asyncio.sleep(2)
    
    except Exception as e:
        print(f"Test failed: {str(e)}")
        if page:
            await page.screenshot(path="test_failure_TC019.png")
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