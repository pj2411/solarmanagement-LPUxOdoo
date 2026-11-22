from __future__ import annotations

import shutil
import uuid
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

import razorpay
from app import models
from app.config import settings
from app.database import get_db
from app.payloads import (
    installation_payload,
    inventory_payload,
    order_payload,
    serial_payload,
)
from app.redis_client import cache_get, cache_set, invalidate_prefix
from app.schemas import DispatchIn, OrderPayIn, RazorpayOrderCreateIn, RazorpayVerifyIn
from app.services.bom import calculate
from app.utils import apply_updates, ok, serialize

router = APIRouter(tags=["operations"])

UPLOAD_DIR = Path(__file__).resolve().parents[3] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _inventory_payload(item: models.InventoryItem) -> dict:
    return inventory_payload(item)


def _order_payload(db: Session, order: models.Order) -> dict:
    return order_payload(db, order)


def _serial_payload(unit: models.SerialUnit, db: Session) -> dict:
    return serial_payload(db, unit)


def _installation_payload(db: Session, row: models.Installation) -> dict:
    return installation_payload(db, row)


# ---------------------------------------------------------------------------
# Inventory
# ---------------------------------------------------------------------------


@router.get("/api/inventory")
def get_inventory(db: Session = Depends(get_db)):
    cached = cache_get("inventory")
    if cached is not None:
        return ok(cached)
    rows = db.query(models.InventoryItem).order_by(models.InventoryItem.id).all()
    data = [_inventory_payload(row) for row in rows]
    cache_set("inventory", data)
    return ok(data)


@router.post("/api/inventory")
def create_inventory(payload: dict, db: Session = Depends(get_db)):
    selling_price = payload.get(
        "selling_price_inr", payload.get("unit_price", payload.get("price", 0))
    )
    item = models.InventoryItem(
        sku=payload.get("sku") or f"SKU-{uuid.uuid4().hex[:8].upper()}",
        name=payload.get("name", "Unnamed item"),
        category=payload.get("category", "other").upper(),
        unit=payload.get("unit", "pcs"),
        unit_price=selling_price,
        unit_cost_inr=payload.get("unit_cost_inr", Decimal(str(selling_price)) * Decimal("0.72")),
        stock_qty=payload.get("stock_qty", payload.get("quantity", 0)),
        reorder_level=payload.get("reorder_threshold", payload.get("reorder_level", payload.get("reorder_point", 5))),
        image_url=payload.get("image_url"),
        description=payload.get("description"),
    )
    if db.query(models.InventoryItem).filter(models.InventoryItem.sku == item.sku).first():
        raise HTTPException(409, "SKU already exists")
    db.add(item)
    db.commit()
    db.refresh(item)
    invalidate_prefix("inventory")
    return ok(_inventory_payload(item), "Inventory item created")


@router.post("/api/inventory/{item_id}/restock")
def restock(item_id: int, payload: dict, db: Session = Depends(get_db)):
    item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(404, "Inventory item not found")
    quantity = int(payload.get("quantity", 0))
    if quantity <= 0:
        raise HTTPException(400, "Quantity must be positive")
    item.stock_qty += quantity
    db.commit()
    db.refresh(item)
    invalidate_prefix("inventory")
    return ok(_inventory_payload(item), "Stock updated")


# ---------------------------------------------------------------------------
# Orders, payments, subsidy
# ---------------------------------------------------------------------------


@router.get("/api/orders")
def get_orders(db: Session = Depends(get_db)):
    cached = cache_get("orders")
    if cached is not None:
        return ok(cached)
    rows = db.query(models.Order).order_by(models.Order.id.desc()).all()
    data = [_order_payload(db, row) for row in rows]
    cache_set("orders", data)
    return ok(data)


