from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.redis_client import cache_get, cache_set, invalidate_prefix
from app.schemas import ExpenseIn
from app.services.bom import calculate
from app.utils import ok

router = APIRouter(tags=["analytics"])

SUBSIDY_STATUSES = ("NOT_APPLIED", "APPLIED", "INSPECTED", "DISBURSED")


def _money(value) -> float:
    return float(value or 0)


def _month_key(value: datetime) -> str:
    return value.strftime("%b %Y")


def _subsidy_status(value: str | None) -> str:
    status = (value or "").upper().replace("-", "_").replace(" ", "_")
    if status in SUBSIDY_STATUSES:
        return status
    if status in {"APPROVED", "PAID", "RELEASED", "CREDITED"}:
        return "DISBURSED"
    if status in {"VERIFYING", "AUDIT", "FIELD_CHECK"}:
        return "INSPECTED"
    if status in {"SUBMITTED", "FILED", "IN_PROGRESS"}:
        return "APPLIED"
    return "NOT_APPLIED"


@router.get("/api/analytics")
def get_analytics(db: Session = Depends(get_db)):
    cached = cache_get("analytics")
    if cached is not None:
        return ok(cached)

    payments = db.query(models.Payment).all()
    expenses = db.query(models.Expense).all()
    orders = db.query(models.Order).order_by(models.Order.id).all()
    inventory = db.query(models.InventoryItem).all()

    revenue = sum((_money(row.amount) for row in payments), 0.0)
    booked_expenses = sum((_money(row.amount) for row in expenses), 0.0)
    pending_payments = sum((_money(row.balance_amount) for row in orders), 0.0)
    inventory_valuation = sum(
        (
            _money(row.stock_qty)
            * _money(
                row.unit_cost_inr
                if row.unit_cost_inr
                else Decimal(str(row.unit_price or 0)) * Decimal("0.72")
            )
            for row in inventory
        ),
        0.0,
    )

    avg_hourly_rate = _money(
        db.query(func.coalesce(func.avg(models.Employee.hourly_rate), 0)).scalar()
    )
    expenses_by_order: dict[int, float] = defaultdict(float)
    for row in expenses:
        if row.order_id:
            expenses_by_order[row.order_id] += _money(row.amount)
    payments_by_order: dict[int, float] = defaultdict(float)
    for row in payments:
        payments_by_order[row.order_id] += _money(row.amount)

    projects_pnl: list[dict] = []
    for order in orders:
        breakdown = calculate(
            Decimal(str(order.capacity_kw or 3)),
            order.system_type or "ON_GRID",
            db,
        )
        hardware_cost = sum(
            _money(item["cost_subtotal_inr"]) for item in breakdown["items"]
        )
        installation = (
            db.query(models.Installation)
            .filter(models.Installation.order_id == order.id)
            .first()
        )
        hours = _money(getattr(installation, "hours_logged", 0))
        technician = (
            db.get(models.Employee, installation.technician_id)
            if installation and installation.technician_id
            else None
        )
        hourly_rate = _money(technician.hourly_rate) if technician else avg_hourly_rate
        labor_cost = round(hours * hourly_rate, 2)
        other_cost = round(expenses_by_order[order.id], 2)
        total_cost = round(hardware_cost + labor_cost + other_cost, 2)
        collected = round(payments_by_order[order.id], 2)
        profit = round(collected - total_cost, 2)
        projects_pnl.append(
            {
                "order_id": order.id,
                "project_name": order.order_number or f"Order #{order.id}",
                "customer_name": order.customer_name,
                "capacity_kw": _money(order.capacity_kw),
                "system_type": order.system_type,
                "collected_revenue_inr": collected,
                "bom_hardware_cost_inr": round(hardware_cost, 2),
                "installation_hours": hours,
                "technician_hourly_rate": round(hourly_rate, 2),
                "labor_cost_inr": labor_cost,
                "total_project_cost_inr": total_cost,
                "project_profit_inr": profit,
                "profit_margin_pct": round(profit / collected * 100, 1)
                if collected
                else 0.0,
            }
        )

    total_expenses = round(sum(row["total_project_cost_inr"] for row in projects_pnl), 2)
    profit = round(revenue - total_expenses, 2)

    subsidy_tracking = {status: 0 for status in SUBSIDY_STATUSES}
    for order in orders:
        subsidy_tracking[_subsidy_status(order.subsidy_status)] += 1

    ticket_rows = (
        db.query(models.Ticket.status, func.count(models.Ticket.id))
        .group_by(models.Ticket.status)
        .all()
    )
    tickets_summary = {str(status or "OPEN"): count for status, count in ticket_rows}
    tickets_summary["total"] = sum(tickets_summary.values())

    total_leads = db.query(func.count(models.Lead.id)).scalar() or 0
    pending_leads = (
        db.query(func.count(models.Lead.id))
        .filter(models.Lead.pipeline_stage.notin_(["INSTALLED", "WON", "LOST"]))
        .scalar()
        or 0
    )
    total_orders = len(orders)
    completed_installations = (
        db.query(func.count(models.Installation.id))
        .filter(
            models.Installation.status.in_(["COMPLETED", "INSTALLED", "HANDOVER"])
        )
        .scalar()
        or 0
    )
    open_tickets = sum(
        count
        for status, count in ticket_rows
        if str(status or "").upper() not in {"CLOSED", "RESOLVED", "RESOLVED_CONFIRMED"}
    )
    low_stock = (
        db.query(func.count(models.InventoryItem.id))
        .filter(models.InventoryItem.stock_qty <= models.InventoryItem.reorder_level)
        .scalar()
        or 0
    )
    total_employees = db.query(func.count(models.Employee.id)).scalar() or 0

    months: list[str] = []
    cursor = date.today().replace(day=1)
    for _ in range(6):
        months.append(cursor.strftime("%b %Y"))
        cursor = (cursor - timedelta(days=1)).replace(day=1)
    months.reverse()
    revenue_by_month: dict[str, float] = defaultdict(float)
    expense_by_month: dict[str, float] = defaultdict(float)
    for payment in payments:
        if payment.paid_at:
            revenue_by_month[_month_key(payment.paid_at)] += _money(payment.amount)
    for expense in expenses:
        if expense.incurred_at:
            expense_by_month[_month_key(expense.incurred_at)] += _money(expense.amount)
    monthly = [
        {
            "month": month,
            "revenue": round(revenue_by_month[month], 2),
            "expenses": round(expense_by_month[month], 2),
            "profit": round(revenue_by_month[month] - expense_by_month[month], 2),
        }
        for month in months
    ]

    pipeline_rows = (
        db.query(models.Lead.pipeline_stage, func.count(models.Lead.id))
        .group_by(models.Lead.pipeline_stage)
        .all()
    )
    pipeline = [
        {"name": stage or "NEW", "value": count, "stage": stage or "NEW"}
        for stage, count in pipeline_rows
    ]

    data = {
        # Frontend finance contract
        "total_revenue_inr": round(revenue, 2),
        "total_expenses_inr": total_expenses,
        "net_profit_inr": profit,
        "pending_payments_inr": round(pending_payments, 2),
        "inventory_valuation_inr": round(inventory_valuation, 2),
        "low_stock_items_count": low_stock,
        "subsidy_tracking": subsidy_tracking,
        "tickets_summary": tickets_summary,
        "projects_pnl": projects_pnl,
        # General aliases used by the sidebar and legacy charts
        "total_revenue": round(revenue, 2),
        "revenue": round(revenue, 2),
        "total_orders": total_orders,
        "orders": total_orders,
        "total_leads": total_leads,
        "leads": total_leads,
        "pending_leads": pending_leads,
        "total_installations": completed_installations,
        "installations": completed_installations,
        "total_customers": total_leads,
        "customers": total_leads,
        "total_employees": total_employees,
        "employees": total_employees,
        "open_tickets": open_tickets,
        "tickets": open_tickets,
        "low_stock_items": low_stock,
        "low_stock": low_stock,
        "total_expenses": total_expenses,
        "booked_expenses": round(booked_expenses, 2),
        "expenses": total_expenses,
        "profit": profit,
        "net_profit": profit,
        "conversion_rate": round((completed_installations / total_leads * 100), 1)
        if total_leads
        else 0,
        "monthly_revenue": monthly,
        "monthly": monthly,
        "revenue_trend": monthly,
        "chart_data": monthly,
        "pipeline": pipeline,
        "pipeline_data": pipeline,
        "lead_sources": pipeline,
        "job_profitability": projects_pnl,
        "updated_at": datetime.utcnow().isoformat(),
    }
    cache_set("analytics", data)
    return ok(data)


@router.post("/api/analytics/expenses", status_code=201)
def create_expense(payload: ExpenseIn, db: Session = Depends(get_db)):
    row = models.Expense(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    invalidate_prefix("analytics")
    return ok(
        {
            "id": row.id,
            "category": row.category,
            "amount": float(row.amount),
            "note": row.note,
            "order_id": row.order_id,
        },
        "Expense recorded",
    )
