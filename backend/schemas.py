from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel

# User
class UserBase(BaseModel):
    name: str
    email: str
    role: str
    hourly_rate: float = 350.0
    attendance_status: str = "PRESENT"
    leave_status: str = "ACTIVE"

class UserCreate(UserBase):
    password: Optional[str] = "admin123"

class UserOut(UserBase):
    id: int
    class Config:
        from_attributes = True

# Auth Requests & Responses
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "CUSTOMER"
    phone: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str

class AuthResponse(BaseModel):
    token: str
    user: UserOut
    role: str
    message: str

class OTPRequest(BaseModel):
    phone: str

class OTPVerifyRequest(BaseModel):
    phone: str
    otp: str

class TokenRefreshRequest(BaseModel):
    refresh_token: str

class TokenPairOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int = 1800
    user: Optional[UserOut] = None

class OfflineSyncRequest(BaseModel):
    offline_timestamp: Optional[str] = None
    progress_pct: Optional[int] = None
    hours_logged: Optional[float] = None
    voc_voltage: Optional[float] = None
    isc_current: Optional[float] = None
    earth_resistance_ohms: Optional[float] = None
    system_tested_ok: Optional[bool] = None
    notes: Optional[str] = None
    checklist: Optional[dict] = None
    staged_photos: Optional[List[str]] = None

class HandoverRequest(BaseModel):
    customer_signature_base64: str
    completion_notes: Optional[str] = ""
    voc_voltage: Optional[float] = None
    isc_current: Optional[float] = None
    earth_resistance_ohms: Optional[float] = None

# Lead
class LeadCreate(BaseModel):
    customer_name: str
    phone: str
    email: str
    address: str
    capacity_kw: float = 3.0
    system_type: str = "ON_GRID"
    subsidy_requested: bool = True
    monthly_bill_inr: float = 3500.0
    grid_suitable: bool = True
    follow_up_notes: Optional[str] = ""

class LeadUpdate(BaseModel):
    customer_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    capacity_kw: Optional[float] = None
    system_type: Optional[str] = None
    subsidy_requested: Optional[bool] = None
    monthly_bill_inr: Optional[float] = None
    grid_suitable: Optional[bool] = None
    pipeline_stage: Optional[str] = None
    follow_up_notes: Optional[str] = None

class LeadOut(BaseModel):
    id: int
    customer_name: str
    phone: str
    email: str
    address: str
    capacity_kw: float
    system_type: str
    subsidy_requested: bool
    monthly_bill_inr: float
    grid_suitable: bool
    pipeline_stage: str
    follow_up_notes: Optional[str]
    created_at: Optional[datetime]
    class Config:
        from_attributes = True

# Site Survey
class SurveyCreate(BaseModel):
    lead_id: int
    technician_id: Optional[int] = None
    scheduled_date: Optional[date] = None
    roof_direction: Optional[str] = "South (180° Azimuth)"
    tilt_angle_deg: Optional[float] = 22.5
    shadow_free_area_sqft: Optional[float] = 320.0
    cable_distance_m: Optional[float] = 24.0
    survey_photo_url: Optional[str] = "/photos/survey_roof_default.jpg"
    notes: Optional[str] = ""

class SurveyUpdate(BaseModel):
    technician_id: Optional[int] = None
    roof_direction: Optional[str] = None
    tilt_angle_deg: Optional[float] = None
    shadow_free_area_sqft: Optional[float] = None
    cable_distance_m: Optional[float] = None
    survey_photo_url: Optional[str] = None
    notes: Optional[str] = None
    is_approved: Optional[bool] = None

class SurveyOut(BaseModel):
    id: int
    lead_id: int
    technician_id: Optional[int]
    scheduled_date: Optional[date]
    roof_direction: str
    tilt_angle_deg: float
    shadow_free_area_sqft: float
    cable_distance_m: float
    survey_photo_url: Optional[str]
    is_approved: bool
    notes: Optional[str]
    lead: Optional[LeadOut]
    technician: Optional[UserOut]
    class Config:
        from_attributes = True

# Inventory
class InventoryItemBase(BaseModel):
    sku: str
    name: str
    category: str
    unit_cost_inr: float
    selling_price_inr: float
    stock_qty: int
    reorder_threshold: int = 10

class InventoryItemOut(InventoryItemBase):
    id: int
    class Config:
        from_attributes = True

class InventoryRestock(BaseModel):
    quantity: int

# BOM
class BOMItemOut(BaseModel):
    id: int
    template_id: int
    inventory_item_id: int
    quantity: int
    inventory_item: Optional[InventoryItemOut]
    class Config:
        from_attributes = True

