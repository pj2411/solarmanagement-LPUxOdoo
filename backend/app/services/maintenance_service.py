"""Service & Maintenance business logic (Module 11).

PS rules:
  * Warranty lookup decides whether service is free or billable.
  * Out-of-warranty => parts + (1500 base + 500/hour) charged automatically.
  * Ticket is NOT closed until the customer explicitly confirms the fix.
"""
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictException, NotFoundException
from app.models.customer import Customer
from app.models.maintenance import ServiceTicket, TicketStatus
from app.models.user import User, UserRole
from app.models.warranty import WarrantyRecord
from app.schemas.maintenance import ServiceTicketCreate, ServiceTicketUpdate, TicketConfirmSchema
from app.services.warranty_service import (
    find_warranty_for_serial,
    is_active,
    ticket_charge,
    utcnow,
)


def _resolve_customer_id(db_customer_id, current_user: User):
    """Customers are bound to their profile; staff must name the customer explicitly."""
    if current_user.role == UserRole.CUSTOMER:
        return db_customer_id  # supplied by the router from the user's profile
    if not db_customer_id:
        raise ConflictException("customer_id is required when staff creates a service ticket.")
    return db_customer_id


async def _resolve_warranty(
    db: AsyncSession, payload: ServiceTicketCreate
) -> tuple[WarrantyRecord | None, bool]:
    """Returns (warranty, in_warranty). Supports both serial-number and warranty-id lookup."""
    warranty = None
    if payload.serial_number:
        _, warranty = await find_warranty_for_serial(db, payload.serial_number)
    elif payload.warranty_id:
        warranty = await db.get(WarrantyRecord, payload.warranty_id)
    return warranty, bool(warranty and is_active(warranty))


async def create_ticket(
    db: AsyncSession, current_user: User, payload: ServiceTicketCreate, customer_id
) -> ServiceTicket:
    customer_id = _resolve_customer_id(customer_id, current_user)
    warranty, in_warranty = await _resolve_warranty(db, payload)
    charge = ticket_charge(in_warranty, payload.parts_cost, payload.hours_worked)

    count = await db.scalar(select(func.count(ServiceTicket.id))) or 0
    ticket = ServiceTicket(
        ticket_number=f"TCK-SIMS-{count + 1:05d}",
        customer_id=customer_id,
        warranty_id=warranty.id if warranty else payload.warranty_id,
        fault_code=payload.fault_code,
        description=payload.description,
        priority=payload.priority,
        status=TicketStatus.OPEN,
        in_warranty=in_warranty,
        parts_cost=charge["parts_cost"],
        labour_cost=charge["labour_cost"],
        billable_amount=charge["billable_amount"],
    )
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)
    return ticket


async def list_tickets(
    db: AsyncSession, current_user: User, status: TicketStatus | None = None
):
    stmt = select(ServiceTicket)
    if current_user.role == UserRole.CUSTOMER:
        customer = await db.scalar(select(Customer).where(Customer.user_id == current_user.id))
        stmt = stmt.where(ServiceTicket.customer_id == customer.id) if customer else stmt.where(False)
    if status:
        stmt = stmt.where(ServiceTicket.status == status)
    return (await db.scalars(stmt.order_by(ServiceTicket.reported_at.desc()))).all()


async def resolve_ticket(
    db: AsyncSession, ticket_id, update: ServiceTicketUpdate
) -> ServiceTicket:
    ticket = await db.get(ServiceTicket, ticket_id)
    if not ticket:
        raise NotFoundException("ServiceTicket", ticket_id)

    if update.parts_cost is not None or update.hours_worked is not None:
        charge = ticket_charge(
            ticket.in_warranty,
            update.parts_cost if update.parts_cost is not None else ticket.parts_cost,
            update.hours_worked or 0.0,
        )
        ticket.parts_cost = charge["parts_cost"]
        ticket.labour_cost = charge["labour_cost"]
        ticket.billable_amount = charge["billable_amount"]

    ticket.status = TicketStatus.RESOLVED
    ticket.resolved_at = utcnow()
    if update.resolution_summary:
        ticket.resolution_summary = update.resolution_summary
    if update.rma_number:
        ticket.rma_number = update.rma_number
    if update.assigned_technician_id:
        ticket.assigned_technician_id = update.assigned_technician_id
    if update.replacement_serial_id:
        ticket.replacement_serial_id = update.replacement_serial_id
    await db.commit()
    await db.refresh(ticket)
    return ticket


async def confirm_ticket(
    db: AsyncSession, ticket_id, payload: TicketConfirmSchema
) -> ServiceTicket:
    """Close only after the customer confirms everything works."""
    ticket = await db.get(ServiceTicket, ticket_id)
    if not ticket:
        raise NotFoundException("ServiceTicket", ticket_id)
    if not payload.customer_confirmed:
        raise ConflictException("Customer confirmation is required to close a ticket.")
    if ticket.status != TicketStatus.RESOLVED:
        raise ConflictException("Ticket must be resolved before the customer can close it.")

    ticket.customer_confirmed = True
    ticket.status = TicketStatus.CLOSED
    ticket.closed_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(ticket)
    return ticket
