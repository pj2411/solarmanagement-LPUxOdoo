"""Shared pytest fixtures for SIMS.

The app uses a module-level async engine. TestClient spins up a fresh event
loop per test, so connections must be disposed between tests to avoid
'Event loop is closed' errors.
"""
import asyncio

import pytest
from fastapi.testclient import TestClient

from app.core.database import engine
from app.main import app


@pytest.fixture(autouse=True)
def dispose_engine_between_tests():
    yield
    asyncio.run(engine.dispose())


@pytest.fixture
def client():
    """In-process ASGI client — no separately running uvicorn required."""
    with TestClient(app) as c:
        yield c


@pytest.fixture
def admin_token(client):
    """Token for the seeded super admin (skips cleanly if DB isn't seeded)."""
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "admin@sims.com", "password": "Admin@12345"},
    )
    if response.status_code != 200:
        pytest.skip("Seeded admin not available in this database")
    return response.json()["data"]["access_token"]
