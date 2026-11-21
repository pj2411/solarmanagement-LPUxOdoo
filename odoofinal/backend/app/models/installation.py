import enum
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class InstallationStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    TESTING_QA = "testing_qa"
    COMPLETED = "completed"
    FAILED = "failed"


class InstallationJob(BaseModel):
    """Field Installation & Testing QA Model (Module 09)."""
    __tablename__ = "installation_jobs"

    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    lead_technician_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    scheduled_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    start_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    finish_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    status: Mapped[InstallationStatus] = mapped_column(
        Enum(InstallationStatus, native_enum=False, length=50),
        default=InstallationStatus.SCHEDULED,
        nullable=False,
        index=True,
    )

    # Step Checklists
    structure_mounting_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    panel_clamping_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    inverter_wiring_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    earthing_pits_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Electrical Quality Assurance Tests
    voc_measured: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # Open Circuit Voltage
    isc_measured: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # Short Circuit Current
    earth_resistance_ohms: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # Mandatory < 5.0 Ohms
    grid_synchronization_tested: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Step progress photos JSONB: [{"step": "structure", "url": "...", "lat": 28.5, "lng": 77.2, "timestamp": "..."}]
    step_photos: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, default=list, nullable=False)

    # Handover & Customer Sign-off
    customer_signature_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    customer_sign_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    commissioning_certificate_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Relationships
    order = relationship("Order", back_populates="installation")
    lead_technician = relationship("User", foreign_keys=[lead_technician_id])
