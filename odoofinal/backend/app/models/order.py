import enum
import uuid
from typing import List, Optional
from sqlalchemy import Enum, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class OrderStatus(str, enum.Enum):
    CONFIRMED = "confirmed"
    IN_PROCUREMENT = "in_procurement"
    READY_FOR_DISPATCH = "ready_for_dispatch"
    DISPATCHED = "dispatched"
    INSTALLATION_IN_PROGRESS = "installation_in_progress"
    TESTING_QA = "testing_qa"
    COMMISSIONED = "commissioned"
    CLOSED = "closed"
    CANCELLED = "cancelled"


class Order(BaseModel):
    """Confirmed Sales Order Entity (Module 06)."""
    __tablename__ = "orders"

    order_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    quotation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("quotations.id", ondelete="RESTRICT"),
        unique=True,
        nullable=False,
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("customers.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    total_amount: Mapped[float] = mapped_column(Float, nullable=False)
    subsidy_receivable: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    amount_paid: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    balance_due: Mapped[float] = mapped_column(Float, nullable=False)

    status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus, native_enum=False, length=50),
        default=OrderStatus.CONFIRMED,
        nullable=False,
        index=True,
    )

    # Relationships
    quotation = relationship("Quotation", back_populates="order")
    customer = relationship("Customer", back_populates="orders")
    milestones = relationship("PaymentMilestone", back_populates="order", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="order")
    installation = relationship("InstallationJob", back_populates="order", uselist=False)
    serials = relationship("SerialItem", back_populates="order")
    warranties = relationship("WarrantyRecord", back_populates="order")
