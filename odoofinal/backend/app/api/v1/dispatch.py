import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user, get_current_warehouse
from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.models.order import Order, OrderStatus
from app.models.serial_tracking import SerialItem, SerialStatus
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.serial_tracking import (
    BarcodeScanRequest,
    DispatchSlipResponse,
    SerialItemResponse,
)

router = APIRouter(prefix="/dispatch", tags=["08 - Dispatch & Serial Number Tracking"])


@router.post("/scan-serial", response_model=ApiResponse[SerialItemResponse])
async def scan_and_map_serial_to_order(
    request: BarcodeScanRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_warehouse),
):
    """Scans panel RFID barcode or inverter serial and maps it 1-to-1 to the customer order."""
    query = select(SerialItem).where(
        (SerialItem.serial_number == request.barcode_or_serial)
        | (SerialItem.barcode == request.barcode_or_serial)
    )
    result = await db.execute(query)
    serial_item = result.scalar_one_or_none()

    if not serial_item:
        raise NotFoundException("SerialItem", request.barcode_or_serial)

    serial_item.order_id = request.order_id
    serial_item.current_status = SerialStatus.RESERVED
    await db.commit()
    await db.refresh(serial_item)

    return ApiResponse(
        data=SerialItemResponse.model_validate(serial_item),
        message=f"Serial '{serial_item.serial_number}' successfully mapped to order.",
    )


@router.post("/confirm-shipment/{order_id}", response_model=ApiResponse[dict])
async def confirm_order_dispatch(
    order_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_warehouse),
):
    """Confirms material packaging and marks all reserved serials as DISPATCHED."""
    order_query = select(Order).where(Order.id == order_id)
    order_res = await db.execute(order_query)
    order = order_res.scalar_one_or_none()
    if not order:
        raise NotFoundException("Order", order_id)

    order.status = OrderStatus.DISPATCHED

    # Update mapped serials to DISPATCHED
    serials_query = select(SerialItem).where(SerialItem.order_id == order_id)
    serials_res = await db.execute(serials_query)
    serials = serials_res.scalars().all()

    now = datetime.utcnow()
    for s in serials:
        s.current_status = SerialStatus.DISPATCHED
        s.dispatched_at = now

    await db.commit()
    return ApiResponse(
        data={"order_id": order_id, "dispatched_serials_count": len(serials)},
        message="Materials dispatched from warehouse and mapped to customer installation.",
    )
