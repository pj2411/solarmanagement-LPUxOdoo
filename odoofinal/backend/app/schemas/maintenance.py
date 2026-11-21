import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.maintenance import TicketPriority, TicketStatus


class ServiceTicketCreate(BaseModel):
    warranty_id: Optional[uuid.UUID] = None
    fault_code: Optional[str] = None
    description: str
    priority: TicketPriority = TicketPriority.MEDIUM


class ServiceTicketUpdate(BaseModel):
    assigned_technician_id: Optional[uuid.UUID] = None
    status: Optional[TicketStatus] = None
    resolution_summary: Optional[str] = None
    rma_number: Optional[str] = None
    replacement_serial_id: Optional[uuid.UUID] = None


class ServiceTicketResponse(BaseModel):
    id: uuid.UUID
    ticket_number: str
    customer_id: uuid.UUID
    warranty_id: Optional[uuid.UUID] = None
    assigned_technician_id: Optional[uuid.UUID] = None
    fault_code: Optional[str] = None
    description: str
    priority: TicketPriority
    status: TicketStatus
    reported_at: datetime
    resolved_at: Optional[datetime] = None
    resolution_summary: Optional[str] = None
    rma_number: Optional[str] = None
    replacement_serial_id: Optional[uuid.UUID] = None

    class Config:
        from_attributes = True


class FaultCodeLookupResponse(BaseModel):
    id: uuid.UUID
    fault_code: str
    inverter_brand: str
    title: str
    description: str
    recommended_actions: str
    severity: TicketPriority

    class Config:
        from_attributes = True
