import uuid
from typing import Optional
from pydantic import BaseModel
from app.models.order import OrderStatus


class OrderCreateFromQuotation(BaseModel):
    quotation_id: uuid.UUID


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderResponse(BaseModel):
    id: uuid.UUID
    order_number: str
    quotation_id: uuid.UUID
    customer_id: uuid.UUID
    total_amount: float
    subsidy_receivable: float
    amount_paid: float
    balance_due: float
    status: OrderStatus

    class Config:
        from_attributes = True
