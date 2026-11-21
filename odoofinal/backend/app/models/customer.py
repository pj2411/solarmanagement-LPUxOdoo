import uuid
from typing import List, Optional
from sqlalchemy import Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class Customer(BaseModel):
    """Customer Master Profile including KYC & DISCOM information."""
    __tablename__ = "customers"

    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        unique=True,
        nullable=True,
    )
    full_name: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    pincode: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # DISCOM & Utility Details
    discom_provider: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    consumer_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    sanctioned_load_kw: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    electricity_bill_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    roof_ownership_proof_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Relationships
    user = relationship("User", back_populates="customer_profile")
    leads = relationship("Lead", back_populates="customer")
    quotations = relationship("Quotation", back_populates="customer")
    orders = relationship("Order", back_populates="customer")
    warranties = relationship("WarrantyRecord", back_populates="customer")
    service_tickets = relationship("ServiceTicket", back_populates="customer")