@router.post("/api/orders", status_code=201)
def create_order(payload: dict, db: Session = Depends(get_db)):
    total = Decimal(str(payload.get("total_amount", payload.get("amount", 0)) or 0))
    advance = Decimal(str(payload.get("advance_amount", 0) or 0))
    order = models.Order(
        order_number=payload.get("order_number")
        or f"ORD-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:5].upper()}",
        lead_id=payload.get("lead_id"),
        quotation_id=payload.get("quotation_id"),
        customer_name=payload.get("customer_name", "Walk-in Customer"),
        customer_phone=payload.get("customer_phone", payload.get("phone")),
        address=payload.get("address"),
        capacity_kw=payload.get("capacity_kw", 0),
        system_type=payload.get("system_type", "ON_GRID"),
        total_amount=total,
        advance_amount=advance,
        paid_amount=advance,
        balance_amount=total - advance,
        status=payload.get("status", "PENDING"),
        payment_status="PAID" if advance >= total else "PARTIAL" if advance > 0 else "PENDING",
        subsidy_status=payload.get("subsidy_status", "PENDING"),
        subsidy_amount=payload.get("subsidy_amount", 0),
        order_date=payload.get("order_date") or date.today(),
    )
    db.add(order)
    lead_id = payload.get("lead_id")
    if lead_id:
        lead = db.query(models.Lead).filter(models.Lead.id == lead_id).first()
        if lead:
            lead.pipeline_stage = "ORDERED"
    db.commit()
    db.refresh(order)
    invalidate_prefix("orders")
    invalidate_prefix("leads")
    return ok(_order_payload(db, order), "Order created")


@router.post("/api/orders/{order_id}/pay")
@router.post("/api/v1/orders/{order_id}/pay")
def record_payment(order_id: int, payload: OrderPayIn, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(404, "Order not found")
    amount = Decimal(payload.amount)
    if amount <= 0:
        raise HTTPException(400, "Amount must be positive")
    payment = models.Payment(
        order_id=order.id,
        amount=amount,
        method=payload.method,
        reference=payload.reference,
        notes=payload.notes,
        status="PAID",
    )
    order.paid_amount = Decimal(order.paid_amount or 0) + amount
    order.balance_amount = max(Decimal("0"), Decimal(order.total_amount) - order.paid_amount)
    order.payment_status = (
        "PAID" if order.balance_amount == 0 else "PARTIAL"
    )
    if order.status == "PENDING":
        order.status = "CONFIRMED"
    db.add(payment)

    # Rule #2: the first payment explodes the BoM, reserves hardware and
    # creates the field installation job exactly once.
    low_stock_alerts: list[dict] = []
    installation_job_id = None
    existing_job = (
        db.query(models.Installation)
        .filter(models.Installation.order_id == order.id)
        .first()
    )
    installation_job_id = existing_job.id if existing_job else None
    if not order.bom_deducted:
        breakdown = calculate(
            Decimal(str(order.capacity_kw or 3)),
            order.system_type or "ON_GRID",
            db,
        )
        for component in breakdown["items"]:
            inventory_item = (
                db.query(models.InventoryItem)
                .filter(models.InventoryItem.sku == component["sku"])
                .first()
                or db.query(models.InventoryItem)
                .filter(models.InventoryItem.name == component["name"])
                .first()
            )
            if inventory_item:
                inventory_item.stock_qty = max(
                    0, int(inventory_item.stock_qty or 0) - int(component["quantity"])
                )
                if inventory_item.stock_qty <= int(inventory_item.reorder_level or 0):
                    low_stock_alerts.append(
                        {
                            "name": inventory_item.name,
                            "current_stock": inventory_item.stock_qty,
                        }
                    )
        if not existing_job:
            technician = (
                db.query(models.Employee)
                .filter(models.Employee.role == "TECHNICIAN")
                .first()
            )
            job = models.Installation(
                order_id=order.id,
                lead_id=order.lead_id,
                technician_id=technician.id if technician else None,
                customer_name=order.customer_name,
                system_kw=order.capacity_kw or 0,
                scheduled_date=date.today() + timedelta(days=3),
                status="SCHEDULED",
            )
            db.add(job)
            db.flush()
            installation_job_id = job.id
        order.bom_deducted = True

    db.commit()
    db.refresh(order)
    invalidate_prefix("orders")
    invalidate_prefix("inventory")
    invalidate_prefix("installations")
    invalidate_prefix("analytics")
    result = _order_payload(db, order)
    result.update(
        {
            "order_id": order.id,
            "installation_job_id": installation_job_id,
            "low_stock_alerts": low_stock_alerts,
        }
    )
    return ok(result, "Payment recorded")


@router.post("/api/orders/{order_id}/razorpay/create-order")
@router.post("/api/v1/orders/{order_id}/razorpay/create-order")
def create_razorpay_order(
    order_id: int, payload: RazorpayOrderCreateIn | None = None, db: Session = Depends(get_db)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(404, "Order not found")
    amount = payload.amount if payload and payload.amount else order.balance_amount
    if not amount or amount <= 0:
        amount = Decimal("50000.00")

    amount_in_paise = int(amount * 100)
    receipt_id = f"rcpt_{order.id}_{int(datetime.now(timezone.utc).timestamp())}"

    try:
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        rzp_order = client.order.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": receipt_id,
            "notes": {
                "order_id": str(order.id),
                "customer_name": str(order.customer_name or "Solar Customer"),
                "order_number": str(order.order_number or ""),
            }
        })
    except Exception as e:
        raise HTTPException(500, f"Razorpay order initialization failed: {str(e)}")

    return ok({
        "key_id": settings.RAZORPAY_KEY_ID,
        "razorpay_order_id": rzp_order["id"],
        "amount": amount_in_paise,
        "amount_inr": float(amount),
        "currency": "INR",
        "customer_name": order.customer_name or "Solar Customer",
        "customer_phone": order.customer_phone or "",
        "order_number": order.order_number,
        "order_id": order.id,
    }, "Razorpay checkout order initialized")


