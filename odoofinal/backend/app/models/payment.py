import enum
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, Enum, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class MilestoneType(str, enum.Enum):
    ADVANCE_BOOKING = "advance_booking"       # Stage 1: e.g. 20%
    PRE_DISPATCH = "pre_dispatch"             # Stage 2: e.g. 60%
    COMMISSIONING = "commissioning_handover"  # Stage 3: e.g. 20%


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"
    WAIVED = "waived"


class InvoiceType(str, enum.Enum):
    ADVANCE_RECEIPT = "advance_receipt"
    TAX_INVOICE = "tax_invoice"


class PaymentMilestone(BaseModel):
    """3-Tier Payment Milestone Model (Module 06)."""
    __tablename__ = "payment_milestones"

    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    milestone_name: Mapped[MilestoneType] = mapped_column(
        Enum(MilestoneType, native_enum=False, length=50),
        nullable=False,
    )
    percentage: Mapped[float] = mapped_column(Float, nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, native_enum=False, length=50),
        default=PaymentStatus.PENDING,
        nullable=False,
        index=True,
    )

    gateway_order_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    gateway_payment_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    order = relationship("Order", back_populates="milestones")


class Invoice(BaseModel):
    """GST-Compliant Tax Invoice Model (Module 06)."""
    __tablename__ = "invoices"

    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    milestone_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("payment_milestones.id", ondelete="SET NULL"),
        nullable=True,
    )
    invoice_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    invoice_type: Mapped[InvoiceType] = mapped_column(
        Enum(InvoiceType, native_enum=False, length=50),
        default=InvoiceType.TAX_INVOICE,
        nullable=False,
    )
    base_amount: Mapped[float] = mapped_column(Float, nullable=False)
    cgst_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    sgst_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    igst_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_amount: Mapped[float] = mapped_column(Float, nullable=False)
    pdf_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_paid: Mapped[bool] = mapped_column(default=False, nullable=False)

    # Relationships
    order = relationship("Order", back_populates="invoices")
