import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_sales, get_current_user
from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.models.lead import Lead, LeadStatus
from app.models.order import Order, OrderStatus
from app.models.payment import MilestoneType, PaymentMilestone, PaymentStatus
from app.models.quotation import Quotation, QuotationStatus
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.order import OrderCreateFromQuotation, OrderResponse, OrderStatusUpdate

router = APIRouter(prefix="/orders", tags=["06 - Order & Milestone Payment Management"])


@router.post("/create-from-quote", response_model=ApiResponse[OrderResponse], status_code=status.HTTP_201_CREATED)
async def create_order_from_approved_quotation(
    request: OrderCreateFromQuotation,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_sales),
):
    """Converts an approved quotation into a sales order and auto-creates 3 milestone payments."""
    quote_query = select(Quotation).where(Quotation.id == request.quotation_id)
    quote_res = await db.execute(quote_query)
    quotation = quote_res.scalar_one_or_none()
    if not quotation:
        raise NotFoundException("Quotation", request.quotation_id)

    order_count_query = select(Order)
    order_count_res = await db.execute(order_count_query)
    count = len(order_count_res.scalars().all()) + 1
    order_number = f"ORD-SIMS-{count:05d}"

    net_amount = quotation.net_payable_amount
    order = Order(
        order_number=order_number,
        quotation_id=quotation.id,
        customer_id=quotation.customer_id,
        total_amount=net_amount,
        subsidy_receivable=quotation.subsidy_amount,
        amount_paid=0.0,
        balance_due=net_amount,
        status=OrderStatus.CONFIRMED,
    )
    db.add(order)
    await db.flush()

    # Create 3 standard milestones: Advance (20%), Pre-Dispatch (60%), Commissioning (20%)
    m1 = PaymentMilestone(
        order_id=order.id,
        milestone_name=MilestoneType.ADVANCE_BOOKING,
        percentage=20.0,
        amount=round(net_amount * 0.20, 2),
        status=PaymentStatus.PENDING,
    )
    m2 = PaymentMilestone(
        order_id=order.id,
        milestone_name=MilestoneType.PRE_DISPATCH,
        percentage=60.0,
        amount=round(net_amount * 0.60, 2),
        status=PaymentStatus.PENDING,
    )
    m3 = PaymentMilestone(
        order_id=order.id,
        milestone_name=MilestoneType.COMMISSIONING,
        percentage=20.0,
        amount=round(net_amount * 0.20, 2),
        status=PaymentStatus.PENDING,
    )
    db.add_all([m1, m2, m3])

    # Update Lead status to WON
    lead_query = select(Lead).where(Lead.id == quotation.lead_id)
    lead_res = await db.execute(lead_query)
    lead = lead_res.scalar_one_or_none()
    if lead:
        lead.status = LeadStatus.WON

    await db.commit()
    await db.refresh(order)

    return ApiResponse(
        data=OrderResponse.model_validate(order),
        message="Sales order confirmed and 3 payment milestones scheduled.",
    )


@router.get("", response_model=ApiResponse[list[OrderResponse]])
async def list_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lists all confirmed sales orders."""
    query = select(Order).order_by(Order.created_at.desc())
    result = await db.execute(query)
    orders = result.scalars().all()
    return ApiResponse(data=[OrderResponse.model_validate(o) for o in orders])


@router.get("/{id}", response_model=ApiResponse[OrderResponse])
async def get_order_by_id(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Retrieves single order details."""
    query = select(Order).where(Order.id == id)
    result = await db.execute(query)
    order = result.scalar_one_or_none()
    if not order:
        raise NotFoundException("Order", id)

    return ApiResponse(data=OrderResponse.model_validate(order))


@router.put("/{id}/status", response_model=ApiResponse[OrderResponse])
async def update_order_status(
    id: uuid.UUID,
    update: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_sales),
):
    """Updates order status along the installation lifecycle."""
    query = select(Order).where(Order.id == id)
    result = await db.execute(query)
    order = result.scalar_one_or_none()
    if not order:
        raise NotFoundException("Order", id)

    order.status = update.status
    await db.commit()
    await db.refresh(order)

    return ApiResponse(data=OrderResponse.model_validate(order), message="Order status updated.")
