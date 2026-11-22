from datetime import date
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str = ""
    name: str | None = None
    phone: str | None = None
    role: str = "CUSTOMER"


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token: str | None = None
    refresh_token: str
    token_type: str = "bearer"
    role: str | None = None
    user: dict[str, Any]


class RefreshIn(BaseModel):
    refresh_token: str


class OtpRequestIn(BaseModel):
    phone: str


class OtpVerifyIn(BaseModel):
    phone: str
    otp: str


class ForgotPasswordIn(BaseModel):
    email: EmailStr


class ResetPasswordIn(BaseModel):
    email: EmailStr
    otp: str
    new_password: str = Field(min_length=6)


class LeadIn(BaseModel):
    customer_name: str
    phone: str
    email: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    capacity_kw: Decimal = Decimal("0")
    system_type: str = "ON_GRID"
    pipeline_stage: str = "NEW"
    monthly_bill_inr: Decimal = Decimal("0")
    subsidy_requested: bool = False
    source: str = "website"
    notes: str | None = None
    follow_up_notes: str | None = None
    grid_suitable: bool = True
    assigned_to: str | None = None


class SurveyIn(BaseModel):
    lead_id: int
    technician_id: int | None = None
    scheduled_date: date | None = None
    roof_direction: str | None = None
    tilt_angle_deg: Decimal | None = None
    shadow_free_area_sqft: Decimal | None = None
    cable_distance_m: Decimal | None = None
    survey_photo_url: str | None = None
    photos: list = Field(default_factory=list)
    is_approved: bool = False
    notes: str | None = None


class QuotationIn(BaseModel):
    lead_id: int
    survey_id: int | None = None
    capacity_kw: Decimal | None = None
    system_type: str | None = None
    line_items: list = Field(default_factory=list)
    installation_charge: Decimal = Decimal("0")
    subsidy_estimate: Decimal = Decimal("0")
    discount: Decimal = Decimal("0")
    notes: str | None = None


class OrderPayIn(BaseModel):
    amount: Decimal
    method: str = "UPI"
    payment_type: str | None = None
    reference: str | None = None
    notes: str | None = None


class RazorpayOrderCreateIn(BaseModel):
    amount: Decimal | None = None


class RazorpayVerifyIn(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    amount: Decimal


class DispatchIn(BaseModel):
    order_id: int
    serial_number: str
    receiver_name: str | None = None
    receiver_phone: str | None = None
    delivery_address: str | None = None
    notes: str | None = None


class TicketIn(BaseModel):
    customer_name: str | None = None
    subject: str | None = None
    lead_id: int | None = None
    order_id: int | None = None
    serial_unit_id: int | None = None
    serial_number: str | None = None
    fault_code: str | None = None
    issue_description: str | None = None
    description: str | None = None
    priority: str = "MEDIUM"
    status: str = "OPEN"
    assigned_to: str | None = None
    assigned_technician_id: int | None = None
    resolution_type: str = "REPAIR"
    parts_cost_inr: Decimal = Decimal("0")
    labor_cost_inr: Decimal = Decimal("0")


class ExpenseIn(BaseModel):
    category: str = "other"
    amount: Decimal
    note: str | None = None
    order_id: int | None = None
