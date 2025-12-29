import requests
import time

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

# Credentials for test users with different roles.
# These would normally be securely stored or injected.
TEST_USERS = [
    {
        "email": "admin@example.com",
        "password": "AdminPass123!",
        "expected_role": "admin"
    },
    {
        "email": "manager@example.com",
        "password": "ManagerPass123!",
        "expected_role": "manager"
    },
    {
        "email": "operator@example.com",
        "password": "OperatorPass123!",
        "expected_role": "operator"
    }
]

def login_and_get_token(email, password):
    # According to the PRD, /api/auth/session supports GET to get current session only.
    # The test code was using POST to /api/auth/session to login which is incorrect.
    # Hence, we replace login with a GET request to fetch existing session token.
    # Since no login API is defined, this may not yield a token unless pre-authenticated.
    login_url = f"{BASE_URL}/api/auth/session"
    try:
        resp = requests.get(login_url, timeout=TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        token = None
        if "session" in data and data["session"]:
            if "access_token" in data["session"]:
                token = data["session"]["access_token"]
        return token
    except Exception:
        return None

def test_auth_getcurrentuser_endpoint_role_based_access():
    get_current_user_url = f"{BASE_URL}/api/auth/getCurrentUser"
    for user in TEST_USERS:
        token = login_and_get_token(user["email"], user["password"])
        assert token is not None, f"Login failed for user {user['email']}"
        headers = {
            "Authorization": f"Bearer {token}"
        }
        start_time = time.perf_counter()
        response = requests.get(get_current_user_url, headers=headers, timeout=TIMEOUT)
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        assert response.status_code == 200, f"Expected 200 OK for user {user['email']} but got {response.status_code}"
        assert elapsed_ms <= 500, f"Response time exceeded 500ms for user {user['email']} ({elapsed_ms:.2f}ms)"
        user_data = response.json()
        # Validate required fields presence
        for field in ("id", "email", "name", "role", "location"):
            assert field in user_data, f"Missing '{field}' in response for user {user['email']}"
        assert user_data["email"].lower() == user["email"].lower(), f"Email mismatch for user {user['email']}"
        assert user_data["role"].lower() == user["expected_role"], f"Role mismatch: expected {user['expected_role']} got {user_data['role']} for user {user['email']}"
        # location should be non-empty string
        assert isinstance(user_data["location"], str) and user_data["location"].strip(), f"Invalid location for user {user['email']}"

    # Test unauthorized access: no token
    response = requests.get(get_current_user_url, timeout=TIMEOUT)
    assert response.status_code in (401, 403), "Unauthorized access without token should be denied"

test_auth_getcurrentuser_endpoint_role_based_access()
