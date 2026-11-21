import enum
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class RoofType(str, enum.Enum):
    RCC_FLAT = "rcc_flat"
    METAL_SHEET = "metal_sheet"
    CLAY_TILED = "clay_tiled"
    ASBESTOS = "asbestos"
    GROUND_MOUNT = "ground_mount"


class FeasibilityStatus(str, enum.Enum):
    PENDING = "pending"
    FEASIBLE = "feasible"
    FEASIBLE_WITH_MODIFICATIONS = "feasible_with_modifications"
    REJECTED = "rejected"


class SiteSurvey(BaseModel):
    """Site Engineering & Feasibility Survey (Module 04)."""
    __tablename__ = "site_surveys"

    lead_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("leads.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    technician_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    scheduled_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Engineering measurements
    roof_type: Mapped[RoofType] = mapped_column(
        Enum(RoofType, native_enum=False, length=50),
        default=RoofType.RCC_FLAT,
        nullable=False,
    )
    tilt_angle_deg: Mapped[float] = mapped_column(Float, default=15.0, nullable=False)
    azimuth_angle_deg: Mapped[float] = mapped_column(Float, default=180.0, nullable=False)  # 180 = South
    shadow_free_area_sqft: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    dc_cable_distance_m: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    ac_cable_distance_m: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    earthing_pit_count: Mapped[int] = mapped_column(Integer, default=2, nullable=False)

    # Geo-tagged photos stored as JSONB array: [{"url": "...", "caption": "...", "lat": 28.5, "lng": 77.2, "timestamp": "..."}]
    photos: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, default=list, nullable=False)

    feasibility_status: Mapped[FeasibilityStatus] = mapped_column(
        Enum(FeasibilityStatus, native_enum=False, length=50),
        default=FeasibilityStatus.PENDING,
        nullable=False,
        index=True,
    )
    engineering_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    approved_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Relationships
    lead = relationship("Lead", back_populates="surveys")
    technician = relationship("User", foreign_keys=[technician_id])
