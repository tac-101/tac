import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_manifests_post_endpoint_create_update_manifest():
    url = f"{BASE_URL}/api/manifests"
    headers = {
        "Content-Type": "application/json"
    }
    payload_create = {
        "origin_hub": "DEL",
        "destination": "BOM",
        "airline_code": "AI",
        "flight_number": "AI123",
        "manifest_date": "2025-12-22"
    }

    try:
        # Create manifest
        response = requests.post(url, json=payload_create, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200 OK but got {response.status_code}"
        created_data = response.json()
        assert isinstance(created_data, dict), "Response JSON is not a dictionary"

        # Update manifest with changed flight number and date
        payload_update = payload_create.copy()
        payload_update["flight_number"] = "AI124"
        payload_update["manifest_date"] = "2025-12-23"

        response_update = requests.post(url, json=payload_update, headers=headers, timeout=TIMEOUT)
        assert response_update.status_code == 200, f"Expected 200 OK but got {response_update.status_code}"
        updated_data = response_update.json()
        assert isinstance(updated_data, dict), "Response JSON after update is not a dictionary"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_manifests_post_endpoint_create_update_manifest()