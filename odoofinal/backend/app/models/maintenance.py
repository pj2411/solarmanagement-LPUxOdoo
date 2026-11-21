import enum
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class TicketPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TicketStatus(str, enum.Enum):
    OPEN = "open"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class ServiceTicket(BaseModel):
    """Customer Complaints & After-Sales Service Tickets (Module 11)."""
    __tablename__ = "service_tickets"

    ticket_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    warranty_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("warranty_records.id", ondelete="SET NULL"),
        nullable=True,
    )
    assigned_technician_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    fault_code: Mapped[Optional[str]] = mapped_column(String(50), index=True, nullable=True)  # e.g. "ERR-F04"
    description: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[TicketPriority] = mapped_column(
        Enum(TicketPriority, native_enum=False, length=50),
        default=TicketPriority.MEDIUM,
        nullable=False,
    )
    status: Mapped[TicketStatus] = mapped_column(
        Enum(TicketStatus, native_enum=False, length=50),
        default=TicketStatus.OPEN,
        nullable=False,
        index=True,
    )

    reported_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    resolution_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # RMA OEM Replacement fields
    rma_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    replacement_serial_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("serial_items.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Relationships
    customer = relationship("Customer", back_populates="service_tickets")
    warranty = relationship("WarrantyRecord", back_populates="service_tickets")
    assigned_technician = relationship("User", foreign_keys=[assigned_technician_id])


class FaultCodeDictionary(BaseModel):
    """Inverter & System Fault Code Reference Dictionary (Module 11)."""
    __tablename__ = "fault_codes"

    fault_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    inverter_brand: Mapped[str] = mapped_column(String(100), default="Generic", nullable=False)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    recommended_actions: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[TicketPriority] = mapped_column(
        Enum(TicketPriority, native_enum=False, length=50),
        default=TicketPriority.MEDIUM,
        nullable=False,
    )
