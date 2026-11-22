from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Any

from sqlalchemy.orm import DeclarativeBase


def ok(data: Any, message: str | None = None, meta: dict | None = None) -> dict:
    """Standard response envelope understood by frontend/src/api.js."""
    response: dict[str, Any] = {"success": True, "data": data}
    if message:
        response["message"] = message
    if meta:
        response["meta"] = meta
    return response


def serialize(value: Any) -> Any:
    """Recursively convert ORM rows / Decimal / datetime into JSON-safe values."""
    if isinstance(value, DeclarativeBase):
        return {
            col.name: serialize(getattr(value, col.name))
            for col in value.__table__.columns
        }
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, dict):
        return {key: serialize(item) for key, item in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [serialize(item) for item in value]
    return value


def as_dict(instance: Any) -> dict:
    return serialize(instance)


ALIASES: dict[str, str] = {
    "name": "full_name",
    "issue_description": "description",
    "notes": "completion_notes",
    "staged_photos": "photos",
    "customer_signature_base64": "signature_data",
    "system_tested_ok": "testing_ok",
    "lead_name": "customer_name",
    "technician_name": "name",
    "reorder_threshold": "reorder_level",
    "unit_price_inr": "unit_price",
}


def apply_updates(instance: Any, data: dict, skip: set[str] | None = None) -> Any:
    """Apply fields that exist on the ORM model, translating frontend aliases."""
    ignored = skip or {"id", "created_at", "updated_at"}
    for key, value in data.items():
        if key in ignored:
            continue
        column = key if hasattr(instance, key) else ALIASES.get(key, key)
        if hasattr(instance, column):
            setattr(instance, column, value)
    return instance
