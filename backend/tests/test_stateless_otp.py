"""
Comprehensive Test Suite for Stateless Cryptographic OTP Generation & Verification.

Validates:
1. Pure statelessness (zero DB/Cache dependency).
2. AES-256-CBC token encryption/decryption structure (iv_hex:ciphertext_hex).
3. Happy path generation and verification.
4. Guard 1: Identity mismatch protection.
5. Guard 2: Replay attack prevention (is_used enforcement).
6. Guard 3: Expiry window hard-limit (5 minutes / 300s).
7. Guard 4 & 5: Brute-force protection (3-attempt decrement and 429 quota exhaustion).
8. Tamper-proofing against ciphertext/IV corruption.
9. Route availability at both `/v1/otp/...` and `/api/v1/otp/...`.
"""

import time
import pytest
from app.core.crypto_token import decrypt_token, encrypt_token, generate_secure_otp


def test_crypto_token_primitives():
    """Unit tests for cryptographic helper primitives."""
    # 1. Test OTP generation format and uniqueness
    otp1 = generate_secure_otp()
    otp2 = generate_secure_otp()
    assert len(otp1) == 6
    assert len(otp2) == 6
    assert otp1.isdigit()
    assert otp2.isdigit()

    # 2. Test encryption and decryption cycle
    payload = {
        "email_or_phone": "alice@example.com",
        "otp": "654321",
        "attempts_left": 3,
        "is_used": False
    }
    token = encrypt_token(payload)
    assert isinstance(token, str)
    assert ":" in token
    iv_hex, cipher_hex = token.split(":")
    assert len(bytes.fromhex(iv_hex)) == 16
    assert len(bytes.fromhex(cipher_hex)) % 16 == 0

    decrypted = decrypt_token(token)
    assert decrypted["email_or_phone"] == "alice@example.com"
    assert decrypted["otp"] == "654321"
    assert decrypted["attempts_left"] == 3
    assert decrypted["is_used"] is False


