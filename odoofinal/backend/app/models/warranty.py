import enum
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class WarrantyComponent(str, enum.Enum):
    SOLAR_PANEL = "solar_panel"      # 10-12 yr product + 25-30 yr linear performance
    INVERTER = "inverter"            # 5-10 yr manufacturer
    BATTERY = "battery"              # 3-5 yr replacement
    WORKMANSHIP = "workmanship_amc"  # 1-5 yr installer warranty


class WarrantyStatus(str, enum.Enum):
    ACTIVE = "active"
    EXPIRING_SOON = "expiring_soon"
    EXPIRED = "expired"
    VOIDED = "voided"


class WarrantyRecord(BaseModel):
    """Warranty Lifecycle Tracking Model (Module 10)."""
    __tablename__ = "warranty_records"

    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    serial_item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("serial_items.id", ondelete="RESTRICT"),
        unique=True,
        nullable=False,
    )
    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    component_type: Mapped[WarrantyComponent] = mapped_column(
        Enum(WarrantyComponent, native_enum=False, length=50),
        nullable=False,
        index=True,
    )
    warranty_years: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    expiry_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)

    status: Mapped[WarrantyStatus] = mapped_column(
        Enum(WarrantyStatus, native_enum=False, length=50),
        default=WarrantyStatus.ACTIVE,
        nullable=False,
        index=True,
    )
    certificate_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Relationships
    customer = relationship("Customer", back_populates="warranties")
    serial_item = relationship("SerialItem", back_populates="warranty")
    order = relationship("Order", back_populates="warranties")
    service_tickets = relationship("ServiceTicket", back_populates="warranty")
