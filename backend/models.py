from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Date, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(200), default="hashed_password")
    role = Column(String(50), nullable=False)  # CUSTOMER, SALES, WAREHOUSE, TECHNICIAN, SUPPORT, ADMIN
    hourly_rate = Column(Float, default=350.0)  # INR/hr for technicians
    attendance_status = Column(String(20), default="PRESENT")  # PRESENT, ABSENT, ON_LEAVE
    leave_status = Column(String(100), default="ACTIVE")

    surveys = relationship("SiteSurvey", back_populates="technician")
    installations = relationship("Installation", back_populates="technician")
    service_tickets = relationship("ServiceTicket", back_populates="assigned_technician")


class CustomerLead(Base):
    __tablename__ = "customers_leads"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(100), nullable=False)
    address = Column(String(255), nullable=False)
    capacity_kw = Column(Float, default=3.0)  # 1 to 5 kW
    system_type = Column(String(20), default="ON_GRID")  # ON_GRID or OFF_GRID
    subsidy_requested = Column(Boolean, default=True)
    monthly_bill_inr = Column(Float, default=3500.0)
    grid_suitable = Column(Boolean, default=True)
    pipeline_stage = Column(String(50), default="NEW")  # NEW, FOLLOW_UP, SURVEY_SCHEDULED, SURVEY_APPROVED, QUOTED, WON, INSTALLED
    follow_up_notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    surveys = relationship("SiteSurvey", back_populates="lead")
    quotations = relationship("Quotation", back_populates="lead")
    orders = relationship("Order", back_populates="lead")
    serial_units = relationship("SerialUnit", back_populates="lead")
    tickets = relationship("ServiceTicket", back_populates="lead")


class SiteSurvey(Base):
    __tablename__ = "site_surveys"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("customers_leads.id"), nullable=False)
    technician_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    scheduled_date = Column(Date, default=date.today)
    roof_direction = Column(String(50), default="South (180° Azimuth)")
    tilt_angle_deg = Column(Float, default=22.5)
    shadow_free_area_sqft = Column(Float, default=320.0)
    cable_distance_m = Column(Float, default=24.0)
    survey_photo_url = Column(String(255), default="/photos/survey_roof_default.jpg")
    is_approved = Column(Boolean, default=False)
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    lead = relationship("CustomerLead", back_populates="surveys")
    technician = relationship("User", back_populates="surveys")
    quotations = relationship("Quotation", back_populates="survey")


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(120), nullable=False)
    category = Column(String(50), nullable=False)  # PANELS, INVERTERS, BATTERIES, MOUNTING_STRUCTURES, WIRES_CONNECTORS, SAFETY_EQUIPMENT
    unit_cost_inr = Column(Float, nullable=False)
    selling_price_inr = Column(Float, nullable=False)
    stock_qty = Column(Integer, default=50)
    reorder_threshold = Column(Integer, default=10)

    bom_items = relationship("BOMItem", back_populates="inventory_item")
    serial_units = relationship("SerialUnit", back_populates="inventory_item")


class BOMTemplate(Base):
    __tablename__ = "bom_templates"

    id = Column(Integer, primary_key=True, index=True)
    capacity_kw = Column(Float, nullable=False)
    system_type = Column(String(20), nullable=False)  # ON_GRID or OFF_GRID
    installation_charge_inr = Column(Float, default=18000.0)
    description = Column(String(255), default="")

    items = relationship("BOMItem", back_populates="template", cascade="all, delete-orphan")


class BOMItem(Base):
    __tablename__ = "bom_items"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("bom_templates.id"), nullable=False)
    inventory_item_id = Column(Integer, ForeignKey("inventory_items.id"), nullable=False)
    quantity = Column(Integer, default=1)

    template = relationship("BOMTemplate", back_populates="items")
    inventory_item = relationship("InventoryItem", back_populates="bom_items")


