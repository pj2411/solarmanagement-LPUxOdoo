import uuid
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.models.user import UserRole


class LoginRequest(BaseModel):
    username: str = Field(..., description="Email or Phone number")
    password: str = Field(..., min_length=6)


class RequestOtpSchema(BaseModel):
    phone: str = Field(..., description="10-digit mobile number with or without country code")


class VerifyOtpSchema(BaseModel):
    phone: str = Field(..., description="10-digit mobile number")
    otp: str = Field(..., min_length=4, max_length=6)


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserSummary(BaseModel):
    id: uuid.UUID
    full_name: str
    phone: str
    email: Optional[str] = None
    role: UserRole
    is_active: bool
    is_verified: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserSummary


class PasswordResetRequest(BaseModel):
    phone_or_email: str


class PasswordResetConfirm(BaseModel):
    phone_or_email: str
    otp: str
    new_password: str = Field(..., min_length=6)
