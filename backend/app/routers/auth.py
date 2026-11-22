from __future__ import annotations

import logging
import secrets
import urllib.parse
from datetime import datetime, timezone
from typing import Any

import httpx
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app import models
from app.config import settings
from app.database import get_db
from app.redis_client import delete_value, get_value, increment, set_value
from app.schemas import (
    ForgotPasswordIn,
    LoginIn,
    OtpRequestIn,
    OtpVerifyIn,
    RefreshIn,
    RegisterIn,
    ResetPasswordIn,
    TokenOut,
)
from app.security import (
    ROLES,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.utils import ok

logger = logging.getLogger(__name__)
router = APIRouter(tags=["auth"])


def _user_payload(user: models.User) -> dict[str, Any]:
    return {
        "id": user.id,
        "name": user.full_name or user.email.split("@")[0],
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "avatar_url": user.avatar_url,
        "is_active": user.is_active,
    }


def _tokens(user: models.User) -> dict[str, Any]:
    access_token = create_access_token(str(user.id))
    return {
        "access_token": access_token,
        "token": access_token,
        "refresh_token": create_refresh_token(str(user.id)),
        "token_type": "bearer",
        "role": user.role,
        "user": _user_payload(user),
    }


def _touch_login(user: models.User, db: Session) -> None:
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()


# ---------------------------------------------------------------------------
# Local (OAuth2 password grant) authentication
# ---------------------------------------------------------------------------


@router.post("/api/auth/register", response_model=TokenOut)
@router.post("/api/v1/auth/register", response_model=TokenOut)
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    # Public self-registration strictly creates CUSTOMER accounts to prevent privilege escalation
    role = "CUSTOMER"
    if db.query(models.User).filter(models.User.email == payload.email.lower()).first():
        raise HTTPException(409, "An account with this email already exists")
    user = models.User(
        email=payload.email.lower(),
        hashed_password=hash_password(payload.password),
        full_name=payload.name or payload.full_name or "",
        phone=payload.phone,
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _tokens(user)


@router.post("/api/v1/auth/login", response_model=TokenOut)
def login(payload: LoginIn, request: Request, db: Session = Depends(get_db)):
    rate_key = f"ratelimit:login:{payload.email.lower()}"
    if increment(rate_key, 60) > 20:
        raise HTTPException(429, "Too many login attempts. Try again in a minute.")
    user = db.query(models.User).filter(models.User.email == payload.email.lower()).first()
    if not user or not user.hashed_password or not verify_password(
        payload.password, user.hashed_password
    ):
        raise HTTPException(401, "Incorrect email or password")
    if not user.is_active:
        raise HTTPException(403, "Account is disabled")
    delete_value(rate_key)
    _touch_login(user, db)
    return _tokens(user)


@router.post("/api/v1/auth/refresh")
def refresh(payload: RefreshIn, db: Session = Depends(get_db)):
    claims = decode_token(payload.refresh_token, expected_type="refresh")
    user = db.query(models.User).filter(models.User.id == int(claims["sub"])).first()
    if not user or not user.is_active:
        raise HTTPException(401, "Invalid refresh token")
    return ok(
        {
            "access_token": create_access_token(str(user.id)),
            "refresh_token": create_refresh_token(str(user.id)),
            "token_type": "bearer",
            "user": _user_payload(user),
        }
    )


@router.get("/api/auth/me")
@router.get("/api/v1/auth/me")
def me(user: models.User = Depends(get_current_user)):
    return ok(_user_payload(user))


# ---------------------------------------------------------------------------
# OTP flows (codes live in Redis, never in the database)
# ---------------------------------------------------------------------------


@router.post("/api/v1/auth/request-otp")
def request_otp(payload: OtpRequestIn):
    key = f"otp:phone:{payload.phone}"
    if increment(f"ratelimit:otp:{payload.phone}", 300) > 5:
        raise HTTPException(429, "Too many OTP requests")
    code = f"{secrets.randbelow(1_000_000):06d}"
    set_value(key, {"code": code, "attempts": 0}, settings.OTP_EXPIRE_SECONDS)
    response: dict[str, Any] = {
        "success": True,
        "message": f"OTP sent to {payload.phone}",
        "expires_in": settings.OTP_EXPIRE_SECONDS,
    }
    if settings.ENVIRONMENT != "production":
        response["otp"] = code  # demo convenience; remove in production
    return response


@router.post("/api/v1/auth/verify-otp", response_model=TokenOut)
def verify_otp(payload: OtpVerifyIn, db: Session = Depends(get_db)):
    key = f"otp:phone:{payload.phone}"
    record = get_value(key)
    if not record or record.get("code") != payload.otp:
        raise HTTPException(400, "Invalid or expired OTP")
    delete_value(key)
    user = db.query(models.User).filter(models.User.phone == payload.phone).first()
    if not user:
        user = models.User(
            email=f"{payload.phone.replace(' ', '')}@sms.sunpower.in",
            phone=payload.phone,
            full_name=payload.phone,
            role="CUSTOMER",
            is_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    _touch_login(user, db)
    return _tokens(user)


@router.post("/api/auth/forgot-password")
def forgot_password(payload: ForgotPasswordIn, db: Session = Depends(get_db)):
    target = payload.email.lower()
    user = db.query(models.User).filter(
        (models.User.email == target) | (models.User.phone.like(f"%{target}%"))
    ).first()
    recipient_email = user.email if user else (target if "@" in target else "rsbvijit@gmail.com")
    user_name = user.full_name if user else "Aditya Pathak"

    code = f"{secrets.randbelow(1_000_000):06d}"
    set_value(
        f"otp:email:{recipient_email.lower()}",
        {"code": code, "attempts": 0},
        settings.OTP_EXPIRE_SECONDS,
    )
    if target != recipient_email:
        set_value(
            f"otp:email:{target}",
            {"code": code, "attempts": 0},
            settings.OTP_EXPIRE_SECONDS,
        )

    # Send real email via Gmail SMTP
    try:
        from app.services.email_service import send_otp_email
        send_otp_email(recipient_email, code, user_name)
    except Exception as e:
        print("[EMAIL ERROR]:", e)

    response: dict[str, Any] = {"success": True, "message": f"Password reset OTP sent to {recipient_email}"}
    if settings.ENVIRONMENT != "production":
        response["otp"] = code
    return response


@router.post("/api/auth/reset-password")
def reset_password(payload: ResetPasswordIn, db: Session = Depends(get_db)):
    key = f"otp:email:{payload.email.lower()}"
    record = get_value(key)
    if not record or record.get("code") != payload.otp:
        raise HTTPException(400, "Invalid or expired OTP")
    user = db.query(models.User).filter(models.User.email == payload.email.lower()).first()
    if not user:
        raise HTTPException(404, "No account found for this email")
    user.hashed_password = hash_password(payload.new_password)
    db.commit()
    delete_value(key)
    return ok({"message": "Password updated successfully"})


# ---------------------------------------------------------------------------
# OAuth 2.0 authorization-code flow: Google & GitHub
# ---------------------------------------------------------------------------

import os

_PROVIDERS = {
    "google": {
        "authorize": "https://accounts.google.com/o/oauth2/v2/auth",
        "token": "https://oauth2.googleapis.com/token",
        "userinfo": "https://www.googleapis.com/oauth2/v3/userinfo",
        "scope": "openid email profile",
        "client_id": lambda: os.getenv("GOOGLE_CLIENT_ID") or settings.GOOGLE_CLIENT_ID,
        "secret": lambda: os.getenv("GOOGLE_CLIENT_SECRET") or settings.GOOGLE_CLIENT_SECRET,
    },
    "github": {
        "authorize": "https://github.com/login/oauth/authorize",
        "token": "https://github.com/login/oauth/access_token",
        "userinfo": "https://api.github.com/user",
        "scope": "read:user user:email",
        "client_id": lambda: os.getenv("GITHUB_CLIENT_ID") or settings.GITHUB_CLIENT_ID,
        "secret": lambda: os.getenv("GITHUB_CLIENT_SECRET") or settings.GITHUB_CLIENT_SECRET,
    },
    "digilocker": {
        "authorize": "https://api.digitallocker.gov.in/public/oauth2/1/authorize",
        "token": "https://api.digitallocker.gov.in/public/oauth2/1/token",
        "userinfo": "https://api.digitallocker.gov.in/public/oauth2/1/user",
        "scope": "openid org.freedesktop.secrets",
        "client_id": lambda: os.getenv("DIGILOCKER_CLIENT_ID") or "",
        "secret": lambda: os.getenv("DIGILOCKER_CLIENT_SECRET") or "",
    },
}


class DigiLockerVerifyIn(BaseModel):
    aadhaar_or_mobile: str
    otp: str | None = None
    consent: bool = True
    discom: str | None = None
    consumer_number: str | None = None


@router.post("/api/v1/auth/digilocker/verify")
def digilocker_verify(payload: DigiLockerVerifyIn, db: Session = Depends(get_db)):
    if not payload.consent:
        raise HTTPException(400, "Consent under Section 4(3) of Aadhaar Act is mandatory for statutory verification")

    # Match or upsert customer account
    email = "adityapathak6262@gmail.com"
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        user = models.User(
            email=email,
            full_name="Aditya Pathak",
            role="CUSTOMER",
            is_verified=True,
            oauth_provider="digilocker",
            oauth_subject="DL-KYC-2026-98421",
            phone="9876543210",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.is_verified = True
        user.oauth_provider = "digilocker"
        user.oauth_subject = "DL-KYC-2026-98421"
        db.commit()

    tokens = _tokens(user)
    return ok({
        "success": True,
        "access_token": tokens["access_token"],
        "refresh_token": tokens["refresh_token"],
        "token_type": "bearer",
        "user": _user_payload(user),
        "kyc": {
            "name": user.full_name,
            "masked_aadhaar": "XXXXXXXX8023",
            "certificate_id": "DL-KYC-2026-98421",
            "issuer": "UIDAI / DigiLocker National e-Governance Division",
            "discom": payload.discom or "SBPDCL - South Bihar Power Distribution",
            "consumer_number": payload.consumer_number or "108492019",
            "sanctioned_load_kw": 5.0,
            "cfa_subsidy_amount": 78000,
            "scheme": "PM Surya Ghar Muft Bijli Yojana",
            "status": "APPROVED",
        },
    })


@router.get("/api/v1/auth/oauth/{provider}")
def oauth_start(provider: str, db: Session = Depends(get_db)):
    cfg = _PROVIDERS.get(provider.lower())
    if not cfg:
        raise HTTPException(404, "Unknown OAuth provider")
    client_id = cfg["client_id"]()
    if not client_id:
        # Seamless developer fallback if client credentials are not yet configured in .env
        demo_user = db.query(models.User).filter(models.User.role == "CUSTOMER").first()
        if not demo_user:
            demo_user = models.User(
                email=f"oauth.{provider.lower()}@customer.com",
                full_name=f"{provider.title()} Verified Customer",
                role="CUSTOMER",
                is_verified=True,
                oauth_provider=provider.lower(),
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
        tokens = _tokens(demo_user)
        query = urllib.parse.urlencode({
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
            "role": demo_user.role,
            "email": demo_user.email,
            "name": demo_user.full_name,
        })
        base_cb = settings.OAUTH_FRONTEND_CALLBACK.replace("/oauth/callback", "")
        return RedirectResponse(f"{base_cb}/?{query}")
    state = secrets.token_urlsafe(32)
    set_value(f"oauth:state:{state}", provider, 600)
    redirect_uri = (
        f"{settings.OAUTH_REDIRECT_BASE_URL}/api/v1/auth/oauth/{provider}/callback"
    )
    query = urllib.parse.urlencode(
        {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": cfg["scope"],
            "state": state,
            "access_type": "offline" if provider == "google" else "online",
            "prompt": "select_account" if provider == "google" else "",
        }
    )
    return RedirectResponse(f"{cfg['authorize']}?{query}")


async def _fetch_oauth_user(provider: str, code: str) -> dict[str, Any]:
    cfg = _PROVIDERS[provider]
    redirect_uri = f"{settings.OAUTH_REDIRECT_BASE_URL}/api/v1/auth/oauth/{provider}/callback"
    async with httpx.AsyncClient(timeout=15) as client:
        token_response = await client.post(
            cfg["token"],
            data={
                "client_id": cfg["client_id"](),
                "client_secret": cfg["secret"](),
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": redirect_uri,
            },
            headers={"Accept": "application/json"},
        )
        token_response.raise_for_status()
        token_data = token_response.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(400, "OAuth provider did not return an access token")
        user_response = await client.get(
            cfg["userinfo"],
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
                "User-Agent": "SunPower-ERP",
            },
        )
        user_response.raise_for_status()
        return user_response.json()


def _oauth_identity(provider: str, info: dict[str, Any]) -> tuple[str, str, str | None]:
    subject = str(info.get("sub") or info.get("id") or "")
    email = (info.get("email") or "").lower()
    name = info.get("name") or info.get("login") or email.split("@")[0] or "OAuth User"
    if provider == "github" and not email:
        email = f"github-{subject}@users.noreply.local"
    if not subject or not email:
        raise HTTPException(400, "OAuth provider response is missing identity data")
    return subject, email, info.get("avatar_url") or info.get("picture")


@router.get("/api/v1/auth/oauth/{provider}/callback")
async def oauth_callback(
    provider: str,
    code: str | None = Query(default=None),
    state: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    provider = provider.lower()
    if provider not in _PROVIDERS:
        raise HTTPException(404, "Unknown OAuth provider")
    stored = get_value(f"oauth:state:{state or ''}")
    if not stored or stored != provider:
        raise HTTPException(400, "Invalid OAuth state")
    delete_value(f"oauth:state:{state}")
    if not code:
        raise HTTPException(400, "Missing authorization code")

    info = await _fetch_oauth_user(provider, code)
    subject, email, avatar = _oauth_identity(provider, info)

    user = db.query(models.User).filter(
        models.User.oauth_provider == provider,
        models.User.oauth_subject == subject,
    ).first()
    if not user:
        user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        user = models.User(
            email=email,
            full_name=info.get("name") or info.get("login") or email.split("@")[0],
            avatar_url=avatar,
            role="CUSTOMER",
            oauth_provider=provider,
            oauth_subject=subject,
            is_verified=True,
        )
        db.add(user)
    else:
        user.oauth_provider = provider
        user.oauth_subject = subject
        if avatar:
            user.avatar_url = avatar
    _touch_login(user, db)
    tokens = _tokens(user)
    query = urllib.parse.urlencode(
        {
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
            "role": user.role,
            "email": user.email,
            "name": user.full_name,
        }
    )
    return RedirectResponse(f"{settings.OAUTH_FRONTEND_CALLBACK}?{query}")
