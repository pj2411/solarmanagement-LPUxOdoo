import uuid
from typing import Optional
from pydantic import BaseModel, Field
from app.models.lead import LeadStatus


class CalculatorInputSchema(BaseModel):
    """Inputs from the Public Website Solar Savings Calculator (Module 01)."""
    monthly_bill: float = Field(..., gt=0, description="Average monthly electricity bill in INR")
    electricity_rate_per_kwh: float = Field(default=8.0, gt=0, description="Tariff rate per unit/kWh")
    available_roof_area_sqft: Optional[float] = Field(None, gt=0, description="Available roof shadow-free area")
    state_or_city: str = Field(default="Delhi", description="State or city for solar irradiance & state subsidy lookup")


class CalculatorResultSchema(BaseModel):
    """Evaluation output from the Solar Savings Calculator."""
    monthly_consumption_kwh: float
    recommended_capacity_kw: float
    required_roof_area_sqft: float
    estimated_annual_generation_kwh: float
    estimated_gross_system_cost: float
    estimated_central_subsidy: float
    estimated_net_cost: float
    estimated_annual_savings: float
    payback_period_years: float
    lifetime_25yr_savings: float
    co2_saved_tons_per_year: float


class LeadCreate(BaseModel):
    full_name: str = Field(..., min_length=2)
    phone: str = Field(..., min_length=10)
    email: Optional[str] = None
    city: str
    address: str
    pincode: str
    monthly_bill: Optional[float] = None
    roof_area_sqft: Optional[float] = None
    recommended_kw: Optional[float] = None


class LeadUpdate(BaseModel):
    status: Optional[LeadStatus] = None
    assigned_sales_rep_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None


class LeadResponse(BaseModel):
    id: uuid.UUID
    customer_id: uuid.UUID
    source: str
    monthly_bill: Optional[float] = None
    monthly_kwh: Optional[float] = None
    roof_area_sqft: Optional[float] = None
    recommended_kw: Optional[float] = None
    status: LeadStatus
    assigned_sales_rep_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True
