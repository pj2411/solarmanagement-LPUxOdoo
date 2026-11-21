import enum
from typing import Optional
from sqlalchemy import Boolean, Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    SALES_EXEC = "sales_exec"
    SURVEY_TECH = "survey_tech"
    DESIGN_ENG = "design_eng"
    WAREHOUSE_MGR = "warehouse_mgr"
    INSTALL_TECH = "install_tech"
    QC_INSPECTOR = "qc_inspector"
    SUPPORT_AGENT = "support_agent"
    CUSTOMER = "customer"


class User(BaseModel):
    """User table for multi-role authentication & RBAC."""
    __tablename__ = "users"

    email: Mapped[Optional[str]] = mapped_column(String(255), unique=True, index=True, nullable=True)
    phone: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    hashed_password: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, native_enum=False, length=50),
        default=UserRole.CUSTOMER,
        nullable=False,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    customer_profile = relationship("Customer", back_populates="user", uselist=False)
    employee_profile = relationship("Employee", back_populates="user", uselist=False)
