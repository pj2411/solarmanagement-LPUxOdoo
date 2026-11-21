import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.models.order import Order, OrderStatus
from app.models.payment import Invoice, InvoiceType, MilestoneType, PaymentMilestone, PaymentStatus
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.payment import (
    CreatePaymentOrderRequest,
    InvoiceResponse,
    MilestoneResponse,
    PaymentWebhookPayload,
)

router = APIRouter(prefix="/payments", tags=["06 - Milestone Payments & Invoicing"])


@router.get("/order/{order_id}/milestones", response_model=ApiResponse[list[MilestoneResponse]])
async def get_order_milestones(order_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Retrieves the 3 payment milestones (Advance, Pre-Dispatch, Commissioning) for an order."""
    query = select(PaymentMilestone).where(PaymentMilestone.order_id == order_id)
    result = await db.execute(query)
    milestones = result.scalars().all()
    return ApiResponse(data=[MilestoneResponse.model_validate(m) for m in milestones])


@router.post("/create-order", response_model=ApiResponse[dict])
async def create_payment_gateway_order(
    request: CreatePaymentOrderRequest,
    db: AsyncSession = Depends(get_db),
):
    """Initializes checkout session for a payment milestone (Razorpay / Stripe / UPI)."""
    query = select(PaymentMilestone).where(PaymentMilestone.id == request.milestone_id)
    result = await db.execute(query)
    milestone = result.scalar_one_or_none()
    if not milestone:
        raise NotFoundException("PaymentMilestone", request.milestone_id)

    # In production, call Razorpay Orders API: razorpay_client.order.create({...})
    mock_order_id = f"order_rzp_{uuid.uuid4().hex[:12]}"
    milestone.gateway_order_id = mock_order_id
    await db.commit()

    return ApiResponse(
        data={
            "gateway": "razorpay",
            "razorpay_order_id": mock_order_id,
            "amount_in_paise": int(milestone.amount * 100),
            "currency": "INR",
            "milestone_name": milestone.milestone_name.value,
        },
        message="Payment order created. Launch frontend checkout modal.",
    )


@router.post("/simulate-success/{milestone_id}", response_model=ApiResponse[InvoiceResponse])
async def simulate_milestone_payment_success(
    milestone_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Simulates payment webhook confirmation, updates balance, and generates a GST invoice."""
    query = select(PaymentMilestone).where(PaymentMilestone.id == milestone_id)
    result = await db.execute(query)
    milestone = result.scalar_one_or_none()
    if not milestone:
        raise NotFoundException("PaymentMilestone", milestone_id)

    milestone.status = PaymentStatus.PAID
    milestone.paid_at = datetime.utcnow()
    milestone.gateway_payment_id = f"pay_{uuid.uuid4().hex[:12]}"

    # Update order amounts
    order_query = select(Order).where(Order.id == milestone.order_id)
    order_res = await db.execute(order_query)
    order = order_res.scalar_one_or_none()
    if order:
        order.amount_paid += milestone.amount
        order.balance_due = max(0.0, order.total_amount - order.amount_paid)
        if milestone.milestone_name == MilestoneType.PRE_DISPATCH:
            order.status = OrderStatus.READY_FOR_DISPATCH

    # Generate Invoice
    inv_count_query = select(Invoice)
    inv_count_res = await db.execute(inv_count_query)
    count = len(inv_count_res.scalars().all()) + 1
    invoice_number = f"INV-SIMS-{count:05d}"

    taxable = milestone.amount / 1.138
    tax = milestone.amount - taxable
    invoice = Invoice(
        order_id=milestone.order_id,
        milestone_id=milestone.id,
        invoice_number=invoice_number,
        invoice_type=InvoiceType.TAX_INVOICE,
        base_amount=round(taxable, 2),
        cgst_amount=round(tax / 2, 2),
        sgst_amount=round(tax / 2, 2),
        total_amount=milestone.amount,
        is_paid=True,
    )
    db.add(invoice)
    await db.commit()
    await db.refresh(invoice)

    return ApiResponse(
        data=InvoiceResponse.model_validate(invoice),
        message="Payment recorded and GST Tax Invoice generated.",
    )
