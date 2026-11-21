import enum
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class SerialStatus(str, enum.Enum):
    IN_WAREHOUSE = "in_warehouse"
    RESERVED = "reserved"
    DISPATCHED = "dispatched"
    INSTALLED = "installed"
    DEFECTIVE = "defective"
    RETURNED_RMA = "returned_rma"


class SerialItem(BaseModel):
    """Individual Serial Number & Barcode Tracking for Panels & Inverters (Module 08)."""
    __tablename__ = "serial_items"

    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    warehouse_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("warehouses.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    order_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("orders.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    serial_number: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    barcode: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)

    current_status: Mapped[SerialStatus] = mapped_column(
        Enum(SerialStatus, native_enum=False, length=50),
        default=SerialStatus.IN_WAREHOUSE,
        nullable=False,
        index=True,
    )
    dispatched_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    installed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    product = relationship("Product", back_populates="serial_items")
    warehouse = relationship("Warehouse", back_populates="serial_items")
    order = relationship("Order", back_populates="serials")
    warranty = relationship("WarrantyRecord", back_populates="serial_item", uselist=False)
