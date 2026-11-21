import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.models.quotation import QuotationStatus, SystemTopology


class BOMItemDetail(BaseModel):
    sku: str
    name: str
    category: str
    quantity: int
    unit_price: float
    total_price: float
    specifications: Optional[Dict[str, Any]] = None


class QuotationGenerateRequest(BaseModel):
    lead_id: uuid.UUID
    system_capacity_kw: float = Field(..., ge=1.0, description="1.0, 2.0, 3.0, 4.0, 5.0 etc.")
    topology: SystemTopology = SystemTopology.ON_GRID
    panel_wattage: int = Field(default=550, description="Wattage per module")
    discount_amount: float = Field(default=0.0, ge=0)


class QuotationApprovalSchema(BaseModel):
    customer_signature_base64: str = Field(..., description="Base64 encoded digital signature PNG")
    customer_sign_name: str


class QuotationResponse(BaseModel):
    id: uuid.UUID
    lead_id: uuid.UUID
    customer_id: uuid.UUID
    quote_number: str
    version: int
    system_capacity_kw: float
    topology: SystemTopology
    gross_amount: float
    subsidy_amount: float
    discount_amount: float
    tax_amount: float
    net_payable_amount: float
    bom_snapshot: List[Dict[str, Any]]
    status: QuotationStatus
    customer_signature_url: Optional[str] = None
    approved_at: Optional[datetime] = None
    pdf_url: Optional[str] = None

    class Config:
        from_attributes = True
