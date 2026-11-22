from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str | None] = mapped_column(String(255), default=None)
    full_name: Mapped[str] = mapped_column(String(150), default="")
    phone: Mapped[str | None] = mapped_column(String(30), default=None)
    role: Mapped[str] = mapped_column(String(30), default="CUSTOMER", index=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), default=None)
    oauth_provider: Mapped[str | None] = mapped_column(String(30), default=None)
    oauth_subject: Mapped[str | None] = mapped_column(String(255), default=None)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), default=None
    )


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[int] = mapped_column(primary_key=True)
    customer_name: Mapped[str] = mapped_column(String(150), index=True)
    phone: Mapped[str] = mapped_column(String(30), index=True)
    email: Mapped[str | None] = mapped_column(String(255), default=None)
    address: Mapped[str | None] = mapped_column(Text, default=None)
    city: Mapped[str | None] = mapped_column(String(100), default=None)
    state: Mapped[str | None] = mapped_column(String(100), default=None)
    capacity_kw: Mapped[Decimal] = mapped_column(Numeric(6, 2), default=0)
    system_type: Mapped[str] = mapped_column(String(30), default="ON_GRID", index=True)
    pipeline_stage: Mapped[str] = mapped_column(String(30), default="NEW", index=True)
    monthly_bill_inr: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    subsidy_requested: Mapped[bool] = mapped_column(Boolean, default=False)
    source: Mapped[str] = mapped_column(String(30), default="website")
    notes: Mapped[str | None] = mapped_column(Text, default=None)
    follow_up_notes: Mapped[str | None] = mapped_column(Text, default=None)
    grid_suitable: Mapped[bool] = mapped_column(Boolean, default=True)
    assigned_to: Mapped[str | None] = mapped_column(String(150), default=None)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), default=None, onupdate=func.now()
    )


class Survey(Base):
    __tablename__ = "surveys"

    id: Mapped[int] = mapped_column(primary_key=True)
    lead_id: Mapped[int] = mapped_column(ForeignKey("leads.id"), index=True)
    technician_id: Mapped[int | None] = mapped_column(Integer, index=True, default=None)
    scheduled_date: Mapped[date | None] = mapped_column(Date, default=None)
    roof_direction: Mapped[str | None] = mapped_column(String(100), default=None)
    tilt_angle_deg: Mapped[Decimal | None] = mapped_column(Numeric(6, 2), default=None)
    shadow_free_area_sqft: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2), default=None
    )
    cable_distance_m: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2), default=None
    )
    survey_photo_url: Mapped[str | None] = mapped_column(String(500), default=None)
    photos: Mapped[list] = mapped_column(JSON, default=list)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    notes: Mapped[str | None] = mapped_column(Text, default=None)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class Quotation(Base):
    __tablename__ = "quotations"

    id: Mapped[int] = mapped_column(primary_key=True)
    lead_id: Mapped[int] = mapped_column(ForeignKey("leads.id"), index=True)
    survey_id: Mapped[int | None] = mapped_column(Integer, default=None)
    quotation_number: Mapped[str | None] = mapped_column(
        String(50), unique=True, default=None
    )
    capacity_kw: Mapped[Decimal] = mapped_column(Numeric(6, 2), default=0)
    system_type: Mapped[str] = mapped_column(String(30), default="ON_GRID")
    bom: Mapped[list] = mapped_column(JSON, default=list)
    line_items: Mapped[list] = mapped_column(JSON, default=list)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    installation_charge: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    subsidy_estimate: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    discount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    total: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    status: Mapped[str] = mapped_column(String(30), default="DRAFT", index=True)
    valid_until: Mapped[date | None] = mapped_column(Date, default=None)
    notes: Mapped[str | None] = mapped_column(Text, default=None)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    sku: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(150), index=True)
    category: Mapped[str] = mapped_column(String(50), index=True)
    unit: Mapped[str] = mapped_column(String(20), default="pcs")
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    unit_cost_inr: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    stock_qty: Mapped[int] = mapped_column(Integer, default=0)
    reorder_level: Mapped[int] = mapped_column(Integer, default=5)
    image_url: Mapped[str | None] = mapped_column(String(500), default=None)
    description: Mapped[str | None] = mapped_column(Text, default=None)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class BomTemplate(Base):
    __tablename__ = "bom_templates"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(150))
    system_type: Mapped[str] = mapped_column(String(30), index=True)
    capacity_kw: Mapped[Decimal] = mapped_column(Numeric(6, 2), default=0)
    category: Mapped[str] = mapped_column(String(50), default="")
    item_name: Mapped[str] = mapped_column(String(150))
    quantity_per_kw: Mapped[Decimal] = mapped_column(Numeric(8, 3), default=0)
    fixed_quantity: Mapped[int] = mapped_column(Integer, default=0)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    unit: Mapped[str] = mapped_column(String(20), default="pcs")
    description: Mapped[str | None] = mapped_column(Text, default=None)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class SerialUnit(Base):
    __tablename__ = "serial_units"

    id: Mapped[int] = mapped_column(primary_key=True)
    inventory_item_id: Mapped[int] = mapped_column(
        ForeignKey("inventory_items.id"), index=True
    )
    serial_number: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    status: Mapped[str] = mapped_column(String(30), default="IN_STOCK", index=True)
    batch_no: Mapped[str | None] = mapped_column(String(50), default=None)
    warehouse_location: Mapped[str | None] = mapped_column(String(100), default=None)
    received_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), default=None
    )
    dispatched_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), default=None
    )
    installed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), default=None
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_number: Mapped[str | None] = mapped_column(
        String(50), unique=True, default=None
    )
    lead_id: Mapped[int | None] = mapped_column(ForeignKey("leads.id"), index=True)
    quotation_id: Mapped[int | None] = mapped_column(Integer, default=None)
    customer_name: Mapped[str] = mapped_column(String(150), index=True)
    customer_phone: Mapped[str | None] = mapped_column(String(30), default=None)
    address: Mapped[str | None] = mapped_column(Text, default=None)
    capacity_kw: Mapped[Decimal] = mapped_column(Numeric(6, 2), default=0)
    system_type: Mapped[str] = mapped_column(String(30), default="ON_GRID")
    total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    advance_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    paid_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    balance_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    status: Mapped[str] = mapped_column(String(30), default="PENDING", index=True)
    payment_status: Mapped[str] = mapped_column(String(30), default="PENDING", index=True)
    subsidy_status: Mapped[str] = mapped_column(String(30), default="PENDING", index=True)
    subsidy_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    bom_deducted: Mapped[bool] = mapped_column(Boolean, default=False)
    order_date: Mapped[date | None] = mapped_column(Date, default=None)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    method: Mapped[str] = mapped_column(String(30), default="UPI")
    reference: Mapped[str | None] = mapped_column(String(100), default=None)
    status: Mapped[str] = mapped_column(String(20), default="PAID")
    notes: Mapped[str | None] = mapped_column(Text, default=None)
    paid_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class Dispatch(Base):
    __tablename__ = "dispatches"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), index=True)
    serial_unit_id: Mapped[int] = mapped_column(
        ForeignKey("serial_units.id"), index=True
    )
    serial_number: Mapped[str | None] = mapped_column(String(100), default=None)
    status: Mapped[str] = mapped_column(String(30), default="IN_TRANSIT", index=True)
    receiver_name: Mapped[str | None] = mapped_column(String(150), default=None)
    receiver_phone: Mapped[str | None] = mapped_column(String(30), default=None)
    delivery_address: Mapped[str | None] = mapped_column(Text, default=None)
    dispatched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    delivery_confirmed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), default=None
    )
    notes: Mapped[str | None] = mapped_column(Text, default=None)


