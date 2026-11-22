"""Database-driven Bill of Materials and pricing engine."""

from __future__ import annotations

import math
from decimal import Decimal

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app import models
from app.payloads import inventory_payload
from app.utils import serialize

# Fallback price list used only until seed.py has populated bom_templates.
DEFAULT_TEMPLATES = [
    ("Solar Panel 550W", "PANEL", Decimal("1.82"), Decimal("10500"), "pcs"),
    ("Hybrid Inverter", "INVERTER", Decimal("0.20"), Decimal("28500"), "pcs"),
    ("Mounting Structure", "STRUCTURE", Decimal("1.00"), Decimal("3200"), "pcs"),
    ("Charge Controller", "CONTROLLER", Decimal("0.10"), Decimal("5600"), "pcs"),
    ("DC Switch Box", "SAFETY", Decimal("0.10"), Decimal("1850"), "pcs"),
    ("Cabling & Connectors", "CABLE", Decimal("1.00"), Decimal("2400"), "set"),
    ("Earthing Kit", "EARTHING", Decimal("1.00"), Decimal("1900"), "set"),
]


def ensure_templates(db: Session) -> None:
    if db.query(models.BomTemplate).count() == 0:
        for name, category, per_kw, price, unit in DEFAULT_TEMPLATES:
            db.add(
                models.BomTemplate(
                    name=name,
                    system_type="COMMON",
                    capacity_kw=0,
                    category=category,
                    item_name=name,
                    quantity_per_kw=per_kw,
                    fixed_quantity=0,
                    unit_price=price,
                    unit=unit,
                )
            )
        db.add(
            models.BomTemplate(
                name="Lithium Battery 5kWh",
                system_type="OFF_GRID",
                capacity_kw=0,
                category="BATTERY",
                item_name="Lithium Battery 5kWh",
                quantity_per_kw=Decimal("0.34"),
                fixed_quantity=0,
                unit_price=Decimal("38500"),
                unit="pcs",
            )
        )
        db.commit()


def installation_charge(kw: Decimal) -> Decimal:
    return Decimal("12000") + kw * Decimal("2500")


def subsidy_for(kw: Decimal, system_type: str) -> Decimal:
    """PM Surya Ghar residential DBT slabs (matching the public calculator)."""
    if system_type.upper().replace("-", "_") != "ON_GRID":
        return Decimal("0")
    if kw <= 1:
        return Decimal("30000")
    if kw <= 2:
        return Decimal("60000")
    return Decimal("78000")


def _inventory_for(db: Session, template: models.BomTemplate) -> models.InventoryItem | None:
    name = template.item_name or template.name
    return (
        db.query(models.InventoryItem)
        .filter(
            or_(
                models.InventoryItem.name.ilike(f"%{name}%"),
                models.InventoryItem.sku.ilike(f"%{name.split()[0]}%"),
            )
        )
        .first()
    )


def _template_quantity(template: models.BomTemplate, kw: Decimal) -> int:
    value = Decimal(template.quantity_per_kw or 0) * kw
    if value > 0:
        return math.ceil(float(value))
    return int(template.fixed_quantity or 0)


def template_list(db: Session) -> list[dict]:
    """Group flat BOM rows into the kit cards the Inventory screen renders."""
    ensure_templates(db)
    rows = (
        db.query(models.BomTemplate)
        .filter(models.BomTemplate.is_active.is_(True))
        .order_by(models.BomTemplate.category, models.BomTemplate.id)
        .all()
    )
    groups: dict[tuple[Decimal, str], dict] = {}
    for row in rows:
        key = (row.capacity_kw or Decimal("0"), row.system_type or "COMMON")
        if key not in groups:
            kw = key[0]
            groups[key] = {
                "id": row.id,
                "capacity_kw": float(kw),
                "system_type": key[1],
                "installation_charge_inr": float(installation_charge(kw)),
                "description": f"{key[1].replace('_', ' ').title()} {kw:g} kW turnkey kit",
                "items": [],
            }
        item = _inventory_for(db, row)
        qty = _template_quantity(row, key[0])
        groups[key]["items"].append(
            {
                "id": row.id,
                "template_id": row.id,
                "inventory_item_id": item.id if item else row.id,
                "quantity": qty,
                "inventory_item": inventory_payload(item)
                if item
                else {
                    "id": row.id,
                    "sku": f"BOM-{row.id:04d}",
                    "name": row.item_name,
                    "category": row.category,
                    "unit_cost_inr": float(row.unit_price or 0) * 0.72,
                    "selling_price_inr": float(row.unit_price or 0),
                    "stock_qty": 0,
                    "reorder_threshold": 0,
                },
            }
        )
    return list(groups.values())


def calculate(kw: Decimal, system_type: str, db: Session) -> dict:
    """Return the exact breakdown consumed by QuotationView."""
    ensure_templates(db)
    templates = (
        db.query(models.BomTemplate)
        .filter(models.BomTemplate.is_active.is_(True))
        .order_by(models.BomTemplate.category, models.BomTemplate.id)
        .all()
    )
    st = (system_type or "ON_GRID").upper().replace("-", "_")
    items: list[dict] = []
    subtotal = Decimal("0")
    for template in templates:
        ttype = (template.system_type or "COMMON").upper().replace("-", "_")
        if ttype not in {"COMMON", st}:
            continue
        quantity = _template_quantity(template, kw)
        if quantity <= 0:
            continue
        inventory = _inventory_for(db, template)
        price = Decimal(str(inventory.unit_price if inventory else template.unit_price or 0))
        cost = Decimal(
            str(
                inventory.unit_cost_inr
                if inventory and inventory.unit_cost_inr
                else price * Decimal("0.72")
            )
        )
        line_total = quantity * price
        cost_subtotal = quantity * cost
        subtotal += line_total
        items.append(
            {
                "sku": inventory.sku if inventory else f"BOM-{template.id:04d}",
                "name": inventory.name if inventory else template.item_name,
                "item_name": inventory.name if inventory else template.item_name,
                "category": template.category or (inventory.category if inventory else ""),
                "quantity": quantity,
                "unit": template.unit or "pcs",
                "unit_price_inr": float(price),
                "unit_cost_inr": float(cost),
                "subtotal_inr": float(line_total),
                "cost_subtotal_inr": float(cost_subtotal),
                "stock_qty": int(inventory.stock_qty or 0) if inventory else 0,
                "reorder_threshold": int(inventory.reorder_level or 0) if inventory else 0,
                "unit_price": float(price),
                "line_total": float(line_total),
            }
        )

    install = installation_charge(kw)
    subsidy = subsidy_for(kw, st)
    grand_total = max(Decimal("0"), subtotal + install - subsidy)
    return {
        "capacity_kw": float(kw),
        "system_type": st,
        "items": items,
        "bom": items,
        "hardware_total_inr": float(subtotal),
        "installation_charge_inr": float(install),
        "subsidy_discount_inr": float(subsidy),
        "grand_total_inr": float(grand_total),
        # Legacy aliases retained for older PDF/CRM code.
        "subtotal": float(subtotal),
        "installation_charge": float(install),
        "subsidy_estimate": float(subsidy),
        "discount": 0.0,
        "total": float(grand_total),
        "net_after_subsidy": float(grand_total),
    }
