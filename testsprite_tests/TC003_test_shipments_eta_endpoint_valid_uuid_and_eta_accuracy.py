import requests
import uuid
import datetime

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
HEADERS = {
    "Content-Type": "application/json"
}

def create_shipment():
    url = f"{BASE_URL}/api/shipments/protected"
    # Based on the PRD, no direct create shipment endpoint is elaborated,
    # but shipment creation likely uses POST to /api/shipments/protected
    # with properties origin, destination, transport_mode (per goals)
    payload = {
        "origin": "Mumbai",
        "destination": "Delhi",
        "transport_mode": "air"
    }
    try:
        resp = requests.post(url, json=payload, headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        shipment_id = data.get("id")
        assert shipment_id and uuid.UUID(shipment_id)
        return shipment_id
    except Exception as e:
        raise RuntimeError(f"Failed to create shipment: {e}")

def delete_shipment(shipment_id):
    url = f"{BASE_URL}/api/shipments/{shipment_id}"
    try:
        resp = requests.delete(url, headers=HEADERS, timeout=TIMEOUT)
        # Delete may return 204 No Content or 200 OK - accept success codes
        if resp.status_code not in (200, 204):
            raise RuntimeError(f"Failed to delete shipment {shipment_id}: status {resp.status_code}")
    except Exception as e:
        # Log or ignore failures in cleanup
        pass

def test_shipments_eta_endpoint_valid_uuid_and_eta_accuracy():
    shipment_id = None
    # Create shipment before testing ETA endpoint
    shipment_id = create_shipment()
    try:
        url = f"{BASE_URL}/api/shipments/{shipment_id}/eta"
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        assert "shipment" in data, "Response JSON missing 'shipment' key"
        shipment = data["shipment"]
        # Validate shipment fields and types
        assert shipment.get("id") == shipment_id, "Shipment ID mismatch"
        assert isinstance(shipment.get("shipment_ref"), str), "shipment_ref missing or not string"
        assert isinstance(shipment.get("origin"), str) and shipment["origin"], "origin missing or empty"
        assert isinstance(shipment.get("destination"), str) and shipment["destination"], "destination missing or empty"
        assert isinstance(shipment.get("status"), str), "status missing or not string"
        progress = shipment.get("progress")
        assert isinstance(progress, int) and 0 <= progress <= 100, "progress must be int 0-100"
        eta_str = shipment.get("eta")
        assert isinstance(eta_str, str), "eta missing or not string"

        # Check eta datetime format and accuracy: must be a valid ISO 8601 date-time string
        eta_dt = datetime.datetime.fromisoformat(eta_str.replace("Z", "+00:00"))
        now = datetime.datetime.now(tz=eta_dt.tzinfo)
        # ETA should be in the future - allow some tolerance (e.g. at least 1 min ahead)
        assert eta_dt > now, "ETA datetime is not in the future"

    finally:
        if shipment_id:
            delete_shipment(shipment_id)

test_shipments_eta_endpoint_valid_uuid_and_eta_accuracy()