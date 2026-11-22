from __future__ import annotations

from datetime import date, datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.payloads import employee_payload, ticket_payload
from app.redis_client import cache_get, cache_set, invalidate_prefix
from app.schemas import TicketIn
from app.utils import apply_updates, ok, serialize

router = APIRouter(tags=["support"])


def _ticket_payload(db: Session, row: models.Ticket) -> dict:
    return ticket_payload(db, row)


def _employee_payload(row: models.Employee) -> dict:
    return employee_payload(row)


# ---------------------------------------------------------------------------
# Helpdesk tickets
# ---------------------------------------------------------------------------


@router.get("/api/tickets")
def get_tickets(db: Session = Depends(get_db)):
    cached = cache_get("tickets")
    if cached is not None:
        return ok(cached)
    rows = db.query(models.Ticket).order_by(models.Ticket.id.desc()).all()
    data = [_ticket_payload(db, row) for row in rows]
    cache_set("tickets", data)
    return ok(data)


@router.post("/api/tickets", status_code=201)
def create_ticket(payload: TicketIn, db: Session = Depends(get_db)):
    serial = None
    if payload.serial_unit_id:
        serial = db.get(models.SerialUnit, payload.serial_unit_id)
    if not serial and payload.serial_number:
        serial = (
            db.query(models.SerialUnit)
            .filter(models.SerialUnit.serial_number == payload.serial_number.upper())
            .first()
        )
    warranty = None
    if serial:
        warranty = (
            db.query(models.Warranty)
            .filter(models.Warranty.serial_unit_id == serial.id)
            .first()
        )
    in_warranty = bool(
        warranty
        and warranty.expiry_date >= date.today()
        and warranty.status == "ACTIVE"
    )

    lead = db.get(models.Lead, payload.lead_id) if payload.lead_id else None
    technician = (
        db.get(models.Employee, payload.assigned_technician_id)
        if payload.assigned_technician_id
        else None
    )
    description = payload.issue_description or payload.description or payload.subject or ""
    subject = (
        payload.subject
        or payload.fault_code
        or (description[:190] if description else "Service request")
    )
    parts_cost = Decimal(str(payload.parts_cost_inr or 0))
    labor_cost = Decimal(str(payload.labor_cost_inr or 0))
    billable = Decimal("0") if in_warranty else parts_cost + labor_cost + Decimal("1500")

    ticket = models.Ticket(
        ticket_number=f"TKT-{datetime.now().strftime('%Y%m%d')}-{datetime.now().microsecond:04d}",
        customer_name=payload.customer_name
        or (lead.customer_name if lead else "Walk-in Customer"),
        subject=subject,
        lead_id=payload.lead_id,
        order_id=payload.order_id,
        serial_unit_id=serial.id if serial else None,
        fault_code=payload.fault_code,
        description=description,
        priority=payload.priority,
        status=payload.status,
        assigned_to=payload.assigned_to
        or (technician.name if technician else None),
        assigned_technician_id=technician.id if technician else None,
        resolution_type=payload.resolution_type.upper(),
        parts_cost=parts_cost,
        labour_cost=labor_cost,
        billable_amount=billable,
        in_warranty=in_warranty,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    invalidate_prefix("tickets")
    invalidate_prefix("analytics")
    return ok(_ticket_payload(db, ticket), "Ticket raised")


@router.put("/api/tickets/{ticket_id}")
def update_ticket(ticket_id: int, payload: dict, db: Session = Depends(get_db)):
    row = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not row:
        raise HTTPException(404, "Ticket not found")
    apply_updates(row, payload)
    status_value = str(payload.get("status", "")).upper()
    if status_value in {"CLOSED", "RESOLVED_CONFIRMED", "RESOLVED"}:
        row.customer_confirmed = True
        row.closed_at = row.closed_at or datetime.now(timezone.utc)
        if not row.in_warranty:
            row.billable_amount = (
                (row.parts_cost or 0)
                + (row.labour_cost or 0)
                + Decimal("1500")
            )
    db.commit()
    db.refresh(row)
    invalidate_prefix("tickets")
    invalidate_prefix("analytics")
    return ok(_ticket_payload(db, row), "Ticket updated")


# ---------------------------------------------------------------------------
# Employees & attendance
# ---------------------------------------------------------------------------


@router.get("/api/employees")
def get_employees(db: Session = Depends(get_db)):
    cached = cache_get("employees")
    if cached is not None:
        return ok(cached)
    rows = db.query(models.Employee).order_by(models.Employee.id).all()
    data = [_employee_payload(row) for row in rows]
    cache_set("employees", data)
    return ok(data)


@router.post("/api/employees", status_code=201)
def create_employee(payload: dict, db: Session = Depends(get_db)):
    row = models.Employee(
        name=payload.get("name", "Unnamed employee"),
        email=payload.get("email"),
        phone=payload.get("phone"),
        role=payload.get("role", "TECHNICIAN"),
        designation=payload.get("designation"),
        department=payload.get("department"),
        attendance_status=payload.get("attendance_status", "PRESENT"),
        hourly_rate=payload.get("hourly_rate", payload.get("hourly_rate_inr", 0)),
        leave_status=payload.get("leave_status", "ACTIVE"),
        active=payload.get("active", True),
        avatar_url=payload.get("avatar_url"),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    invalidate_prefix("employees")
    return ok(_employee_payload(row), "Employee created")


@router.get("/api/employees/{employee_id}/jobs")
def employee_jobs(employee_id: int, db: Session = Depends(get_db)):
    emp = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(404, "Employee not found")
    surveys = (
        db.query(models.Survey)
        .filter(models.Survey.technician_id == employee_id)
        .order_by(models.Survey.id.desc())
        .all()
    )
    installations = (
        db.query(models.Installation)
        .filter(models.Installation.technician_id == employee_id)
        .order_by(models.Installation.id.desc())
        .all()
    )
    return ok(
        {
            "surveys_count": len(surveys),
            "installations_count": len(installations),
            "surveys": [
                {
                    "id": row.id,
                    "customer": (
                        db.get(models.Lead, row.lead_id).customer_name
                        if row.lead_id and db.get(models.Lead, row.lead_id)
                        else "Customer"
                    ),
                    "approved": bool(row.is_approved),
                }
                for row in surveys
            ],
            "installations": [
                {
                    "id": row.id,
                    "customer": row.customer_name or "Customer",
                    "progress": int(row.progress_pct or 0),
                    "completed": row.status in {"COMPLETED", "INSTALLED", "HANDOVER"},
                }
                for row in installations
            ],
        }
    )


def _set_attendance(employee_id: int, status_value: str, db: Session) -> dict:
    emp = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(404, "Employee not found")
    status_value = status_value.upper()
    emp.attendance_status = status_value
    today = date.today()
    record = (
        db.query(models.Attendance)
        .filter(
            models.Attendance.employee_id == employee_id,
            models.Attendance.work_date == today,
        )
        .first()
    )
    if not record:
        record = models.Attendance(
            employee_id=employee_id, work_date=today, status=status_value
        )
        db.add(record)
    else:
        record.status = status_value
    db.commit()
    invalidate_prefix("employees")
    return _employee_payload(emp)


@router.put("/api/employees/{employee_id}/attendance")
def update_attendance(
    employee_id: int,
    attendance_status: str = Query(...),
    db: Session = Depends(get_db),
):
    return ok(_set_attendance(employee_id, attendance_status, db), "Attendance updated")


@router.put("/api/v1/employees/{employee_id}/attendance")
def update_attendance_v1(
    employee_id: int,
    attendance_status: str = Query(...),
    db: Session = Depends(get_db),
):
    return ok(_set_attendance(employee_id, attendance_status, db), "Attendance updated")
