import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.serial_tracking import SerialStatus


class BarcodeScanRequest(BaseModel):
    order_id: uuid.UUID
    barcode_or_serial: str = Field(..., min_length=4)


class SerialNumberMappingSchema(BaseModel):
    order_id: uuid.UUID
    serial_numbers: List[str]


class SerialItemResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    warehouse_id: uuid.UUID
    order_id: Optional[uuid.UUID] = None
    serial_number: str
    barcode: Optional[str] = None
    current_status: SerialStatus
    dispatched_at: Optional[datetime] = None
    installed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DispatchSlipResponse(BaseModel):
    order_id: uuid.UUID
    order_number: str
    customer_name: str
    shipping_address: str
    scanned_serials: List[SerialItemResponse]
    is_fully_dispatched: bool
