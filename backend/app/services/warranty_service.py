"""Warranty Lifecycle Logic (Module 10).

PS rules implemented here (single source of truth):
  * Warranty starts on DELIVERY / dispatch confirmation, not on commissioning.
  * Solar panel      -> 20 years
  * Inverter/Battery ->  2 years
  * Other components ->  2 years
  * In-warranty service is free; out-of-warranty is billed automatically.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.inventory import Product, ProductCategory
from app.models.order import Order
from app.models.serial_tracking import SerialItem
from app.models.warranty import (
    WarrantyComponent,
    WarrantyRecord,
    WarrantyStatus,
)

# ---- PS-mandated durations -------------------------------------------------
PANEL_WARRANTY_YEARS = 20
INVERTER_WARRANTY_YEARS = 2
BATTERY_WARRANTY_YEARS = 2
OTHER_WARRANTY_YEARS = 2

LABOUR_BASE_CHARGE = 1500.0   # INR, out-of-warranty visit
LABOUR_PER_HOUR = 500.0       # INR


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def warranty_years_for(component: WarrantyComponent) -> int:
    """Returns the PS-compliant warranty duration for a component type."""
    return {
        WarrantyComponent.SOLAR_PANEL: PANEL_WARRANTY_YEARS,
        WarrantyComponent.INVERTER: INVERTER_WARRANTY_YEARS,
        WarrantyComponent.BATTERY: BATTERY_WARRANTY_YEARS,
    }.get(component, OTHER_WARRANTY_YEARS)


def component_from_product(product=None, serial_number: str = "") -> WarrantyComponent:
    """Maps a product category (or legacy serial prefix) to a warranty component."""
    category = getattr(product, "category", None)
    if category == ProductCategory.PANEL:
        return WarrantyComponent.SOLAR_PANEL
    if category == ProductCategory.INVERTER:
        return WarrantyComponent.INVERTER
    if category == ProductCategory.BATTERY:
        return WarrantyComponent.BATTERY
    # Fallback for seed/legacy serial numbers that have no product row.
    upper = serial_number.upper()
    if "PNL" in upper or "PANEL" in upper:
        return WarrantyComponent.SOLAR_PANEL
    if "BAT" in upper:
        return WarrantyComponent.BATTERY
    if "INV" in upper:
        return WarrantyComponent.INVERTER
    return WarrantyComponent.WORKMANSHIP


def ticket_charge(in_warranty: bool, parts_cost: float = 0.0, hours_worked: float = 0.0) -> dict:
    """PS rule: in-warranty service is FREE. Otherwise parts + labour."""
    parts = float(parts_cost or 0.0)
    hours = float(hours_worked or 0.0)
    if in_warranty:
        return {
            "in_warranty": True,
            "parts_cost": 0.0,
            "labour_cost": 0.0,
            "billable_amount": 0.0,
        }
    labour = LABOUR_BASE_CHARGE + LABOUR_PER_HOUR * hours
    return {
        "in_warranty": False,
        "parts_cost": round(parts, 2),
        "labour_cost": round(labour, 2),
        "billable_amount": round(parts + labour, 2),
    }


def is_active(record: WarrantyRecord, at: Optional[datetime] = None) -> bool:
    """True while the warranty is live (status check + expiry check)."""
    at = at or utcnow()
    expiry = record.expiry_date
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)
    return record.status == WarrantyStatus.ACTIVE and expiry >= at


def days_remaining(record: WarrantyRecord, at: Optional[datetime] = None) -> int:
    at = at or utcnow()
    expiry = record.expiry_date
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)
    return max(0, (expiry - at).days)


async def register_warranties_for_order(
    db: AsyncSession,
    order: Order,
    serials: list[SerialItem],
    start_at: Optional[datetime] = None,
) -> int:
    """Auto-create one warranty per serial on delivery. Idempotent (safe to re-call)."""
    start = start_at or utcnow()
    created = 0

    for serial in serials:
        existing = await db.scalar(
            select(WarrantyRecord).where(WarrantyRecord.serial_item_id == serial.id)
        )
        if existing:
            continue  # never duplicate a warranty for the same physical unit

        product = await db.get(Product, serial.product_id) if serial.product_id else None
        component = component_from_product(product, serial.serial_number)
        years = warranty_years_for(component)

        db.add(
            WarrantyRecord(
                customer_id=order.customer_id,
                serial_item_id=serial.id,
                order_id=order.id,
                component_type=component,
                warranty_years=years,
                start_date=start,
                expiry_date=start + timedelta(days=365 * years),
                status=WarrantyStatus.ACTIVE,
            )
        )
        created += 1

    if created:
        await db.flush()
    return created


async def find_warranty_for_serial(
    db: AsyncSession, serial_number: str
) -> tuple[Optional[SerialItem], Optional[WarrantyRecord]]:
    """Support lookup: serial -> linked warranty (or None)."""
    serial = await db.scalar(
        select(SerialItem).where(SerialItem.serial_number == serial_number)
    )
    if not serial:
        return None, None
    warranty = await db.scalar(
        select(WarrantyRecord).where(WarrantyRecord.serial_item_id == serial.id)
    )
    return serial, warranty
