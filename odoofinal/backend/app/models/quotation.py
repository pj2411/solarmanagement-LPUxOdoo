import enum
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class SystemTopology(str, enum.Enum):
    ON_GRID = "on_grid"
    OFF_GRID = "off_grid"
    HYBRID = "hybrid"


class QuotationStatus(str, enum.Enum):
    DRAFT = "draft"
    SENT = "sent"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"


class Quotation(BaseModel):
    """Quotation & Dynamic Bill of Materials Model (Module 05)."""
    __tablename__ = "quotations"

    lead_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("leads.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    quote_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # Technical sizing
    system_capacity_kw: Mapped[float] = mapped_column(Float, nullable=False)  # 1.0, 2.0, 3.0, 4.0, 5.0 etc.
    topology: Mapped[SystemTopology] = mapped_column(
        Enum(SystemTopology, native_enum=False, length=50),
        default=SystemTopology.ON_GRID,
        nullable=False,
    )

    # Pricing & Subsidy
    gross_amount: Mapped[float] = mapped_column(Float, nullable=False)
    subsidy_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    discount_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    tax_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    net_payable_amount: Mapped[float] = mapped_column(Float, nullable=False)

    # BOM snapshot: [{"sku": "PNL-550W", "name": "550W Mono PERC", "qty": 6, "unit_price": 12000, "total": 72000}, ...]
    bom_snapshot: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, default=list, nullable=False)

    status: Mapped[QuotationStatus] = mapped_column(
        Enum(QuotationStatus, native_enum=False, length=50),
        default=QuotationStatus.DRAFT,
        nullable=False,
        index=True,
    )
    customer_signature_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    pdf_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Relationships
    lead = relationship("Lead", back_populates="quotations")
    customer = relationship("Customer", back_populates="quotations")
    order = relationship("Order", back_populates="quotation", uselist=False)
