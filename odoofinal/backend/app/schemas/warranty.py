import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.warranty import WarrantyComponent, WarrantyStatus


class WarrantyClaimRequest(BaseModel):
    warranty_id: uuid.UUID
    description: str
    photo_urls: Optional[list[str]] = None


class WarrantyCardResponse(BaseModel):
    id: uuid.UUID
    customer_id: uuid.UUID
    serial_item_id: uuid.UUID
    order_id: uuid.UUID
    component_type: WarrantyComponent
    warranty_years: int
    start_date: datetime
    expiry_date: datetime
    status: WarrantyStatus
    certificate_url: Optional[str] = None

    class Config:
        from_attributes = True
