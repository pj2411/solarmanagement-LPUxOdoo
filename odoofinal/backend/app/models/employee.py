import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class Employee(BaseModel):
    """Employee Master Record & Technician Profiles (Module 12)."""
    __tablename__ = "employees"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    employee_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    designation: Mapped[str] = mapped_column(String(100), nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=False)  # Operations, Engineering, Sales, HR
    skill_tags: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)  # ["rooftop_certified", "wireman"]
    is_field_tech: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    base_salary: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    per_kw_incentive_rate: Mapped[float] = mapped_column(Float, default=500.0, nullable=False)  # e.g. ₹500/kW installed
    joining_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="employee_profile")
    attendance_records = relationship("AttendanceLog", back_populates="employee", cascade="all, delete-orphan")


class AttendanceLog(BaseModel):
    """Geo-Fenced Mobile Attendance Record (Module 12)."""
    __tablename__ = "attendance_logs"

    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("employees.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    check_in_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    check_out_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    site_address: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    distance_from_site_meters: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    is_geofence_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    employee = relationship("Employee", back_populates="attendance_records")
