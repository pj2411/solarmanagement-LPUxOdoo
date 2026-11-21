import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.payment import InvoiceType, MilestoneType, PaymentStatus


class CreatePaymentOrderRequest(BaseModel):
    milestone_id: uuid.UUID


class PaymentWebhookPayload(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class MilestoneResponse(BaseModel):
    id: uuid.UUID
    order_id: uuid.UUID
    milestone_name: MilestoneType
    percentage: float
    amount: float
    status: PaymentStatus
    gateway_order_id: Optional[str] = None
    gateway_payment_id: Optional[str] = None
    paid_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class InvoiceResponse(BaseModel):
    id: uuid.UUID
    order_id: uuid.UUID
    milestone_id: Optional[uuid.UUID] = None
    invoice_number: str
    invoice_type: InvoiceType
    base_amount: float
    cgst_amount: float
    sgst_amount: float
    igst_amount: float
    total_amount: float
    pdf_url: Optional[str] = None
    is_paid: bool

    class Config:
        from_attributes = True
