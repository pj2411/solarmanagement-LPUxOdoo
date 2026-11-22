"""Dispatch & serial tracking logic (Module 08).

One transaction scans a serial, reserves it for an order, and (on delivery
confirmation) starts every warranty automatically.
"""
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictException, NotFoundException
from app.models.order import Order, OrderStatus
from app.models.serial_tracking import SerialItem, SerialStatus
from app.services.order_service import assert_dispatch_allowed
from app.services.warranty_service import register_warranties_for_order


async def scan_serial(db: AsyncSession, barcode_or_serial: str, order_id) -> SerialItem:
    serial = await db.scalar(
        select(SerialItem).where(
            (SerialItem.serial_number == barcode_or_serial)
            | (SerialItem.barcode == barcode_or_serial)
        )
    )
    if not serial:
        raise NotFoundException("SerialItem", barcode_or_serial)
    if serial.current_status != SerialStatus.IN_WAREHOUSE:
        raise ConflictException(
            f"Serial '{serial.serial_number}' is already {serial.current_status.value}."
        )
    if not await db.get(Order, order_id):
        raise NotFoundException("Order", order_id)

    serial.order_id = order_id
    serial.current_status = SerialStatus.RESERVED
    await db.commit()
    await db.refresh(serial)
    return serial


async def confirm_shipment(db: AsyncSession, order_id) -> dict:
    """Mark dispatch + delivery: serials move to DISPATCHED and warranties start NOW."""
    order = await db.get(Order, order_id)
    if not order:
        raise NotFoundException("Order", order_id)
    assert_dispatch_allowed(order)

    serials = (await db.scalars(
        select(SerialItem).where(SerialItem.order_id == order_id)
    )).all()
    if not serials:
        raise ConflictException("No serials mapped to this order. Scan them before dispatch.")

    order.status = OrderStatus.DISPATCHED
    for serial in serials:
        serial.current_status = SerialStatus.DISPATCHED
        serial.dispatched_at = serial.dispatched_at or datetime.utcnow()

    created = await register_warranties_for_order(db, order, serials)
    await db.commit()
    return {
        "order_id": order_id,
        "dispatched_serials_count": len(serials),
        "warranties_created": created,
        "warranty_starts_on": "delivery_confirmation",
    }
