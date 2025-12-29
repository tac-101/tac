import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

# Assume we have a function to get a valid token for authentication
def get_auth_token():
    # Placeholder: Implement actual auth to get token
    # For testing, you can hardcode a valid token or implement login API call
    return "Bearer valid_auth_token"

def test_invoices_create_endpoint_gst_compliance_and_invoice_creation():
    headers = {
        "Authorization": get_auth_token(),
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    # Use a valid existing customer Id for invoice creation (should be present in system)
    # Since creation of customer is not supported by REST API explicitly in PRD
    customer_id = "existing-valid-customer-uuid"
    invoice_id = None

    # Create an invoice with required fields and GST compliance fields
    invoice_payload = {
        "customer_id": customer_id,
        "freight_amount": 10000.00,
        "gst_percent": 18.0
    }
    res_invoice = requests.post(f"{BASE_URL}/api/invoices/create", json=invoice_payload, headers=headers, timeout=TIMEOUT)

    assert res_invoice.status_code == 200, f"Invoice creation failed with status {res_invoice.status_code}"
    json_res = res_invoice.json()
    # We expect the invoice creation response to at least confirm creation.
    if isinstance(json_res, dict):
        invoice_id = json_res.get("id") or json_res.get("invoiceId")
    assert "error" not in json_res, "API returned error in JSON response"
    if "gst_percent" in json_res:
        assert float(json_res["gst_percent"]) == 18.0, "GST percent mismatch in response"
    if "freight_amount" in json_res:
        assert float(json_res["freight_amount"]) == 10000.00, "Freight amount mismatch in response"

    # Clean up invoice if created
    if invoice_id:
        try:
            del_res = requests.delete(f"{BASE_URL}/api/invoices/{invoice_id}", headers=headers, timeout=TIMEOUT)
            assert del_res.status_code in [200,204], f"Failed to delete invoice {invoice_id}"
        except Exception:
            pass

# Call the test function

if __name__ == "__main__":
    test_invoices_create_endpoint_gst_compliance_and_invoice_creation()
