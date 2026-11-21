import enum
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, Enum, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class SubsidyStatus(str, enum.Enum):
    APPLICATION_DRAFT = "application_draft"
    SUBMITTED_TO_PORTAL = "submitted_to_portal"
    DISCOM_INSPECTION_PENDING = "discom_inspection_pending"
    APPROVED_FOR_DISBURSAL = "approved_for_disbursal"
    DISBURSED = "disbursed"
    REJECTED = "rejected"


class ProjectPnLLedger(BaseModel):
    """Project-Wise Profit & Loss Ledger (Module 13: Financial Analytics)."""
    __tablename__ = "project_pnl_ledgers"

    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    contract_revenue: Mapped[float] = mapped_column(Float, nullable=False)
    cogs_panels: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    cogs_inverters: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    cogs_structures: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    cogs_bos: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    labor_cost: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    logistics_cost: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    liaisoning_overhead: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    net_profit_margin: Mapped[float] = mapped_column(Float, nullable=False)
    computed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relationship
    order = relationship("Order")


class SubsidyClaimTracker(BaseModel):
    """Government Subsidy Claim Pipeline (Module 13)."""
    __tablename__ = "subsidy_claims"

    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    claim_reference_no: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    scheme_name: Mapped[str] = mapped_column(String(150), default="PM Surya Ghar Muft Bijli Yojana", nullable=False)
    sanctioned_amount: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[SubsidyStatus] = mapped_column(
        Enum(SubsidyStatus, native_enum=False, length=50),
        default=SubsidyStatus.APPLICATION_DRAFT,
        nullable=False,
        index=True,
    )
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    disbursed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationship
    order = relationship("Order")
