import requests
import time

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_auth_session_endpoint_response_time_and_data_integrity():
    url = f"{BASE_URL}/api/auth/session"
    headers = {
        "Accept": "application/json"
    }

    start_time = time.time()
    try:
        response = requests.get(url, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to {url} failed: {e}"
    duration_ms = (time.time() - start_time) * 1000

    # Assert response time under 500ms
    assert duration_ms <= 500, f"Response took {duration_ms:.2f}ms, exceeding 500ms limit"

    # Assert HTTP status code 200
    assert response.status_code == 200, f"Expected status 200 but got {response.status_code}"

    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Validate presence and type of 'user' and 'session' objects
    assert isinstance(data, dict), "Response JSON is not an object"
    assert "user" in data, "'user' key missing in response"
    assert "session" in data, "'session' key missing in response"
    assert isinstance(data["user"], dict), "'user' is not an object"
    assert isinstance(data["session"], dict), "'session' is not an object"

    # Additional sanity checks: user and session should not be empty objects
    assert data["user"], "'user' object is empty"
    assert data["session"], "'session' object is empty"


test_auth_session_endpoint_response_time_and_data_integrity()