import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
HEADERS = {
    "Content-Type": "application/json",
}

def get_auth_token():
    # Placeholder for authentication token retrieval logic
    # For example, login and get bearer token or use a preset token
    # Return None if no auth or replace with actual token string
    # Assuming token-based auth for protected endpoints as per PRD (Supabase Auth)
    return None

def create_customer():
    url = f"{BASE_URL}/api/customers/update"
    # Since no create endpoint is described explicitly, we create a dummy customer by calling update with a new id
    new_id = str(uuid.uuid4())
    payload = {
        "id": new_id,
        "name": "Test Customer",
        "phone": "9999999999",
        "email": "testcustomer@example.com",
        "address": "123 Test Street",
        "city": "Testville",
        "gst_number": "22AAAAA0000A1Z5"
    }
    headers = HEADERS.copy()
    token = get_auth_token()
    if token:
        headers["Authorization"] = f"Bearer {token}"
    resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    resp.raise_for_status()
    return new_id

def delete_customer(customer_id):
    # No delete endpoint specified in PRD for customers.
    # So cleanup may not be possible, skip or extend if delete exists.
    pass

def test_customers_update_endpoint_modify_customer_details():
    token = get_auth_token()
    headers = HEADERS.copy()
    if token:
        headers["Authorization"] = f"Bearer {token}"

    # Create new customer resource to update
    customer_id = None
    try:
        customer_id = create_customer()

        update_url = f"{BASE_URL}/api/customers/update"
        update_payload = {
            "id": customer_id,
            "name": "Updated Customer Name",
            "phone": "8888888888",
            "email": "updatedemail@example.com",
            "address": "456 Updated Avenue",
            "city": "Update City",
            "gst_number": "22BBBBB1111B2Z6"
        }

        response = requests.post(update_url, json=update_payload, headers=headers, timeout=TIMEOUT)

        # Assert status code 200
        assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"

        # Optionally, validate response content if any (not defined in PRD)
        # Just check body is not error
        resp_json = response.json()
        assert isinstance(resp_json, (dict, list)) or resp_json == "", "Response JSON must be dict, list or empty"

    finally:
        if customer_id:
            delete_customer(customer_id)

test_customers_update_endpoint_modify_customer_details()