@router.post("/api/orders/{order_id}/razorpay/verify")
@router.post("/api/v1/orders/{order_id}/razorpay/verify")
def verify_razorpay_payment(
    order_id: int, payload: RazorpayVerifyIn, db: Session = Depends(get_db)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(404, "Order not found")

    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": payload.razorpay_order_id,
            "razorpay_payment_id": payload.razorpay_payment_id,
            "razorpay_signature": payload.razorpay_signature
        })
    except Exception:
        raise HTTPException(400, "Razorpay payment signature verification failed. Untrusted payment.")

    amount = Decimal(str(payload.amount))
    payment = models.Payment(
        order_id=order.id,
        amount=amount,
        method="RAZORPAY",
        reference=payload.razorpay_payment_id,
        notes=f"Razorpay Order: {payload.razorpay_order_id}",
        status="PAID",
    )
    order.paid_amount = Decimal(order.paid_amount or 0) + amount
    order.balance_amount = max(Decimal("0"), Decimal(order.total_amount) - order.paid_amount)
    order.payment_status = "PAID" if order.balance_amount == 0 else "PARTIAL"
    if order.status == "PENDING":
        order.status = "CONFIRMED"
    db.add(payment)

    low_stock_alerts: list[dict] = []
    installation_job_id = None
    existing_job = db.query(models.Installation).filter(models.Installation.order_id == order.id).first()
    installation_job_id = existing_job.id if existing_job else None
    if not order.bom_deducted:
        breakdown = calculate(Decimal(str(order.capacity_kw or 3)), order.system_type or "ON_GRID", db)
        for component in breakdown["items"]:
            inventory_item = (
                db.query(models.InventoryItem).filter(models.InventoryItem.sku == component["sku"]).first()
                or db.query(models.InventoryItem).filter(models.InventoryItem.name == component["name"]).first()
            )
            if inventory_item:
                inventory_item.stock_qty = max(0, int(inventory_item.stock_qty or 0) - int(component["quantity"]))
                if inventory_item.stock_qty <= int(inventory_item.reorder_level or 0):
                    low_stock_alerts.append({"name": inventory_item.name, "current_stock": inventory_item.stock_qty})
        if not existing_job:
            technician = db.query(models.Employee).filter(models.Employee.role == "TECHNICIAN").first()
            job = models.Installation(
                order_id=order.id,
                lead_id=order.lead_id,
                technician_id=technician.id if technician else None,
                customer_name=order.customer_name,
                system_kw=order.capacity_kw or 0,
                scheduled_date=date.today() + timedelta(days=3),
                status="SCHEDULED",
            )
            db.add(job)
            db.flush()
            installation_job_id = job.id
        order.bom_deducted = True

    db.commit()
    db.refresh(order)
    invalidate_prefix("orders")
    invalidate_prefix("inventory")
    invalidate_prefix("installations")
    invalidate_prefix("analytics")
    result = _order_payload(db, order)
    result.update({
        "order_id": order.id,
        "installation_job_id": installation_job_id,
        "low_stock_alerts": low_stock_alerts,
        "razorpay_payment_id": payload.razorpay_payment_id,
        "razorpay_order_id": payload.razorpay_order_id,
    })
    return ok(result, "Razorpay payment verified and recorded successfully")