class Installation(Base):
    __tablename__ = "installations"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int | None] = mapped_column(Integer, index=True, default=None)
    lead_id: Mapped[int | None] = mapped_column(Integer, index=True, default=None)
    technician_id: Mapped[int | None] = mapped_column(Integer, index=True, default=None)
    customer_name: Mapped[str | None] = mapped_column(String(150), default=None)
    system_kw: Mapped[Decimal] = mapped_column(Numeric(6, 2), default=0)
    scheduled_date: Mapped[date | None] = mapped_column(Date, default=None)
    start_time: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), default=None
    )
    finish_time: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), default=None
    )
    photos: Mapped[list] = mapped_column(JSON, default=list)
    signature_data: Mapped[str | None] = mapped_column(Text, default=None)
    progress_pct: Mapped[int] = mapped_column(Integer, default=0)
    hours_logged: Mapped[Decimal] = mapped_column(Numeric(6, 2), default=0)
    verified_kw: Mapped[Decimal] = mapped_column(Numeric(6, 2), default=0)
    system_tested_ok: Mapped[bool] = mapped_column(Boolean, default=False)
    voc_voltage: Mapped[Decimal] = mapped_column(Numeric(8, 2), default=0)
    isc_current: Mapped[Decimal] = mapped_column(Numeric(8, 2), default=0)
    earth_resistance_ohms: Mapped[Decimal] = mapped_column(Numeric(8, 2), default=0)
    install_photo_url: Mapped[str | None] = mapped_column(String(500), default=None)
    testing_ok: Mapped[bool] = mapped_column(Boolean, default=False)
    completion_notes: Mapped[str | None] = mapped_column(Text, default=None)
    status: Mapped[str] = mapped_column(String(30), default="SCHEDULED", index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class Warranty(Base):
    __tablename__ = "warranties"

    id: Mapped[int] = mapped_column(primary_key=True)
    serial_unit_id: Mapped[int] = mapped_column(
        ForeignKey("serial_units.id"), unique=True, index=True
    )
    order_id: Mapped[int | None] = mapped_column(Integer, default=None)
    start_date: Mapped[date] = mapped_column(Date)
    duration_months: Mapped[int] = mapped_column(Integer, default=24)
    expiry_date: Mapped[date] = mapped_column(Date, index=True)
    status: Mapped[str] = mapped_column(String(20), default="ACTIVE", index=True)
    terms: Mapped[str | None] = mapped_column(Text, default=None)


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(primary_key=True)
    ticket_number: Mapped[str | None] = mapped_column(
        String(50), unique=True, default=None
    )
    lead_id: Mapped[int | None] = mapped_column(Integer, index=True, default=None)
    order_id: Mapped[int | None] = mapped_column(Integer, index=True, default=None)
    serial_unit_id: Mapped[int | None] = mapped_column(Integer, default=None)
    customer_name: Mapped[str] = mapped_column(String(150), index=True)
    subject: Mapped[str | None] = mapped_column(String(200), default=None)
    fault_code: Mapped[str | None] = mapped_column(String(50), default=None)
    description: Mapped[str | None] = mapped_column(Text, default=None)
    priority: Mapped[str] = mapped_column(String(20), default="MEDIUM", index=True)
    status: Mapped[str] = mapped_column(String(30), default="OPEN", index=True)
    in_warranty: Mapped[bool] = mapped_column(Boolean, default=False)
    parts_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    labour_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    billable_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    customer_confirmed: Mapped[bool] = mapped_column(Boolean, default=False)
    assigned_to: Mapped[str | None] = mapped_column(String(150), default=None)
    assigned_technician_id: Mapped[int | None] = mapped_column(Integer, default=None)
    resolution_type: Mapped[str] = mapped_column(String(30), default="REPAIR")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    closed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), default=None
    )


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int | None] = mapped_column(Integer, default=None)
    name: Mapped[str] = mapped_column(String(150), index=True)
    email: Mapped[str | None] = mapped_column(String(255), default=None)
    phone: Mapped[str | None] = mapped_column(String(30), default=None)
    role: Mapped[str] = mapped_column(String(30), default="TECHNICIAN", index=True)
    hourly_rate: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    leave_status: Mapped[str] = mapped_column(String(20), default="ACTIVE")
    designation: Mapped[str | None] = mapped_column(String(100), default=None)
    department: Mapped[str | None] = mapped_column(String(100), default=None)
    attendance_status: Mapped[str] = mapped_column(
        String(20), default="PRESENT", index=True
    )
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    joined_at: Mapped[date] = mapped_column(Date, server_default=func.current_date())
    avatar_url: Mapped[str | None] = mapped_column(String(500), default=None)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class Attendance(Base):
    __tablename__ = "attendance"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"), index=True)
    work_date: Mapped[date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(20), default="PRESENT")
    check_in: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), default=None
    )
    check_out: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), default=None
    )
    __table_args__ = (
        UniqueConstraint("employee_id", "work_date", name="uq_attendance_emp_date"),
    )


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int | None] = mapped_column(Integer, default=None)
    category: Mapped[str] = mapped_column(String(50), default="other")
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    note: Mapped[str | None] = mapped_column(Text, default=None)
    incurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


