import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(10000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3000", wait_until="commit", timeout=15000)
        
        # Click on 'Portal' button to access login
        await page.get_by_role("link", name="Portal").click()
        
        # Input email and password, then click Sign In button
        await page.get_by_placeholder("email@example.com").fill('admin@tapango.logistics')
        await page.get_by_placeholder("••••••••").fill('Test@1498')
        await page.get_by_role("button", name="Sign In").click()
        
        # Wait for dashboard and navigation to Invoices
        # The sidebar might take a moment to load role-based items
        await expect(page.get_by_role("link", name="Invoices")).to_be_visible()
        await page.get_by_role("link", name="Invoices").click()
        
        # Interacting with the Invoices Table
        # Wait for the table to lead
        await expect(page.get_by_role("table")).to_be_visible()
        
        # Open actions for the first invoice
        # Using row locator to be more specific, but for now matching the first action button
        action_button = page.get_by_role("button", name="Open actions").first
        await action_button.click()
        
        # Click on 'Send WhatsApp' option
        await page.get_by_role("menuitem", name="Send WhatsApp").click()
        
        # Assertions to verify final state
        # The app renders "WhatsApp: SENT" status in the table cell upon success
        await expect(page.get_by_text("WhatsApp: SENT").first).to_be_visible(timeout=30000)
        
        # Clean up some time for visual verification if needed (not in headless typically but good for logs)
        await asyncio.sleep(2)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
if __name__ == "__main__":
    asyncio.run(run_test())

    