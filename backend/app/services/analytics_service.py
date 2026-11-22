"""Financial analytics logic (Module 13).

All KPI numbers are computed from live tables — no hard-coded dashboard values.
"""
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.installation import InstallationJob, InstallationStatus
from app.models.lead import Lead, LeadStatus
from app.models.order import Order, OrderStatus
from app.models.quotation import Quotation
from app.schemas.analytics import DashboardKPIResponse
from app.services.inventory_service import low_stock_count


async def get_dashboard_kpis(db: AsyncSession) -> DashboardKPIResponse:
    total_revenue = float(await db.scalar(
        select(func.coalesce(func.sum(Order.total_amount), 0.0))
    ) or 0.0)
    total_subsidy = float(await db.scalar(
        select(func.coalesce(func.sum(Order.subsidy_receivable), 0.0))
    ) or 0.0)

    commissioned_kw = float(await db.scalar(
        select(func.coalesce(func.sum(Quotation.system_capacity_kw), 0.0))
        .join(Order, Order.quotation_id == Quotation.id)
        .where(Order.status.in_([OrderStatus.COMMISSIONED, OrderStatus.CLOSED]))
    ) or 0.0)

    active_installations = int(await db.scalar(
        select(func.count(InstallationJob.id)).where(
            InstallationJob.status.in_([
                InstallationStatus.IN_PROGRESS,
                InstallationStatus.TESTING_QA,
            ])
        )
    ) or 0)

    pending_leads = int(await db.scalar(
        select(func.count(Lead.id)).where(Lead.status == LeadStatus.NEW)
    ) or 0)

    return DashboardKPIResponse(
        total_revenue=round(total_revenue, 2),
        total_capacity_installed_kw=round(commissioned_kw, 2),
        active_installations_count=active_installations,
        pending_leads_count=pending_leads,
        total_subsidy_receivable=round(total_subsidy, 2),
        low_stock_items_count=await low_stock_count(db),
    )