# ---------------------------------------------------------------------------
# Dynamic public website content (everything the marketing site renders)
# ---------------------------------------------------------------------------


class SiteSetting(Base):
    __tablename__ = "site_settings"

    key: Mapped[str] = mapped_column(String(100), primary_key=True)
    value: Mapped[dict] = mapped_column(JSON, default=dict)
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), default=None, onupdate=func.now()
    )


class Package(Base):
    __tablename__ = "packages"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(150))
    capacity_kw: Mapped[Decimal] = mapped_column(Numeric(6, 2), default=0)
    system_type: Mapped[str] = mapped_column(String(30), default="ON_GRID")
    price_inr: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    monthly_savings_inr: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    description: Mapped[str | None] = mapped_column(Text, default=None)
    features: Mapped[list] = mapped_column(JSON, default=list)
    image_url: Mapped[str | None] = mapped_column(String(500), default=None)
    badge: Mapped[str | None] = mapped_column(String(50), default=None)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(150))
    category: Mapped[str] = mapped_column(String(50), index=True)
    description: Mapped[str | None] = mapped_column(Text, default=None)
    specifications: Mapped[dict] = mapped_column(JSON, default=dict)
    image_url: Mapped[str | None] = mapped_column(String(500), default=None)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class Testimonial(Base):
    __tablename__ = "testimonials"

    id: Mapped[int] = mapped_column(primary_key=True)
    customer_name: Mapped[str] = mapped_column(String(150))
    location: Mapped[str | None] = mapped_column(String(150), default=None)
    rating: Mapped[int] = mapped_column(Integer, default=5)
    quote: Mapped[str] = mapped_column(Text)
    project_kw: Mapped[Decimal | None] = mapped_column(Numeric(6, 2), default=None)
    image_url: Mapped[str | None] = mapped_column(String(500), default=None)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class Faq(Base):
    __tablename__ = "faqs"

    id: Mapped[int] = mapped_column(primary_key=True)
    question: Mapped[str] = mapped_column(Text)
    answer: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(50), default="general")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
