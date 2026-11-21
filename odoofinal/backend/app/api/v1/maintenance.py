import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.models.customer import Customer
from app.models.maintenance import FaultCodeDictionary, ServiceTicket, TicketStatus
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.maintenance import (
    FaultCodeLookupResponse,
    ServiceTicketCreate,
    ServiceTicketResponse,
    ServiceTicketUpdate,
)

router = APIRouter(prefix="/maintenance", tags=["11 - Service & Maintenance (O&M)"])


@router.get("/fault-codes", response_model=ApiResponse[list[FaultCodeLookupResponse]])
async def list_inverter_fault_codes(db: AsyncSession = Depends(get_db)):
    """Inverter fault code dictionary with automated troubleshooting recommendations."""
    query = select(FaultCodeDictionary)
    result = await db.execute(query)
    codes = result.scalars().all()
    return ApiResponse(data=[FaultCodeLookupResponse.model_validate(c) for c in codes])


@router.post("/tickets", response_model=ApiResponse[ServiceTicketResponse], status_code=status.HTTP_201_CREATED)
async def create_service_ticket(
    ticket_in: ServiceTicketCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Customer or IoT inverter submits an issue / breakdown ticket."""
    count_query = select(ServiceTicket)
    count_res = await db.execute(count_query)
    count = len(count_res.scalars().all()) + 1
    ticket_number = f"TCK-SIMS-{count:05d}"

    ticket = ServiceTicket(
        ticket_number=ticket_number,
        customer_id=current_user.id,
        warranty_id=ticket_in.warranty_id,
        fault_code=ticket_in.fault_code,
        description=ticket_in.description,
        priority=ticket_in.priority,
        status=TicketStatus.OPEN,
    )
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)

    return ApiResponse(
        data=ServiceTicketResponse.model_validate(ticket),
        message="Service ticket registered. SLA countdown started.",
    )


@router.put("/tickets/{id}/resolve", response_model=ApiResponse[ServiceTicketResponse])
async def resolve_service_ticket(
    id: uuid.UUID,
    update: ServiceTicketUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Field repair technician logs resolution and closes ticket."""
    query = select(ServiceTicket).where(ServiceTicket.id == id)
    result = await db.execute(query)
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise NotFoundException("ServiceTicket", id)

    ticket.status = TicketStatus.RESOLVED
    ticket.resolved_at = datetime.utcnow()
    ticket.resolution_summary = update.resolution_summary
    if update.rma_number:
        ticket.rma_number = update.rma_number

    await db.commit()
    await db.refresh(ticket)

    return ApiResponse(
        data=ServiceTicketResponse.model_validate(ticket),
        message="Service ticket resolved successfully.",
    )