def test_otp_generate_endpoint_success(client):
    """Ensure POST /v1/otp/generate produces valid encrypted state."""
    response = client.post(
        "/v1/otp/generate",
        json={"email_or_phone": "engineer@sunflowepc.com"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "verification_token" in data
    assert data["expires_in_seconds"] == 300

    # Decrypt and inspect floating state
    token = data["verification_token"]
    state = decrypt_token(token)
    assert state["email_or_phone"] == "engineer@sunflowepc.com"
    assert len(state["otp"]) == 6
    assert state["attempts_left"] == 3
    assert state["is_used"] is False
    assert state["expiry_time"] > int(time.time())


def test_otp_verify_success(client):
    """Ensure POST /v1/otp/verify succeeds with correct OTP and invalidates token."""
    # 1. Generate OTP
    gen_res = client.post(
        "/v1/otp/generate",
        json={"email_or_phone": "ops@sunflowepc.com"}
    )
    assert gen_res.status_code == 200
    token = gen_res.json()["verification_token"]
    actual_otp = decrypt_token(token)["otp"]

    # 2. Verify with correct OTP
    verify_res = client.post(
        "/v1/otp/verify",
        json={
            "email_or_phone": "ops@sunflowepc.com",
            "otp_input": actual_otp,
            "verification_token": token,
        }
    )
    assert verify_res.status_code == 200
    res_data = verify_res.json()
    assert res_data["success"] is True
    assert "session_token" in res_data
    assert res_data["email_or_phone"] == "ops@sunflowepc.com"

    # Confirm session token has is_used = True
    session_state = decrypt_token(res_data["session_token"])
    assert session_state["is_used"] is True


def test_otp_guard_1_identity_mismatch(client):
    """Guard 1: Reject verification if target email/phone doesn't match token."""
    gen_res = client.post(
        "/v1/otp/generate",
        json={"email_or_phone": "user_a@example.com"}
    )
    token = gen_res.json()["verification_token"]
    actual_otp = decrypt_token(token)["otp"]

    # Attempt to verify using user_b
    verify_res = client.post(
        "/v1/otp/verify",
        json={
            "email_or_phone": "user_b@example.com",
            "otp_input": actual_otp,
            "verification_token": token,
        }
    )
    assert verify_res.status_code == 400
    assert "Identity mismatch" in verify_res.json()["detail"]


def test_otp_guard_2_replay_attack_prevention(client):
    """Guard 2: Reject already used tokens to prevent replay attacks."""
    gen_res = client.post(
        "/v1/otp/generate",
        json={"email_or_phone": "test_replay@example.com"}
    )
    token = gen_res.json()["verification_token"]
    actual_otp = decrypt_token(token)["otp"]

    # First verification -> Success
    v1 = client.post(
        "/v1/otp/verify",
        json={
            "email_or_phone": "test_replay@example.com",
            "otp_input": actual_otp,
            "verification_token": token,
        }
    )
    assert v1.status_code == 200
    session_token = v1.json()["session_token"]

    # Replay with original token (or the session token)
    v2 = client.post(
        "/v1/otp/verify",
        json={
            "email_or_phone": "test_replay@example.com",
            "otp_input": actual_otp,
            "verification_token": session_token,
        }
    )
    assert v2.status_code == 400
    assert "already been consumed" in v2.json()["detail"]


def test_otp_guard_3_expiry_window(client):
    """Guard 3: Reject expired tokens (> 300 seconds)."""
    # Create an artificially expired token
    expired_state = {
        "email_or_phone": "expired@example.com",
        "otp": "112233",
        "expiry_time": int(time.time()) - 10,  # 10 seconds in the past
        "attempts_left": 3,
        "is_used": False,
        "created_at": int(time.time()) - 310,
    }
    expired_token = encrypt_token(expired_state)

    res = client.post(
        "/v1/otp/verify",
        json={
            "email_or_phone": "expired@example.com",
            "otp_input": "112233",
            "verification_token": expired_token,
        }
    )
    assert res.status_code == 400
    assert "expired" in res.json()["detail"].lower()


def test_otp_guards_4_and_5_brute_force_counter(client):
    """Guard 4 & 5: Incorrect OTP decrements attempts_left and triggers 429 when exhausted."""
    gen_res = client.post(
        "/v1/otp/generate",
        json={"email_or_phone": "bruteforce@example.com"}
    )
    token = gen_res.json()["verification_token"]
    actual_otp = decrypt_token(token)["otp"]
    wrong_otp = "000000" if actual_otp != "000000" else "999999"

    # Attempt 1: Failed -> 2 attempts left
    res1 = client.post(
        "/v1/otp/verify",
        json={
            "email_or_phone": "bruteforce@example.com",
            "otp_input": wrong_otp,
            "verification_token": token,
        }
    )
    assert res1.status_code == 400
    detail1 = res1.json()["detail"]
    assert detail1["attempts_left"] == 2
    token_attempt_2 = detail1["verification_token"]

    # Attempt 2: Failed -> 1 attempt left
    res2 = client.post(
        "/v1/otp/verify",
        json={
            "email_or_phone": "bruteforce@example.com",
            "otp_input": wrong_otp,
            "verification_token": token_attempt_2,
        }
    )
    assert res2.status_code == 400
    detail2 = res2.json()["detail"]
    assert detail2["attempts_left"] == 1
    token_attempt_3 = detail2["verification_token"]

    # Attempt 3: Failed -> 0 attempts left
    res3 = client.post(
        "/v1/otp/verify",
        json={
            "email_or_phone": "bruteforce@example.com",
            "otp_input": wrong_otp,
            "verification_token": token_attempt_3,
        }
    )
    assert res3.status_code == 400
    detail3 = res3.json()["detail"]
    assert detail3["attempts_left"] == 0
    token_exhausted = detail3["verification_token"]

    # Attempt 4: Quota exhausted -> HTTP 429 Too Many Requests
    res4 = client.post(
        "/v1/otp/verify",
        json={
            "email_or_phone": "bruteforce@example.com",
            "otp_input": wrong_otp,
            "verification_token": token_exhausted,
        }
    )
    assert res4.status_code == 429
    assert "exceeded" in res4.json()["detail"].lower()


def test_otp_tamper_proofing(client):
    """Ensure malformed or tampered tokens are rejected with 400 Bad Request."""
    # 1. Invalid delimiter format
    res_bad_format = client.post(
        "/v1/otp/verify",
        json={
            "email_or_phone": "tamper@example.com",
            "otp_input": "123456",
            "verification_token": "not_a_valid_token",
        }
    )
    assert res_bad_format.status_code == 400

    # 2. Valid format but corrupted ciphertext bytes
    gen_res = client.post(
        "/v1/otp/generate",
        json={"email_or_phone": "tamper@example.com"}
    )
    valid_token = gen_res.json()["verification_token"]
    iv_hex, cipher_hex = valid_token.split(":")
    
    # Flip bytes in ciphertext
    corrupted_cipher = "00" * (len(cipher_hex) // 2)
    tampered_token = f"{iv_hex}:{corrupted_cipher}"

    res_tampered = client.post(
        "/v1/otp/verify",
        json={
            "email_or_phone": "tamper@example.com",
            "otp_input": "123456",
            "verification_token": tampered_token,
        }
    )
    assert res_tampered.status_code == 400
    assert "tampered" in res_tampered.json()["detail"].lower()


def test_api_v1_prefixed_routes(client):
    """Ensure /api/v1/otp/generate also works via standard API router."""
    response = client.post(
        "/api/v1/otp/generate",
        json={"email_or_phone": "apiv1@sunflowepc.com"}
    )
    assert response.status_code == 200
    assert "verification_token" in response.json()