@router.put("/api/orders/{order_id}/subsidy")
def update_subsidy(
    order_id: int,
    status_value: str = Query(..., alias="status"),
    db: Session = Depends(get_db),
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(404, "Order not found")
    order.subsidy_status = status_value.upper()
    db.commit()
    db.refresh(order)
    invalidate_prefix("orders")
    invalidate_prefix("analytics")
    return ok(_order_payload(db, order), "Subsidy status updated")


# ---------------------------------------------------------------------------
# Warehouse: serials, dispatch, delivery + warranty activation
# ---------------------------------------------------------------------------


@router.get("/api/warehouse/serials")
def get_serials(db: Session = Depends(get_db)):
    cached = cache_get("serials")
    if cached is not None:
        return ok(cached)
    rows = db.query(models.SerialUnit).order_by(models.SerialUnit.id).all()
    data = [_serial_payload(row, db) for row in rows]
    cache_set("serials", data)
    return ok(data)


@router.post("/api/warehouse/dispatch", status_code=201)
def dispatch_serial(payload: DispatchIn, db: Session = Depends(get_db)):
    serial = (
        db.query(models.SerialUnit)
        .filter(models.SerialUnit.serial_number == payload.serial_number)
        .first()
    )
    if not serial:
        raise HTTPException(404, "Serial number not found")
    if serial.status.upper() not in {"IN_STOCK", "AVAILABLE"}:
        raise HTTPException(409, f"Serial is already {serial.status}")
    item = (
        db.query(models.InventoryItem)
        .filter(models.InventoryItem.id == serial.inventory_item_id)
        .first()
    )
    if item and item.stock_qty > 0:
        item.stock_qty -= 1
    serial.status = "IN_TRANSIT"
    serial.dispatched_at = datetime.now(timezone.utc)
    row = models.Dispatch(
        order_id=payload.order_id,
        serial_unit_id=serial.id,
        serial_number=serial.serial_number,
        receiver_name=payload.receiver_name,
        receiver_phone=payload.receiver_phone,
        delivery_address=payload.delivery_address,
        notes=payload.notes,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    invalidate_prefix("serials")
    invalidate_prefix("inventory")
    invalidate_prefix("dispatch")
    return ok(serialize(row), "Serial dispatched")


@router.post("/api/warehouse/delivery-confirm/{serial_number}")
def confirm_delivery(serial_number: str, db: Session = Depends(get_db)):
    serial = (
        db.query(models.SerialUnit)
        .filter(models.SerialUnit.serial_number == serial_number)
        .first()
    )
    if not serial:
        raise HTTPException(404, "Serial number not found")
    dispatch = (
        db.query(models.Dispatch)
        .filter(models.Dispatch.serial_unit_id == serial.id)
        .order_by(models.Dispatch.id.desc())
        .first()
    )
    if not dispatch:
        raise HTTPException(409, "No dispatch record for this serial")
    now = datetime.now(timezone.utc)
    dispatch.delivery_confirmed_at = now
    dispatch.status = "DELIVERED"
    serial.status = "DELIVERED"

    item = (
        db.query(models.InventoryItem)
        .filter(models.InventoryItem.id == serial.inventory_item_id)
        .first()
    )
    category = (item.category if item else "").upper()
    months = 240 if "PANEL" in category else 24 if "INVERTER" in category or "BATTERY" in category else 12
    start = now.date()
    existing = (
        db.query(models.Warranty)
        .filter(models.Warranty.serial_unit_id == serial.id)
        .first()
    )
    if not existing:
        db.add(
            models.Warranty(
                serial_unit_id=serial.id,
                order_id=dispatch.order_id,
                start_date=start,
                duration_months=months,
                expiry_date=start + timedelta(days=months * 30),
                status="ACTIVE",
            )
        )
    db.commit()
    invalidate_prefix("serials")
    invalidate_prefix("dispatch")
    invalidate_prefix("analytics")
    return ok(
        _serial_payload(serial, db), "Delivery confirmed; warranty activated"
    )


@router.get("/api/dispatch")
def get_dispatch(db: Session = Depends(get_db)):
    rows = db.query(models.Dispatch).order_by(models.Dispatch.id.desc()).all()
    return ok([serialize(row) for row in rows])


@router.get("/api/warranties")
def get_warranties(db: Session = Depends(get_db)):
    rows = db.query(models.Warranty).order_by(models.Warranty.id).all()
    return ok([serialize(row) for row in rows])


# ---------------------------------------------------------------------------
# Installation lifecycle
# ---------------------------------------------------------------------------


@router.get("/api/installations")
def get_installations(db: Session = Depends(get_db)):
    cached = cache_get("installations")
    if cached is not None:
        return ok(cached)
    rows = db.query(models.Installation).order_by(models.Installation.id.desc()).all()
    data = [_installation_payload(db, row) for row in rows]
    cache_set("installations", data)
    return ok(data)


@router.post("/api/installations", status_code=201)
def create_installation(payload: dict, db: Session = Depends(get_db)):
    row = models.Installation(**{
        key: value
        for key, value in payload.items()
        if hasattr(models.Installation, key) and key != "id"
    })
    row.status = payload.get("status", "SCHEDULED")
    db.add(row)
    db.commit()
    db.refresh(row)
    invalidate_prefix("installations")
    return ok(_installation_payload(db, row), "Installation scheduled")


@router.put("/api/installations/{installation_id}")
def update_installation(installation_id: int, payload: dict, db: Session = Depends(get_db)):
    row = db.query(models.Installation).filter(models.Installation.id == installation_id).first()
    if not row:
        raise HTTPException(404, "Installation not found")
    apply_updates(row, payload)
    db.commit()
    db.refresh(row)
    invalidate_prefix("installations")
    return ok(_installation_payload(db, row), "Installation updated")


@router.post("/api/v1/installations/{installation_id}/sync")
def sync_installation(installation_id: int, payload: dict, db: Session = Depends(get_db)):
    update_installation(installation_id, payload, db)
    row = db.query(models.Installation).filter(models.Installation.id == installation_id).first()
    if payload.get("system_tested_ok") is not None:
        row.testing_ok = bool(payload["system_tested_ok"])
    if payload.get("staged_photos"):
        row.photos = payload["staged_photos"]
    db.commit()
    db.refresh(row)
    invalidate_prefix("installations")
    invalidate_prefix("analytics")
    return ok(_installation_payload(db, row), "Installation data synced")


@router.post("/api/v1/installations/{installation_id}/handover")
def handover_installation(installation_id: int, payload: dict, db: Session = Depends(get_db)):
    row = db.query(models.Installation).filter(models.Installation.id == installation_id).first()
    if not row:
        raise HTTPException(404, "Installation not found")
    resistance = payload.get("earth_resistance_ohms")
    if resistance is not None and float(resistance) >= 5.0:
        raise HTTPException(
            400, "Electrical safety violation: earth resistance must be below 5 ohms"
        )
    signature = payload.get("customer_signature_base64") or row.signature_data
    if not signature:
        raise HTTPException(400, "Customer signature is required for handover")
    apply_updates(row, payload)
    row.signature_data = signature
    row.testing_ok = True
    row.system_tested_ok = True
    row.progress_pct = 100
    row.status = "INSTALLED"
    lead = db.get(models.Lead, row.lead_id) if row.lead_id else None
    if lead:
        lead.pipeline_stage = "INSTALLED"
    db.commit()
    invalidate_prefix("installations")
    invalidate_prefix("leads")
    invalidate_prefix("analytics")
    return ok(_installation_payload(db, row), "Handover recorded; project installed")


@router.post("/api/installations/{installation_id}/complete")
def complete_installation(
    installation_id: int,
    customer_signature_base64: str = Query(""),
    completion_notes: str = Query(""),
    db: Session = Depends(get_db),
):
    row = db.query(models.Installation).filter(models.Installation.id == installation_id).first()
    if not row:
        raise HTTPException(404, "Installation not found")
    row.signature_data = customer_signature_base64 or row.signature_data
    row.completion_notes = completion_notes or row.completion_notes
    row.finish_time = datetime.now(timezone.utc)
    row.status = "COMPLETED"
    row.testing_ok = True
    db.commit()
    invalidate_prefix("installations")
    return ok(_installation_payload(db, row), "Installation completed")


@router.post("/api/v1/media/upload")
async def upload_media(file: UploadFile = File(...), latitude: float | None = None,
                       longitude: float | None = None):
    extension = Path(file.filename or "upload.bin").suffix.lower() or ".bin"
    filename = f"{uuid.uuid4().hex}{extension}"
    destination = UPLOAD_DIR / filename
    with destination.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return ok(
        {
            "filename": filename,
            "url": f"/uploads/{filename}",
            "latitude": latitude,
            "longitude": longitude,
        },
        "Media uploaded",
    )
