"""PS warranty + billing rule tests (Modules 10 & 11)."""
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

from app.models.warranty import WarrantyComponent, WarrantyStatus
from app.services.warranty_service import (
    days_remaining,
    is_active,
    ticket_charge,
    warranty_years_for,
)


def test_ps_warranty_durations():
    assert warranty_years_for(WarrantyComponent.SOLAR_PANEL) == 20
    assert warranty_years_for(WarrantyComponent.INVERTER) == 2
    assert warranty_years_for(WarrantyComponent.BATTERY) == 2


def test_in_warranty_service_is_free():
    charge = ticket_charge(True, parts_cost=3000, hours_worked=3)
    assert charge["billable_amount"] == 0.0
    assert charge["parts_cost"] == 0.0
    assert charge["labour_cost"] == 0.0


def test_out_of_warranty_is_billed():
    charge = ticket_charge(False, parts_cost=1000, hours_worked=2)
    assert charge["labour_cost"] == 1500 + 2 * 500
    assert charge["billable_amount"] == 3500.0


def test_expiry_detection():
    now = datetime.now(timezone.utc)
    live = SimpleNamespace(
        expiry_date=now + timedelta(days=30), status=WarrantyStatus.ACTIVE
    )
    old = SimpleNamespace(
        expiry_date=now - timedelta(days=1), status=WarrantyStatus.ACTIVE
    )
    assert is_active(live) is True
    assert is_active(old) is False
    assert days_remaining(live) >= 29
