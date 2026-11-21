import enum
import uuid
from typing import Optional
from sqlalchemy import Enum, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class LeadStatus(str, enum.Enum):
    NEW = "new"
    CONTACTED = "contacted"
    SURVEY_SCHEDULED = "survey_scheduled"
    SURVEY_COMPLETED = "survey_completed"
    QUOTED = "quoted"
    NEGOTIATION = "negotiation"
    WON = "won"
    LOST = "lost"


class Lead(BaseModel):
    """Lead pipeline entity capturing calculator inputs and sales progress."""
    __tablename__ = "leads"

    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    source: Mapped[str] = mapped_column(String(100), default="website_calculator", nullable=False)
    monthly_bill: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    monthly_kwh: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    roof_area_sqft: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    recommended_kw: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    status: Mapped[LeadStatus] = mapped_column(
        Enum(LeadStatus, native_enum=False, length=50),
        default=LeadStatus.NEW,
        nullable=False,
        index=True,
    )
    assigned_sales_rep_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    customer = relationship("Customer", back_populates="leads")
    surveys = relationship("SiteSurvey", back_populates="lead")
    quotations = relationship("Quotation", back_populates="lead")