class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("customers_leads.id"), nullable=False)
    survey_id = Column(Integer, ForeignKey("site_surveys.id"), nullable=False)
    capacity_kw = Column(Float, nullable=False)
    system_type = Column(String(20), nullable=False)
    hardware_total_inr = Column(Float, nullable=False)
    installation_charge_inr = Column(Float, nullable=False)
    subsidy_discount_inr = Column(Float, default=0.0)
    grand_total_inr = Column(Float, nullable=False)
    status = Column(String(30), default="DRAFT")  # DRAFT, SENT, APPROVED_BY_CUSTOMER
    created_at = Column(DateTime, default=datetime.utcnow)

    lead = relationship("CustomerLead", back_populates="quotations")
    survey = relationship("SiteSurvey", back_populates="quotations")
    orders = relationship("Order", back_populates="quotation")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    quotation_id = Column(Integer, ForeignKey("quotations.id"), nullable=False)
    lead_id = Column(Integer, ForeignKey("customers_leads.id"), nullable=False)
    total_amount_inr = Column(Float, nullable=False)
    advance_paid_inr = Column(Float, default=0.0)
    balance_due_inr = Column(Float, nullable=False)
    payment_status = Column(String(30), default="UNPAID")  # UNPAID, ADVANCE_PAID, FULLY_PAID
    subsidy_tracking_status = Column(String(30), default="NOT_APPLIED")  # NOT_APPLIED, APPLIED, INSPECTED, DISBURSED
    bom_deducted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    quotation = relationship("Quotation", back_populates="orders")
    lead = relationship("CustomerLead", back_populates="orders")
    serials = relationship("SerialUnit", back_populates="order")
    installations = relationship("Installation", back_populates="order")


class SerialUnit(Base):
    __tablename__ = "serial_units"

    serial_number = Column(String(50), primary_key=True, index=True)  # e.g., INV-2026-8841
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    lead_id = Column(Integer, ForeignKey("customers_leads.id"), nullable=True)
    inventory_item_id = Column(Integer, ForeignKey("inventory_items.id"), nullable=False)
    component_type = Column(String(50), nullable=False)  # PANEL, INVERTER, BATTERY, CHARGE_CONTROLLER
    packed_status = Column(Boolean, default=False)
    dispatched_at = Column(DateTime, nullable=True)
    delivery_confirmed = Column(Boolean, default=False)
    warranty_years = Column(Integer, default=2)  # 20 for PANEL, 2 for INVERTER/BATTERY/CHARGE_CONTROLLER
    warranty_start_date = Column(Date, nullable=True)
    warranty_expiry_date = Column(Date, nullable=True)

    order = relationship("Order", back_populates="serials")
    lead = relationship("CustomerLead", back_populates="serial_units")
    inventory_item = relationship("InventoryItem", back_populates="serial_units")
    tickets = relationship("ServiceTicket", back_populates="serial_unit")


class Installation(Base):
    __tablename__ = "installations"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    technician_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    scheduled_date = Column(Date, default=date.today)
    start_time = Column(String(20), default="09:00 AM")
    end_time = Column(String(20), default="05:30 PM")
    hours_logged = Column(Float, default=8.0)
    progress_pct = Column(Integer, default=0)
    verified_kw = Column(Float, default=3.0)
    system_tested_ok = Column(Boolean, default=False)
    voc_voltage = Column(Float, default=0.0)
    isc_current = Column(Float, default=0.0)
    earth_resistance_ohms = Column(Float, default=0.0)
    install_photo_url = Column(String(255), default="/photos/install_complete_default.jpg")
    customer_signature_base64 = Column(Text, default="")
    is_completed = Column(Boolean, default=False)
    completion_notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="installations")
    technician = relationship("User", back_populates="installations")


class ServiceTicket(Base):
    __tablename__ = "service_tickets"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("customers_leads.id"), nullable=False)
    serial_number = Column(String(50), ForeignKey("serial_units.serial_number"), nullable=True)
    fault_code = Column(String(50), nullable=False)  # E04-GRID-LOSS, B02-LOW-VOLTAGE, etc.
    issue_description = Column(Text, nullable=False)
    is_under_warranty = Column(Boolean, default=True)
    assigned_technician_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    resolution_type = Column(String(30), default="REPAIR")  # REPAIR, REPLACEMENT
    parts_cost_inr = Column(Float, default=0.0)
    labor_cost_inr = Column(Float, default=0.0)
    billed_invoice_amount_inr = Column(Float, default=0.0)
    status = Column(String(30), default="OPEN")  # OPEN, IN_PROGRESS, RESOLVED_CONFIRMED
    created_at = Column(DateTime, default=datetime.utcnow)

    lead = relationship("CustomerLead", back_populates="tickets")
    serial_unit = relationship("SerialUnit", back_populates="tickets")
    assigned_technician = relationship("User", back_populates="service_tickets")
