"""Frontend-compatible response builders.

The React views were authored against a richer vocabulary (`*_inr` fields,
nested `lead`/`order`/`technician` objects and explicit workflow enums). These
helpers translate ORM rows into that vocabulary while keeping the database
model normalised. Every screen is therefore fed from PostgreSQL, not from the
frontend's old synthetic defaults.
"""

from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Any

from sqlalchemy.orm import Session

from app import models
from app.utils import serialize

SUBSIDY_STATUSES = {"NOT_APPLIED", "APPLIED", "INSPECTED", "DISBURSED"}


def money(value: Any) -> float:
    return float(value or 0)


def _iso(value: Any) -> str | None:
    return value.isoformat() if isinstance(value, (datetime, date)) else value


def lead_payload(row: models.Lead | None) -> dict | None:
    if not row:
        return None
    data = serialize(row)
    data["follow_up_notes"] = row.follow_up_notes or row.notes or ""
    data["grid_suitable"] = bool(row.grid_suitable)
    data["monthly_bill_inr"] = money(row.monthly_bill_inr)
    data["capacity_kw"] = money(row.capacity_kw)
    return data


def inventory_payload(row: models.InventoryItem) -> dict:
    data = serialize(row)
    data["unit_cost_inr"] = money(
        row.unit_cost_inr or Decimal(str(row.unit_price or 0)) * Decimal("0.72")
    )
    data["selling_price_inr"] = money(row.unit_price)
    data["reorder_threshold"] = int(row.reorder_level or 0)
    data["status"] = (
        "OUT_OF_STOCK"
        if int(row.stock_qty or 0) <= 0
        else "LOW_STOCK"
        if int(row.stock_qty or 0) <= int(row.reorder_level or 0)
        else "IN_STOCK"
    )
    return data


def quotation_payload(db: Session, row: models.Quotation | None) -> dict | None:
    if not row:
        return None
    data = serialize(row)
    data["lead"] = lead_payload(db.get(models.Lead, row.lead_id))
    data["hardware_total_inr"] = money(row.subtotal)
    data["installation_charge_inr"] = money(row.installation_charge)
    data["subsidy_discount_inr"] = money(row.subsidy_estimate)
    data["grand_total_inr"] = money(row.total)
    return data


def _frontend_payment_status(row: models.Order) -> str:
    paid = money(row.paid_amount)
    balance = money(row.balance_amount)
    if paid > 0 and balance <= 0:
        return "FULLY_PAID"
    if paid > 0:
        return "ADVANCE_PAID"
    return "PENDING"


def _subsidy_tracking_status(row: models.Order) -> str:
    value = (row.subsidy_status or "").upper()
    if value in SUBSIDY_STATUSES:
        return value
    if value in {"APPROVED", "PAID", "DISBURSED"}:
        return "DISBURSED"
    return "NOT_APPLIED"


def order_payload(db: Session, row: models.Order | None) -> dict | None:
    if not row:
        return None
    data = serialize(row)
    data["lead"] = lead_payload(db.get(models.Lead, row.lead_id) if row.lead_id else None)
    data["quotation"] = quotation_payload(
        db, db.get(models.Quotation, row.quotation_id) if row.quotation_id else None
    )
    data["total_amount_inr"] = money(row.total_amount)
    data["advance_paid_inr"] = money(row.paid_amount)
    data["balance_due_inr"] = money(row.balance_amount)
    data["payment_status"] = _frontend_payment_status(row)
    data["subsidy_tracking_status"] = _subsidy_tracking_status(row)
    data["bom_deducted"] = bool(row.bom_deducted)
    data["order_id"] = row.id
    data["created_at"] = _iso(row.created_at)
    return data


_COMPONENT_TYPES = {
    "PANEL": "PANEL",
    "SOLAR PANEL": "PANEL",
    "INVERTER": "INVERTER",
    "BATTERY": "BATTERY",
    "CONTROLLER": "CHARGE_CONTROLLER",
}


def _component_type(category: str | None) -> str:
    value = (category or "").upper()
    for key, result in _COMPONENT_TYPES.items():
        if key in value:
            return result
    return "INVERTER"


