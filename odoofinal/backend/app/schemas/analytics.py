import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.analytics import SubsidyStatus


class DashboardKPIResponse(BaseModel):
    total_revenue: float
    total_capacity_installed_kw: float
    active_installations_count: int
    pending_leads_count: int
    total_subsidy_receivable: float
    low_stock_items_count: int


class ProjectProfitLossResponse(BaseModel):
    order_id: uuid.UUID
    contract_revenue: float
    total_cogs: float
    labor_and_logistics: float
    net_profit_margin: float
    profit_percentage: float


class SubsidyReportResponse(BaseModel):
    id: uuid.UUID
    order_id: uuid.UUID
    claim_reference_no: str
    scheme_name: str
    sanctioned_amount: float
    status: SubsidyStatus
    submitted_at: Optional[datetime] = None
    disbursed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
