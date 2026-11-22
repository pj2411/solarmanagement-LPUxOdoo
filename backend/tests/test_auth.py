"""Authentication & RBAC tests."""


def test_login_with_valid_credentials_returns_tokens(client):
    r = client.post(
        "/api/v1/auth/login",
        json={"username": "admin@sims.com", "password": "Admin@12345"},
    )
    assert r.status_code == 200, r.text
    data = r.json()["data"]
    assert data["token_type"] == "bearer"
    assert data["access_token"] and data["refresh_token"]
    assert data["user"]["role"] == "super_admin"


def test_login_with_wrong_password_is_401(client):
    r = client.post(
        "/api/v1/auth/login",
        json={"username": "admin@sims.com", "password": "definitely-wrong"},
    )
    assert r.status_code == 401


def test_me_requires_token(client):
    assert client.get("/api/v1/auth/me").status_code == 401
