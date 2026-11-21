from typing import AsyncGenerator, List
from fastapi import Depends, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.exceptions import ForbiddenException, UnauthorizedException
from app.core.security import decode_token
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Validates the incoming JWT bearer token and retrieves the current user."""
    payload = decode_token(token)
    if not payload:
        raise UnauthorizedException("Invalid or expired authentication token.")

    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("Token payload missing subject.")

    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user:
        raise UnauthorizedException("User associated with token does not exist.")
    if not user.is_active:
        raise ForbiddenException("User account is inactive.")

    return user


def require_roles(allowed_roles: List[UserRole]):
    """Enforces Role-Based Access Control (RBAC)."""
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role == UserRole.SUPER_ADMIN:
            return current_user  # Super Admin has universal access
        if current_user.role not in allowed_roles:
            raise ForbiddenException(
                f"Role '{current_user.role.value}' is not authorized to access this resource."
            )
        return current_user
    return role_checker


# Convenient role-specific dependencies
get_current_admin = require_roles([UserRole.SUPER_ADMIN])
get_current_sales = require_roles([UserRole.SALES_EXEC, UserRole.SUPER_ADMIN])
get_current_technician = require_roles([UserRole.SURVEY_TECH, UserRole.INSTALL_TECH, UserRole.SUPER_ADMIN])
get_current_warehouse = require_roles([UserRole.WAREHOUSE_MGR, UserRole.SUPER_ADMIN])
