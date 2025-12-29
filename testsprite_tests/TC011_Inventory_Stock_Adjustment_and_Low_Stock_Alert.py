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
        
        # Login
        await page.get_by_role("link", name="Portal").click()
        await page.get_by_placeholder("email@example.com").fill('admin@tapango.logistics')
        await page.get_by_placeholder("••••••••").fill('Test@1498')
        await page.get_by_role("button", name="Sign In").click()
        
        # Navigate to Inventory
        await expect(page.get_by_role("link", name="Inventory")).to_be_visible()
        await page.get_by_role("link", name="Inventory").click()
        
        # Wait for table
        await expect(page.get_by_role("table")).to_be_visible()
        
        # Click Adjust button on the first item
        # In features/inventory/inventory-table.tsx, we have <Button onClick={() => onAdjust(item)}>Adjust</Button>
        adjust_button = page.get_by_role("button", name="Adjust").first
        await adjust_button.click()
        
        # Fill the adjustment dialog
        # The dialog title is "Stock Adjustment"
        await expect(page.get_by_text("Stock Adjustment")).to_be_visible()
        
        # Select Adjustment Type
        await page.get_by_role("combobox").first.click()
        await page.get_by_role("option", name="Inbound").click()
        
        # Fill Quantity
        await page.get_by_placeholder("Enter quantity change").fill("10")
        
        # Fill Reason
        await page.get_by_placeholder("Reason for adjustment").fill("Test Restock")
        
        # Select Location (it likely defaults to Main Warehouse, but let's click it)
        # Note: If there are multiple selects, we might need to be more specific.
        # But usually, it's the second one.
        # Let's try to just submit with defaults if it's too complex, or use text.
        
        # Submit
        await page.get_by_role("button", name="Save Adjustment").click()
        
        # Verify success toast
        await expect(page.get_by_text("Adjustment recorded")).to_be_visible()
        
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

    