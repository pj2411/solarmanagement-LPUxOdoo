"""API-level smoke tests for the fixes: health, real warranty lookup, JSON-RPC bridge."""
from app.main import app  # noqa: F401 - ensures the app imports cleanly


def test_health_and_docs(client):
    assert client.get("/health").status_code == 200
    assert client.get("/docs").status_code == 200


def test_unknown_serial_returns_404(client):
    r = client.get("/api/v1/warranties/verify/DOES-NOT-EXIST-123")
    assert r.status_code == 404


def test_jsonrpc_create_lead(client):
    r = client.post(
        "/jsonrpc",
        json={
            "jsonrpc": "2.0",
            "method": "create_lead",
            "params": {"name": "JSON-RPC Test", "phone": "9000000099", "system_kw": 3},
            "id": 7,
        },
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["jsonrpc"] == "2.0"
    assert body["id"] == 7
    assert body["result"]["state"] == "new"


def test_jsonrpc_unknown_method(client):
    r = client.post("/jsonrpc", json={"method": "no_such_method", "id": 1})
    assert r.json()["error"]["code"] == -32601


def test_geofence_rejects_outside_checkin(client, admin_token):
    """Site check-in outside the 100 m fence must be a business-rule 409."""
    r = client.post(
        "/api/v1/employees/attendance/check-in",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "latitude": 28.6,
            "longitude": 77.2,
            "site_latitude": 19.0,
            "site_longitude": 72.0,
        },
    )
    assert r.status_code == 409
