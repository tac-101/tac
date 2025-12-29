import requests
import time

BASE_URL = "http://localhost:3000"
INVENTORY_ENDPOINT = f"{BASE_URL}/api/inventory"
HEADERS = {
    "Content-Type": "application/json",
}

def test_inventory_post_endpoint_stock_adjustment_and_alerts():
    # Sample SKU to create for testing if not exists
    test_sku = "TEST-SKU-12345"
    test_location = "MainWarehouse"
    adjustment_types = ["inbound", "outbound", "adjustment", "cycle_count"]
    initial_quantity = 10

    # Helper function to get current stock for SKU and location
    def get_stock(sku, location=None):
        try:
            params = {"sku": sku}
            if location:
                params["location"] = location
            resp = requests.get(INVENTORY_ENDPOINT, params=params, headers=HEADERS, timeout=30)
            resp.raise_for_status()
            data = resp.json()
            # Assume response has "items" array or similar with stock info
            items = data.get("items") or data.get("inventory") or data.get("data") or []
            for item in items:
                if item.get("sku") == sku and (location is None or item.get("location") == location):
                    return item.get("quantity", 0)
            return None
        except Exception:
            return None

    # Ensure a test inventory item exists by performing an inbound stock adjustment with initial quantity
    try:
        # Create or reset stock to initial quantity via inbound adjustment
        payload_inbound = {
            "sku": test_sku,
            "adjustmentType": "inbound",
            "quantity": initial_quantity,
            "location": test_location,
            "reason": "Test setup - initial inbound",
        }
        resp = requests.post(INVENTORY_ENDPOINT, json=payload_inbound, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        assert resp.status_code == 200, "Failed to set initial inbound stock"

        # Validate adjustments for each adjustmentType
        for adj_type in adjustment_types:
            # Get stock before adjustment
            stock_before = get_stock(test_sku, test_location)
            assert stock_before is not None, f"Stock not found for SKU {test_sku} at {test_location}"

            # Determine adjustment quantity: positive for inbound and cycle_count, negative or positive for adjustment and outbound
            if adj_type == "inbound":
                adj_quantity = 5
            elif adj_type == "outbound":
                adj_quantity = 3
            elif adj_type == "adjustment":
                adj_quantity = -2  # negative adjustment
            elif adj_type == "cycle_count":
                adj_quantity = 0   # cycle count can act as stock verification, test zero change
            else:
                adj_quantity = 1

            payload = {
                "sku": test_sku,
                "adjustmentType": adj_type,
                "quantity": adj_quantity,
                "location": test_location,
                "reason": f"Test adjustment {adj_type}",
            }

            response = requests.post(INVENTORY_ENDPOINT, json=payload, headers=HEADERS, timeout=30)
            response.raise_for_status()
            assert response.status_code == 200, f"Stock adjustment failed for type {adj_type}"

            # After adjustment, get new stock
            stock_after = get_stock(test_sku, test_location)
            assert stock_after is not None, "Stock after adjustment not found"

            # Calculate expected stock
            if adj_type == "cycle_count":
                # Cycle count usually does not change stock but confirms it, assume no change expected
                expected_stock = stock_before
            else:
                expected_stock = stock_before + adj_quantity

            # stock_after can never be negative, if negative set to 0
            expected_stock = max(expected_stock, 0)

            assert stock_after == expected_stock, (
                f"Stock mismatch for adjustment type {adj_type}: "
                f"expected {expected_stock}, got {stock_after}"
            )

            # Check if low stock alert triggered when stock_after is low (e.g <5)
            if stock_after < 5:
                # Assuming low stock alert can be verified by fetching inventory with lowStock query param true
                alert_params = {"location": test_location, "lowStock": "true"}
                alert_resp = requests.get(INVENTORY_ENDPOINT, params=alert_params, headers=HEADERS, timeout=30)
                alert_resp.raise_for_status()
                alert_data = alert_resp.json()
                items_low_stock = alert_data.get("items") or alert_data.get("inventory") or alert_data.get("data") or []
                sku_found = any(item.get("sku") == test_sku and item.get("quantity", 0) == stock_after for item in items_low_stock)
                assert sku_found, f"Low stock alert not triggered for SKU {test_sku} with quantity {stock_after}"

    finally:
        # Cleanup: reset stock to initial quantity via adjustment inbound (if needed)
        try:
            # Get current stock to adjust back to initial_quantity if changed
            current_stock = get_stock(test_sku, test_location)
            if current_stock is not None and current_stock != initial_quantity:
                qty_diff = initial_quantity - current_stock
                adj_type = "adjustment" if qty_diff != 0 else "cycle_count"
                if qty_diff != 0:
                    reset_payload = {
                        "sku": test_sku,
                        "adjustmentType": adj_type,
                        "quantity": qty_diff,
                        "location": test_location,
                        "reason": "Test cleanup - reset stock",
                    }
                    reset_resp = requests.post(INVENTORY_ENDPOINT, json=reset_payload, headers=HEADERS, timeout=30)
                    reset_resp.raise_for_status()

        except Exception:
            # Silently ignore cleanup failures
            pass

test_inventory_post_endpoint_stock_adjustment_and_alerts()