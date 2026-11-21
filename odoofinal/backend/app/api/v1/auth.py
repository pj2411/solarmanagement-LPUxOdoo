from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RefreshTokenRequest,
    RequestOtpSchema,
    TokenResponse,
    UserSummary,
    VerifyOtpSchema,
)
from app.schemas.common import ApiResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["02 - Authentication & RBAC"])


@router.post("/login", response_model=ApiResponse[TokenResponse])
async def login(credentials: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Standard password login for Backoffice, Sales, and Admins."""
    user = await AuthService.authenticate_user(db, credentials.username, credentials.password)
    access_token = create_access_token(subject=user.id, role=user.role.value)
    refresh_token = create_refresh_token(subject=user.id, role=user.role.value)

    token_data = TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserSummary.model_validate(user),
    )
    return ApiResponse(data=token_data, message="Login successful.")


@router.post("/request-otp", response_model=ApiResponse[dict])
async def request_otp(data: RequestOtpSchema):
    """Sends a 6-digit OTP to mobile for field technicians and customers."""
    otp = await AuthService.request_otp(data.phone)
    # Note: In dev mode, return the OTP for seamless testing
    return ApiResponse(
        data={"phone": data.phone, "debug_otp": otp},
        message="OTP sent successfully."
    )


@router.post("/verify-otp", response_model=ApiResponse[TokenResponse])
async def verify_otp(data: VerifyOtpSchema, db: AsyncSession = Depends(get_db)):
    """Verifies the OTP and logs in / registers the user."""
    _, token_data = await AuthService.verify_otp(db, data.phone, data.otp)
    return ApiResponse(data=token_data, message="Authentication verified successfully.")


@router.post("/refresh", response_model=ApiResponse[TokenResponse])
async def refresh_token(data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Refreshes expired access tokens."""
    token_data = await AuthService.refresh_access_token(db, data.refresh_token)
    return ApiResponse(data=token_data, message="Token refreshed successfully.")


@router.get("/me", response_model=ApiResponse[UserSummary])
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Returns the authenticated user's profile and RBAC role."""
    return ApiResponse(data=UserSummary.model_validate(current_user))
