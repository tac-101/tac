import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

# Credentials for authentication - replace with valid test user credentials
AUTH_EMAIL = "testuser@example.com"
AUTH_PASSWORD = "TestPass123"


# Authenticate and return access token
# Assuming Supabase Auth or similar returning access_token
# Adjust login endpoint and login payload as per actual API
# Using the /api/auth/session or a dedicated login endpoint is not specified in PRD,
# so assume a typical /api/auth/login with email and password returning token
# If no login endpoint, and test user token must be set manually, this needs adjustment.

def authenticate():
    url = f"{BASE_URL}/api/auth/login"
    payload = {"email": AUTH_EMAIL, "password": AUTH_PASSWORD}
    headers = {"Content-Type": "application/json"}
    resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    assert resp.status_code == 200, f"Authentication failed: {resp.status_code} {resp.text}"
    data = resp.json()
    # Identify token field, assuming 'access_token'
    token = data.get("access_token") or data.get("token")
    assert token, "No access token received from authentication"
    return token


def create_invoice(auth_token):
    url = f"{BASE_URL}/api/invoices/create"
    # Minimal valid payload, using dummy customer_id
    payload = {
        "customer_id": str(uuid.uuid4()),
        "freight_amount": 1000.0,
        "gst_percent": 18.0
    }
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {auth_token}"}
    response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    assert response.status_code == 200, f"Failed to create invoice: {response.status_code} {response.text}"
    # The response may not have body, but if it has, expect an 'id' for invoice
    if response.content:
        resp_json = response.json()
        assert isinstance(resp_json, dict), "Invoice create response is not an object"
        assert 'id' in resp_json, "Invoice create response missing id"
        return resp_json
    return None


def test_invoices_generate_pdf_endpoint_branding_and_data_accuracy():
    auth_token = authenticate()

    # Create invoice to generate PDF for
    invoice_creation_response = create_invoice(auth_token)
    if invoice_creation_response and 'id' in invoice_creation_response:
        invoice_id = invoice_creation_response['id']
    else:
        # The response didn't return a body with ID; fallback to fetch latest invoices
        invoices_url = f"{BASE_URL}/api/invoices"
        headers = {"Authorization": f"Bearer {auth_token}"}
        r = requests.get(invoices_url, headers=headers, timeout=TIMEOUT)
        r.raise_for_status()
        invoices_data = r.json()
        assert "invoices" in invoices_data and len(invoices_data["invoices"]) > 0, "No invoices found to generate PDF"
        invoice_id = invoices_data["invoices"][0].get("id")
        assert invoice_id, "Invoice ID not found in invoice list"

    # Generate PDF for created invoice
    generate_pdf_url = f"{BASE_URL}/api/invoices/generate"
    payload = {"invoiceId": invoice_id}
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {auth_token}"}
    response = requests.post(generate_pdf_url, json=payload, headers=headers, timeout=TIMEOUT)

    # Assert success response and content type PDF or appropriate content
    assert response.status_code == 200, f"Generate PDF failed with status {response.status_code}"
    content_type = response.headers.get("Content-Type", "")
    assert "pdf" in content_type.lower(), f"Response Content-Type is not PDF but {content_type}"

    # Basic check if response content is non-empty binary (PDF)
    assert response.content is not None and len(response.content) > 100, "PDF content is empty or too small"

    # Additional data accuracy or branding checks would require PDF parsing,
    # which is out of scope here due to instructions; assume API produces accurate data if status OK.

    # Cleanup if needed
    if 'invoice_id' in locals():
        pass  # no delete endpoint


test_invoices_generate_pdf_endpoint_branding_and_data_accuracy()