def serial_payload(db: Session, row: models.SerialUnit | None) -> dict | None:
    if not row:
        return None
    data = serialize(row)
    item = db.get(models.InventoryItem, row.inventory_item_id)
    dispatch = (
        db.query(models.Dispatch)
        .filter(models.Dispatch.serial_unit_id == row.id)
        .order_by(models.Dispatch.id.desc())
        .first()
    )
    order = db.get(models.Order, dispatch.order_id) if dispatch else None
    lead = db.get(models.Lead, order.lead_id) if order and order.lead_id else None
    warranty = (
        db.query(models.Warranty)
        .filter(models.Warranty.serial_unit_id == row.id)
        .first()
    )

    data["inventory_item"] = inventory_payload(item) if item else None
    data["component_type"] = _component_type(item.category if item else None)
    data["order_id"] = dispatch.order_id if dispatch else None
    data["lead_id"] = lead.id if lead else None
    data["lead"] = lead_payload(lead)
    data["packed_status"] = row.status.upper() in {"IN_STOCK", "PACKED"}
    data["delivery_confirmed"] = bool(
        dispatch and dispatch.delivery_confirmed_at is not None
    )
    data["warranty_start_date"] = _iso(warranty.start_date) if warranty else None
    data["warranty_expiry_date"] = _iso(warranty.expiry_date) if warranty else None
    data["warranty_years"] = (
        round(float(warranty.duration_months or 0) / 12, 1) if warranty else 0
    )
    if warranty:
        expired = warranty.expiry_date and warranty.expiry_date < date.today()
        data["warranty_status"] = "EXPIRED" if expired else warranty.status
    else:
        data["warranty_status"] = "PENDING"
    return data


def employee_payload(row: models.Employee | None) -> dict | None:
    if not row:
        return None
    data = serialize(row)
    data["hourly_rate"] = money(row.hourly_rate)
    data["leave_status"] = row.leave_status or "ACTIVE"
    data["status"] = "ACTIVE" if row.active else "INACTIVE"
    data["joined_date"] = _iso(row.joined_at)
    return data


def installation_payload(db: Session, row: models.Installation | None) -> dict | None:
    if not row:
        return None
    data = serialize(row)
    order = db.get(models.Order, row.order_id) if row.order_id else None
    technician = (
        db.get(models.Employee, row.technician_id) if row.technician_id else None
    )
    data["order"] = order_payload(db, order)
    data["technician"] = employee_payload(technician)
    data["customer"] = row.customer_name or (
        data["order"]["lead"]["customer_name"]
        if data["order"] and data["order"].get("lead")
        else "Customer"
    )
    data["capacity_kw"] = money(row.system_kw)
    data["verified_kw"] = money(row.verified_kw or row.system_kw)
    data["progress_pct"] = int(row.progress_pct or 0)
    data["hours_logged"] = money(row.hours_logged)
    data["system_tested_ok"] = bool(row.system_tested_ok or row.testing_ok)
    data["voc_voltage"] = money(row.voc_voltage)
    data["isc_current"] = money(row.isc_current)
    data["earth_resistance_ohms"] = money(row.earth_resistance_ohms)
    photos = row.photos or []
    data["install_photo_url"] = row.install_photo_url or (
        photos[0] if isinstance(photos, list) and photos else None
    )
    data["customer_signature_base64"] = row.signature_data
    data["is_completed"] = row.status in {"COMPLETED", "INSTALLED", "HANDOVER"}
    data["end_time"] = _iso(row.finish_time)
    data["start_time"] = _iso(row.start_time)
    data["scheduled_date"] = _iso(row.scheduled_date)
    data["notes"] = row.completion_notes
    return data


def ticket_payload(db: Session, row: models.Ticket | None) -> dict | None:
    if not row:
        return None
    data = serialize(row)
    lead = db.get(models.Lead, row.lead_id) if row.lead_id else None
    serial = (
        db.get(models.SerialUnit, row.serial_unit_id) if row.serial_unit_id else None
    )
    technician = (
        db.get(models.Employee, row.assigned_technician_id)
        if row.assigned_technician_id
        else None
    )
    data["lead"] = lead_payload(lead)
    data["assigned_technician"] = employee_payload(technician)
    data["serial_number"] = serial.serial_number if serial else None
    data["issue_description"] = row.description
    data["is_under_warranty"] = bool(row.in_warranty)
    data["parts_cost_inr"] = money(row.parts_cost)
    data["labor_cost_inr"] = money(row.labour_cost)
    data["billed_invoice_amount_inr"] = money(row.billable_amount)
    data["resolution_type"] = row.resolution_type or "REPAIR"
    if data.get("status") == "CLOSED":
        data["status"] = "RESOLVED_CONFIRMED"
    return data