class BOMTemplateOut(BaseModel):
    id: int
    capacity_kw: float
    system_type: str
    installation_charge_inr: float
    description: Optional[str]
    items: List[BOMItemOut] = []
    class Config:
        from_attributes = True

# Quotation
class QuotationCreate(BaseModel):
    lead_id: int
    survey_id: int
    capacity_kw: float
    system_type: str  # ON_GRID or OFF_GRID

class QuotationOut(BaseModel):
    id: int
    lead_id: int
    survey_id: int
    capacity_kw: float
    system_type: str
    hardware_total_inr: float
    installation_charge_inr: float
    subsidy_discount_inr: float
    grand_total_inr: float
    status: str
    created_at: Optional[datetime]
    lead: Optional[LeadOut]
    class Config:
        from_attributes = True

# Order
class OrderPaymentRequest(BaseModel):
    amount: float
    payment_type: str = "ADVANCE"  # ADVANCE or FULL

class OrderOut(BaseModel):
    id: int
    quotation_id: int
    lead_id: int
    total_amount_inr: float
    advance_paid_inr: float
    balance_due_inr: float
    payment_status: str
    subsidy_tracking_status: str
    bom_deducted: bool
    created_at: Optional[datetime]
    quotation: Optional[QuotationOut]
    lead: Optional[LeadOut]
    class Config:
        from_attributes = True

# Serial Unit
class DispatchRequest(BaseModel):
    order_id: int
    lead_id: int
    inventory_item_id: int
    component_type: str
    serial_number: str

class SerialUnitOut(BaseModel):
    serial_number: str
    order_id: Optional[int]
    lead_id: Optional[int]
    inventory_item_id: int
    component_type: str
    packed_status: bool
    dispatched_at: Optional[datetime]
    delivery_confirmed: bool
    warranty_years: int
    warranty_start_date: Optional[date]
    warranty_expiry_date: Optional[date]
    lead: Optional[LeadOut]
    inventory_item: Optional[InventoryItemOut]
    class Config:
        from_attributes = True

# Installation
class InstallationUpdate(BaseModel):
    technician_id: Optional[int] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    hours_logged: Optional[float] = None
    progress_pct: Optional[int] = None
    verified_kw: Optional[float] = None
    system_tested_ok: Optional[bool] = None
    voc_voltage: Optional[float] = None
    isc_current: Optional[float] = None
    earth_resistance_ohms: Optional[float] = None
    install_photo_url: Optional[str] = None
    customer_signature_base64: Optional[str] = None
    is_completed: Optional[bool] = None
    completion_notes: Optional[str] = None

class InstallationOut(BaseModel):
    id: int
    order_id: int
    technician_id: Optional[int]
    scheduled_date: Optional[date]
    start_time: Optional[str]
    end_time: Optional[str]
    hours_logged: float
    progress_pct: int
    verified_kw: float
    system_tested_ok: bool
    voc_voltage: Optional[float] = 0.0
    isc_current: Optional[float] = 0.0
    earth_resistance_ohms: Optional[float] = 0.0
    install_photo_url: Optional[str]
    customer_signature_base64: Optional[str]
    is_completed: bool
    completion_notes: Optional[str]
    created_at: Optional[datetime]
    technician: Optional[UserOut]
    order: Optional[OrderOut]
    class Config:
        from_attributes = True

# Service Ticket
class ServiceTicketCreate(BaseModel):
    lead_id: int
    serial_number: Optional[str] = None
    fault_code: str
    issue_description: str
    assigned_technician_id: Optional[int] = None
    resolution_type: str = "REPAIR"
    parts_cost_inr: float = 0.0
    labor_cost_inr: float = 0.0

class ServiceTicketUpdate(BaseModel):
    assigned_technician_id: Optional[int] = None
    resolution_type: Optional[str] = None
    parts_cost_inr: Optional[float] = None
    labor_cost_inr: Optional[float] = None
    billed_invoice_amount_inr: Optional[float] = None
    status: Optional[str] = None

class ServiceTicketOut(BaseModel):
    id: int
    lead_id: int
    serial_number: Optional[str]
    fault_code: str
    issue_description: str
    is_under_warranty: bool
    assigned_technician_id: Optional[int]
    resolution_type: str
    parts_cost_inr: float
    labor_cost_inr: float
    billed_invoice_amount_inr: float
    status: str
    created_at: Optional[datetime]
    lead: Optional[LeadOut]
    assigned_technician: Optional[UserOut]
    class Config:
        from_attributes = True
