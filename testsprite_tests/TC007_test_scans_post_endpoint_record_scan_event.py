import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

# Dummy auth token placeholder if authentication is required (adjust if needed)
AUTH_TOKEN = None

def test_scans_post_endpoint_record_scan_event():
    headers = {
        "Content-Type": "application/json"
    }
    if AUTH_TOKEN:
        headers["Authorization"] = f"Bearer {AUTH_TOKEN}"

    # Prepare a unique barcode for testing to avoid collision
    barcode = f"TEST-{uuid.uuid4()}"
    scan_event = {
        "barcode": barcode,
        "scanType": "DELIVERY",
        "location": "DELHI-HUB",
        "operatorId": "operator-123"
    }

    try:
        response = requests.post(
            f"{BASE_URL}/api/scans",
            json=scan_event,
            headers=headers,
            timeout=TIMEOUT
        )
        assert response.status_code == 200, f"Expected 200 but got {response.status_code}"
        # Response body not strictly defined in PRD for content, so at least check not empty
        assert response.content, "Response body is empty"
    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

test_scans_post_endpoint_record_scan_event()