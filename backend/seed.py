"""Idempotent demo-data seeder.

Run:  python seed.py
Everything the React UI renders comes from these tables — nothing is hardcoded
in the frontend once it is wired to the API. Re-running this command refreshes
the known demo rows instead of silently skipping them.
"""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from app import models
from app.config import settings
from app.database import Base, SessionLocal, engine
from app.migrations import ensure_schema
from app.security import hash_password
from app.services.bom import ensure_templates, installation_charge, subsidy_for


DEMO_PASSWORD = settings.ADMIN_PASSWORD or "demo2026"


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    ensure_schema(engine)
    db = SessionLocal()
    try:
        _users(db)
        _employees(db)
        leads = _leads(db)
        _surveys(db, leads)
        _quotations(db, leads)
        inventory = _inventory(db)
        serials = _serials(db, inventory)
        orders = _orders(db, leads)
        _payments(db, orders)
        _dispatches(db, orders, serials)
        _installations(db, leads)
        _warranties(db, serials)
        _tickets(db, leads, serials)
        _expenses(db, orders)
        _public_content(db)
        ensure_templates(db)
        print("SEED COMPLETE — database ready")
    finally:
        db.close()


def _users(db) -> None:
    users = [
        ("admin@sunpower.in", "Vikram Malhotra", "ADMIN", "+91 98100 00001"),
        ("sales@sunpower.in", "Pooja Sharma", "SALES", "+91 98100 00002"),
        ("tech.ramesh.sharma@sunpower.in", "Ramesh Sharma", "TECHNICIAN", "+91 98100 00003"),
        ("warehouse@sunpower.in", "Gaurav Singhal", "WAREHOUSE", "+91 98100 00004"),
        ("support@sunpower.in", "Neha Kapoor", "SUPPORT", "+91 98100 00005"),
        ("arvind.sharma@gmail.com", "Arvind Sharma", "CUSTOMER", "+91 98101 23456"),
    ]
    for email, name, role, phone in users:
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            user = models.User(email=email)
            db.add(user)
        user.hashed_password = hash_password(DEMO_PASSWORD)
        user.full_name = name
        user.role = role
        user.phone = phone
        user.is_active = True
        user.is_verified = True
    db.commit()


def _employees(db) -> None:
    people = [
        ("Ramesh Sharma", "TECHNICIAN", "Senior Installation Engineer", "Field Ops", 850, "ACTIVE"),
        ("Amit Patel", "TECHNICIAN", "Site Survey Engineer", "Field Ops", 700, "ACTIVE"),
        ("Rajesh Kumar", "TECHNICIAN", "Installation Engineer", "Field Ops", 750, "ACTIVE"),
        ("Priya Nair", "SALES", "Sales Executive", "Sales", 500, "ACTIVE"),
        ("Karan Mehta", "SALES", "Key Account Manager", "Sales", 600, "ON_LEAVE"),
        ("Gaurav Singhal", "WAREHOUSE", "Warehouse Manager", "Logistics", 550, "ACTIVE"),
        ("Neha Kapoor", "SUPPORT", "Customer Support Lead", "Support", 500, "ACTIVE"),
        ("Suresh Yadav", "TECHNICIAN", "Electrician", "Field Ops", 650, "ACTIVE"),
    ]
    for name, role, designation, department, rate, leave_status in people:
        emp = db.query(models.Employee).filter(models.Employee.name == name).first()
        if not emp:
            emp = models.Employee(name=name)
            db.add(emp)
        emp.email = f"{name.lower().replace(' ', '.')}@sunpower.in"
        emp.role = role
        emp.designation = designation
        emp.department = department
        emp.attendance_status = "PRESENT"
        emp.hourly_rate = Decimal(str(rate))
        emp.leave_status = leave_status
        emp.active = True
    db.commit()


def _leads(db):
    data = [
        {
            "customer_name": "Arvind Sharma",
            "phone": "+91 98101 23456",
            "email": "arvind.sharma@gmail.com",
            "address": "B-42, Sector 15, Noida, Uttar Pradesh 201301",
            "capacity_kw": 3.0,
            "system_type": "ON_GRID",
            "pipeline_stage": "INSTALLED",
            "monthly_bill_inr": 4200,
            "subsidy_requested": True,
            "grid_suitable": True,
            "follow_up_notes": "Installed and handed over. Annual generation review due.",
        },
        {
            "customer_name": "Sunita Rao",
            "phone": "+91 98202 88776",
            "email": "sunita.rao@outlook.com",
            "address": "Villa 14, Palm Meadows, Whitefield, Bengaluru 560066",
            "capacity_kw": 5.0,
            "system_type": "ON_GRID",
            "pipeline_stage": "WON",
            "monthly_bill_inr": 7800,
            "subsidy_requested": True,
            "grid_suitable": True,
            "follow_up_notes": "Order confirmed. Subsidy documents submitted to DISCOM.",
        },
        {
            "customer_name": "Rajesh Mehta",
            "phone": "+91 97114 55667",
            "email": "rajesh.mehta@gmail.com",
            "address": "House 88, Model Town, Jalandhar, Punjab 144003",
            "capacity_kw": 3.0,
            "system_type": "ON_GRID",
            "pipeline_stage": "SURVEY_SCHEDULED",
            "monthly_bill_inr": 3900,
            "subsidy_requested": True,
            "grid_suitable": True,
            "follow_up_notes": "Survey pending. Water tank may cast a late-afternoon shadow.",
        },
        {
            "customer_name": "Kavita Desai",
            "phone": "+91 99250 11223",
            "email": "kavita.desai@gmail.com",
            "address": "12/A, Satellite, Ahmedabad, Gujarat 380015",
            "capacity_kw": 8.0,
            "system_type": "ON_GRID",
            "pipeline_stage": "SURVEY_APPROVED",
            "monthly_bill_inr": 11200,
            "subsidy_requested": True,
            "grid_suitable": True,
            "follow_up_notes": "Roof survey approved. Preparing formal quotation.",
        },
        {
            "customer_name": "Manpreet Singh",
            "phone": "+91 98561 44009",
            "email": "manpreet.singh@gmail.com",
            "address": "Village Rai, Ludhiana, Punjab 141001",
            "capacity_kw": 5.0,
            "system_type": "OFF_GRID",
            "pipeline_stage": "QUOTED",
            "monthly_bill_inr": 6100,
            "subsidy_requested": False,
            "grid_suitable": False,
            "follow_up_notes": "Battery-backed proposal shared. Awaiting customer confirmation.",
        },
        {
            "customer_name": "Deepa Iyer",
            "phone": "+91 97412 77890",
            "email": "deepa.iyer@gmail.com",
            "address": "45, Anna Nagar, Chennai, Tamil Nadu 600040",
            "capacity_kw": 4.0,
            "system_type": "ON_GRID",
            "pipeline_stage": "NEW",
            "monthly_bill_inr": 5200,
            "subsidy_requested": True,
            "grid_suitable": True,
            "follow_up_notes": "New website lead. Site survey not yet scheduled.",
        },
        {
            "customer_name": "Vikram Joshi",
            "phone": "+91 90040 33221",
            "email": "vikram.joshi@gmail.com",
            "address": "Flat 7B, Indiranagar, Bengaluru 560038",
            "capacity_kw": 10.0,
            "system_type": "HYBRID",
            "pipeline_stage": "ORDERED",
            "monthly_bill_inr": 13400,
            "subsidy_requested": True,
            "grid_suitable": True,
            "follow_up_notes": "Advance received. Battery-ready hybrid system ordered.",
        },
        {
            "customer_name": "Anita Verma",
            "phone": "+91 93512 66770",
            "email": "anita.verma@gmail.com",
            "address": "C-19, Gomti Nagar, Lucknow, Uttar Pradesh 226010",
            "capacity_kw": 3.0,
            "system_type": "ON_GRID",
            "pipeline_stage": "LOST",
            "monthly_bill_inr": 3600,
            "subsidy_requested": True,
            "grid_suitable": True,
            "follow_up_notes": "Customer deferred the project. Revisit next quarter.",
        },
    ]
    result = []
    for index, item in enumerate(data):
        lead = db.query(models.Lead).filter(models.Lead.phone == item["phone"]).first()
        if not lead:
            lead = models.Lead(phone=item["phone"])
            db.add(lead)
            lead.created_at = datetime.now(timezone.utc) - timedelta(days=30 - index * 3)
        for key, value in item.items():
            if key in {"capacity_kw", "monthly_bill_inr"}:
                value = Decimal(str(value))
            setattr(lead, key, value)
        lead.source = "website"
        lead.assigned_to = "Pooja Sharma"
        result.append(lead)
    db.commit()
    return result


def _surveys(db, leads) -> None:
    technicians = [1, 2, 3, 2, 1, 3, 2]
    directions = [
        "South-West (210° Azimuth)",
        "South (180° Azimuth)",
        "South (180° Azimuth)",
        "East (90° Azimuth)",
        "South-East (135° Azimuth)",
        "West (270° Azimuth)",
        "South (180° Azimuth)",
    ]
    tilts = ["22.5", "18.0", "24.0", "20.0", "15.0", "25.0", "19.0"]
    areas = ["380", "650", "340", "820", "510", "290", "910"]
    cable = ["20", "32", "18", "40", "25", "15", "45"]
    for index, lead in enumerate(leads[:7]):
        survey = db.query(models.Survey).filter(models.Survey.lead_id == lead.id).first()
        if not survey:
            survey = models.Survey(lead_id=lead.id)
            db.add(survey)
        survey.technician_id = technicians[index]
        survey.scheduled_date = date.today() - timedelta(days=20 - index * 2)
        survey.roof_direction = directions[index]
        survey.tilt_angle_deg = Decimal(tilts[index])
        survey.shadow_free_area_sqft = Decimal(areas[index])
        survey.cable_distance_m = Decimal(cable[index])
        survey.survey_photo_url = "/photos/survey_roof_default.jpg"
        survey.photos = ["/photos/survey_roof_default.jpg"]
        survey.is_approved = lead.pipeline_stage not in {"SURVEY_SCHEDULED", "NEW"}
        survey.notes = "Rooftop inspected. Structure stable and shadow-free during peak hours."
    db.commit()


def _quotations(db, leads) -> None:
    eligible = {"SURVEY_APPROVED", "QUOTED", "WON", "ORDERED", "INSTALLED"}
    for lead in leads:
        if lead.pipeline_stage not in eligible:
            continue
        quotation = db.query(models.Quotation).filter(models.Quotation.lead_id == lead.id).first()
        if not quotation:
            quotation = models.Quotation(lead_id=lead.id)
            db.add(quotation)
        survey = db.query(models.Survey).filter(models.Survey.lead_id == lead.id).first()
        kw = Decimal(str(lead.capacity_kw or 0))
        subtotal = kw * Decimal("62000")
        install = installation_charge(kw)
        subsidy = subsidy_for(kw, lead.system_type) if lead.subsidy_requested else Decimal("0")
        panel_total = kw * 2 * Decimal("10500")
        balance = max(Decimal("0"), subtotal - panel_total)
        quotation.survey_id = survey.id if survey else None
        quotation.quotation_number = f"QUO-DEMO-{lead.id:04d}"
        quotation.capacity_kw = kw
        quotation.system_type = lead.system_type
        quotation.bom = [{"item_name": "Solar Panel 550W", "quantity": int(kw * 2)}]
        quotation.line_items = [
            {
                "item_name": "Solar Panels",
                "quantity": int(kw * 2),
                "unit_price": 10500,
                "line_total": float(panel_total),
            },
            {
                "item_name": "Inverter & Structure",
                "quantity": 1,
                "unit_price": float(balance),
                "line_total": float(balance),
            },
        ]
        quotation.subtotal = subtotal
        quotation.installation_charge = install
        quotation.subsidy_estimate = subsidy
        quotation.discount = Decimal("0")
        quotation.total = max(Decimal("0"), subtotal + install - subsidy)
        quotation.status = "APPROVED_BY_CUSTOMER"
        quotation.valid_until = date.today() + timedelta(days=30)
    db.commit()


def _inventory(db):
    items = [
        ("SOL-PANEL-550", "Solar Panel 550W Monocrystalline", "PANEL", Decimal("10500"), 120, 20),
        ("INV-HYB-5K", "5kW Hybrid Inverter", "INVERTER", Decimal("28500"), 24, 5),
        ("INV-ON-3K", "3kW On-Grid Inverter", "INVERTER", Decimal("22500"), 30, 5),
        ("BAT-LI-5K", "5kWh Lithium Battery", "BATTERY", Decimal("38500"), 14, 4),
        ("STR-MNT-GI", "GI Mounting Structure", "STRUCTURE", Decimal("3200"), 80, 15),
        ("CTL-MPPT-60", "MPPT Charge Controller 60A", "CONTROLLER", Decimal("5600"), 18, 5),
        ("SW-DC-40", "DC Switch Box 40A", "SAFETY", Decimal("1850"), 3, 5),
        ("CAB-CABLE-4", "Solar DC Cable 4mm (100m)", "CABLE", Decimal("2400"), 40, 10),
        ("EARTH-KIT-01", "Earthing Kit", "EARTHING", Decimal("1900"), 35, 8),
    ]
    result = []
    for sku, name, category, price, stock, reorder in items:
        item = db.query(models.InventoryItem).filter(models.InventoryItem.sku == sku).first()
        if not item:
            item = models.InventoryItem(sku=sku)
            db.add(item)
        item.name = name
        item.category = category
        item.unit = "pcs"
        item.unit_price = price
        item.unit_cost_inr = (price * Decimal("0.72")).quantize(Decimal("0.01"))
        item.stock_qty = stock
        item.reorder_level = reorder
        result.append(item)
    db.commit()
    return result


def _serials(db, inventory):
    result = []
    for item in inventory[:5]:
        for suffix in ("001", "002", "003"):
            serial_number = f"{item.sku}-{suffix}"
            unit = db.query(models.SerialUnit).filter(
                models.SerialUnit.serial_number == serial_number
            ).first()
            if not unit:
                unit = models.SerialUnit(
                    serial_number=serial_number,
                    received_at=datetime.now(timezone.utc) - timedelta(days=15),
                )
                db.add(unit)
            unit.inventory_item_id = item.id
            unit.status = "IN_STOCK"
            unit.batch_no = "BATCH-2026-11"
            unit.warehouse_location = "Rack A / Bin 2"
            result.append(unit)
    db.commit()
    return result


def _orders(db, leads):
    result = []
    for lead in leads:
        if lead.pipeline_stage not in {"ORDERED", "INSTALLED", "WON"}:
            continue
        order = db.query(models.Order).filter(models.Order.lead_id == lead.id).first()
        if not order:
            order = models.Order(lead_id=lead.id)
            db.add(order)
        quotation = (
            db.query(models.Quotation).filter(models.Quotation.lead_id == lead.id).first()
        )
        total = quotation.total if quotation else Decimal(str(lead.capacity_kw)) * Decimal("65000")
        advance = (total * Decimal("0.40")).quantize(Decimal("0.01"))
        paid = (total * Decimal("0.80")).quantize(Decimal("0.01")) if lead.pipeline_stage == "INSTALLED" else advance
        if lead.subsidy_requested:
            subsidy_status = {
                "INSTALLED": "DISBURSED",
                "WON": "INSPECTED",
                "ORDERED": "APPLIED",
            }.get(lead.pipeline_stage, "APPLIED")
        else:
            subsidy_status = "NOT_APPLIED"
        order.order_number = f"ORD-DEMO-{lead.id:04d}"
        order.quotation_id = quotation.id if quotation else None
        order.customer_name = lead.customer_name
        order.customer_phone = lead.phone
        order.address = lead.address
        order.capacity_kw = lead.capacity_kw
        order.system_type = lead.system_type
        order.total_amount = total
        order.advance_amount = advance
        order.paid_amount = paid
        order.balance_amount = (total - paid).quantize(Decimal("0.01"))
        order.status = "COMPLETED" if lead.pipeline_stage == "INSTALLED" else "CONFIRMED"
        order.payment_status = "PARTIAL"
        order.subsidy_status = subsidy_status
        order.subsidy_amount = quotation.subsidy_estimate if quotation else Decimal("0")
        order.order_date = date.today() - timedelta(days=12)
        result.append(order)
    db.commit()
    return result


def _payments(db, orders) -> None:
    for order in orders:
        payments = (
            db.query(models.Payment)
            .filter(models.Payment.order_id == order.id)
            .order_by(models.Payment.id)
            .all()
        )
        if not payments:
            payments = [
                models.Payment(order_id=order.id, method="UPI", reference=f"UPI{order.id:06d}"),
            ]
            db.add(payments[0])
        payments[0].amount = order.advance_amount
        payments[0].status = "PAID"
        extra = order.paid_amount - order.advance_amount
        if extra > 0:
            if len(payments) < 2:
                second = models.Payment(
                    order_id=order.id,
                    method="NETBANKING",
                    reference=f"NB{order.id:06d}",
                )
                db.add(second)
                payments.append(second)
            payments[1].amount = extra
            payments[1].status = "PAID"
        for stale in payments[2:]:
            db.delete(stale)
    db.commit()


def _dispatches(db, orders, serials) -> None:
    for index, order in enumerate(orders[:2]):
        if index >= len(serials):
            break
        serial = serials[index * 2 if index * 2 < len(serials) else 0]
        dispatch = db.query(models.Dispatch).filter(
            models.Dispatch.serial_unit_id == serial.id
        ).first()
        if not dispatch:
            dispatch = models.Dispatch(
                order_id=order.id,
                serial_unit_id=serial.id,
                serial_number=serial.serial_number,
            )
            db.add(dispatch)
        serial.status = "DELIVERED" if index == 0 else "IN_TRANSIT"
        dispatch.order_id = order.id
        dispatch.serial_number = serial.serial_number
        dispatch.status = "DELIVERED" if index == 0 else "IN_TRANSIT"
        dispatch.receiver_name = order.customer_name
        dispatch.receiver_phone = order.customer_phone
        dispatch.delivery_address = order.address
        dispatch.delivery_confirmed_at = (
            datetime.now(timezone.utc) - timedelta(days=5) if index == 0 else None
        )
    db.commit()


def _installations(db, leads) -> None:
    order_map = {
        row.lead_id: row
        for row in db.query(models.Order).all()
        if row.lead_id is not None
    }
    technicians = [1, 2, 3]
    for index, lead in enumerate(
        [item for item in leads if item.pipeline_stage in {"INSTALLED", "WON", "ORDERED"}]
    ):
        installation = db.query(models.Installation).filter(
            models.Installation.lead_id == lead.id
        ).first()
        if not installation:
            installation = models.Installation(lead_id=lead.id)
            db.add(installation)
        completed = lead.pipeline_stage == "INSTALLED"
        order = order_map.get(lead.id)
        installation.order_id = order.id if order else None
        installation.technician_id = technicians[index % len(technicians)]
        installation.customer_name = lead.customer_name
        installation.system_kw = lead.capacity_kw
        installation.scheduled_date = date.today() + timedelta(days=5 - index * 4)
        installation.status = "COMPLETED" if completed else "SCHEDULED"
        installation.progress_pct = 100 if completed else 60
        installation.hours_logged = Decimal("8.00") if completed else Decimal("4.00")
        installation.verified_kw = lead.capacity_kw if completed else Decimal("0")
        installation.system_tested_ok = completed
        installation.testing_ok = completed
        installation.voc_voltage = Decimal("48.20") if completed else Decimal("0")
        installation.isc_current = Decimal("9.40") if completed else Decimal("0")
        installation.earth_resistance_ohms = Decimal("1.80") if completed else Decimal("0")
        installation.photos = ["/photos/installation_roof_default.jpg"] if completed else []
        installation.install_photo_url = "/photos/installation_roof_default.jpg" if completed else None
        installation.start_time = datetime.now(timezone.utc) - timedelta(days=4) if completed else None
        installation.finish_time = datetime.now(timezone.utc) - timedelta(days=3) if completed else None
        installation.completion_notes = (
            "All tests passed. System handed over to customer." if completed else None
        )
    db.commit()


def _warranties(db, serials) -> None:
    for serial in serials[:2]:
        warranty = db.query(models.Warranty).filter(
            models.Warranty.serial_unit_id == serial.id
        ).first()
        if warranty:
            continue
        start = date.today() - timedelta(days=45)
        db.add(
            models.Warranty(
                serial_unit_id=serial.id,
                start_date=start,
                duration_months=240,
                expiry_date=start + timedelta(days=240 * 30),
                status="ACTIVE",
            )
        )
    db.commit()


def _tickets(db, leads, serials) -> None:
    tickets = [
        {
            "lead": 0,
            "subject": "Inverter display blank",
            "priority": "HIGH",
            "status": "OPEN",
            "technician": 1,
            "resolution": "REPLACE",
            "parts": 8500,
            "labor": 1500,
        },
        {
            "lead": 1,
            "subject": "Panel output drop",
            "priority": "MEDIUM",
            "status": "IN_PROGRESS",
            "technician": 2,
            "resolution": "REPAIR",
            "parts": 1200,
            "labor": 2500,
        },
        {
            "lead": 6,
            "subject": "Battery not charging",
            "priority": "HIGH",
            "status": "OPEN",
            "technician": 3,
            "resolution": "REPLACE",
            "parts": 18000,
            "labor": 2000,
        },
        {
            "lead": 3,
            "subject": "Loose cable connection",
            "priority": "LOW",
            "status": "RESOLVED_CONFIRMED",
            "technician": 1,
            "resolution": "REPAIR",
            "parts": 450,
            "labor": 800,
        },
    ]
    for index, item in enumerate(tickets):
        if item["lead"] >= len(leads):
            continue
        lead = leads[item["lead"]]
        serial = serials[index] if index < len(serials) else None
        warranty = (
            db.query(models.Warranty).filter(
                models.Warranty.serial_unit_id == serial.id
            ).first()
            if serial
            else None
        )
        in_warranty = bool(warranty and warranty.status == "ACTIVE")
        number = f"TKT-DEMO-{lead.id:04d}-{item['priority'][:1]}"
        ticket = db.query(models.Ticket).filter(models.Ticket.ticket_number == number).first()
        if not ticket:
            ticket = models.Ticket(ticket_number=number)
            db.add(ticket)
        ticket.lead_id = lead.id
        ticket.customer_name = lead.customer_name
        ticket.subject = item["subject"]
        ticket.description = item["subject"]
        ticket.priority = item["priority"]
        ticket.status = item["status"]
        ticket.serial_unit_id = serial.id if serial else None
        ticket.fault_code = f"FC-{index + 1:03d}"
        ticket.assigned_to = db.get(models.Employee, item["technician"]).name
        ticket.assigned_technician_id = item["technician"]
        ticket.resolution_type = item["resolution"]
        ticket.parts_cost = Decimal(str(item["parts"]))
        ticket.labour_cost = Decimal(str(item["labor"]))
        ticket.in_warranty = in_warranty
        ticket.billable_amount = (
            Decimal("0")
            if in_warranty
            else Decimal(str(item["parts"] + item["labor"] + 1500))
        )
        ticket.customer_confirmed = item["status"] == "RESOLVED_CONFIRMED"
        ticket.closed_at = (
            datetime.now(timezone.utc) if item["status"] == "RESOLVED_CONFIRMED" else None
        )
    db.commit()


def _expenses(db, orders) -> None:
    categories = ["LOGISTICS", "LABOUR", "INSTALLATION", "LOGISTICS"]
    amounts = ["4500", "8200", "3100", "6200"]
    for index, order in enumerate(orders):
        expense = db.query(models.Expense).filter(
            models.Expense.order_id == order.id
        ).first()
        if not expense:
            expense = models.Expense(order_id=order.id)
            db.add(expense)
        expense.category = categories[index % len(categories)]
        expense.amount = Decimal(amounts[index % len(amounts)])
        expense.note = "Project execution cost"
    db.commit()


def _public_content(db) -> None:
    packages = [
        ("3 kW Home Solar", 3.0, "ON_GRID", 159000, 4200,
         "Perfect for a 2–3 BHK home. Covers most daytime usage.",
         ["8 × 550W Mono Panels", "3kW On-Grid Inverter", "GI Mounting Structure", "Free Site Survey"],
         "BESTSELLER", 1),
        ("5 kW Family Solar", 5.0, "ON_GRID", 249000, 6800,
         "Ideal for families with AC and higher daytime consumption.",
         ["10 × 550W Mono Panels", "5kW Hybrid Inverter", "Complete Earthing", "5 Year Warranty"],
         "POPULAR", 2),
        ("8 kW Premium Solar", 8.0, "HYBRID", 399000, 11200,
         "Whole-home solution with battery-ready hybrid architecture.",
         ["15 × 550W Mono Panels", "8kW Hybrid Inverter", "Smart Monitoring", "Priority Support"],
         None, 3),
        ("5 kW Off-Grid + Battery", 5.0, "OFF_GRID", 429000, 6100,
         "Complete independence from the grid with 5kWh storage.",
         ["10 × 550W Mono Panels", "5kWh Lithium Battery", "MPPT Controller", "Backup During Outages"],
         "NEW", 4),
    ]
    for name, kw, stype, price, savings, desc, features, badge, order in packages:
        row = db.query(models.Package).filter(models.Package.name == name).first()
        if not row:
            row = models.Package(name=name)
            db.add(row)
        row.capacity_kw = Decimal(str(kw))
        row.system_type = stype
        row.price_inr = Decimal(str(price))
        row.monthly_savings_inr = Decimal(str(savings))
        row.description = desc
        row.features = features
        row.badge = badge
        row.sort_order = order
        row.is_active = True

    products = [
        ("Mono PERC 550W Panel", "PANEL", "High-efficiency monocrystalline module with 25 year linear warranty.",
         {"wattage": "550W", "efficiency": "21.3%", "warranty": "25 years", "price": "₹10,500 / panel"}),
        ("Hybrid Inverter 5kW", "INVERTER", "Grid-tie and battery ready inverter with integrated MPPT.",
         {"capacity": "5kW", "type": "Hybrid", "warranty": "5 years", "price": "₹28,500 / unit"}),
        ("Lithium Battery 5kWh", "BATTERY", "Deep-cycle LiFePO4 battery with 6000+ cycles.",
         {"capacity": "5kWh", "chemistry": "LiFePO4", "warranty": "5 years", "price": "₹38,500 / pack"}),
        ("GI Mounting Structure", "STRUCTURE", "Hot-dip galvanised rack for flat and sloped roofs.",
         {"material": "GI Steel", "wind_load": "150 kmph", "price": "Included in BoM"}),
        ("MPPT Charge Controller", "CONTROLLER", "60A MPPT controller with LCD monitoring.",
         {"current": "60A", "voltage": "48V", "price": "₹5,600 / unit"}),
    ]
    for index, (name, category, desc, specs) in enumerate(products):
        row = db.query(models.Product).filter(models.Product.name == name).first()
        if not row:
            row = models.Product(name=name)
            db.add(row)
        row.category = category
        row.description = desc
        row.specifications = specs
        row.sort_order = index
        row.is_active = True

    testimonials = [
        ("Arvind Sharma", "Noida, UP", 5, "My electricity bill dropped from ₹4,200 to ₹380 in the first month. The team handled everything from survey to subsidy paperwork.", 3.0),
        ("Sunita Rao", "Bengaluru, KA", 5, "Professional installation and zero follow-up hassle. The monitoring app is a great touch.", 5.0),
        ("Manpreet Singh", "Ludhiana, PB", 4, "Off-grid system works perfectly through power cuts. Battery backup is exactly as promised.", 5.0),
        ("Kavita Desai", "Ahmedabad, GJ", 5, "Transparent pricing and genuine subsidy guidance. Highly recommend SunPower.", 8.0),
    ]
    for index, (name, location, rating, quote, kw) in enumerate(testimonials):
        row = db.query(models.Testimonial).filter(
            models.Testimonial.customer_name == name
        ).first()
        if not row:
            row = models.Testimonial(customer_name=name)
            db.add(row)
        row.location = location
        row.rating = rating
        row.quote = quote
        row.project_kw = Decimal(str(kw))
        row.sort_order = index
        row.is_active = True

    faqs = [
        ("What is the payback period for a home solar system?", "Most SunPower systems pay for themselves in 4–6 years, depending on capacity, local tariff and subsidy eligibility.", "general"),
        ("Is subsidy available on all systems?", "Subsidy is available for eligible residential on-grid systems up to 10 kW, subject to government scheme approval.", "subsidy"),
        ("Do I need a separate battery?", "Not for on-grid systems. Batteries are recommended for off-grid setups or backup during outages.", "technical"),
        ("What warranty do I get?", "Panels carry a 25-year performance warranty, inverters and batteries 5 years, and installation workmanship 2 years.", "warranty"),
        ("How long does installation take?", "A typical residential project is completed within 7–10 working days after survey approval.", "process"),
        ("Who handles the subsidy paperwork?", "Our sales team prepares and submits all subsidy documentation on your behalf.", "subsidy"),
        ("Can I monitor generation remotely?", "Yes. Every system includes a mobile/web monitoring dashboard with live generation data.", "technical"),
        ("What happens during a power cut?", "Grid-tied systems shut down for safety. Hybrid systems with batteries continue powering your home.", "technical"),
    ]
    for index, (question, answer, category) in enumerate(faqs):
        row = db.query(models.Faq).filter(models.Faq.question == question).first()
        if not row:
            row = models.Faq(question=question)
            db.add(row)
        row.answer = answer
        row.category = category
        row.sort_order = index
        row.is_active = True

    settings_data = {
        "hero": {
            "eyebrow": "HARNESS THE SUN. POWER YOUR FUTURE.",
            "title": "Certified Rooftop Solar Systems for Clean Home Energy",
            "subtitle": "SunPower Solutions manufactures, procures, and installs Tier-1 Mono-PERC rooftop solar systems for homeowners and commercial establishments across India.",
            "cta_primary": "Calculate Solar Savings",
            "cta_secondary": "Book Free Roof Survey",
        },
        "company": {
            "name": "SunPower Solutions",
            "legal_name": "SunPower Solutions India",
            "tagline": "Turnkey Solar EPC & Smart Asset Management.",
            "phone": "+91 1800 123 4567",
            "email": "hello@sunpower.in",
            "address": "Plot 12, Solar Tech Park, Noida, Uttar Pradesh 201301",
            "hubs": ["Jalandhar, Punjab (Main Depot)", "Delhi NCR (Sales & Engineering)"],
            "certifications": ["ISO 9001:2015 Certified EPC", "MNRE Empaneled Channel Partner"],
        },
        "calculator": {
            "cost_per_kw_inr": 58000,
            "off_grid_cost_per_kw_inr": 85000,
            "average_sun_hours": 4.6,
            "tariff_inr_per_unit": 7.5,
            "units_per_kw_per_month": 120,
            "sqft_per_kw": 80,
            "min_bill_inr": 1000,
            "max_bill_inr": 25000,
            "bill_step_inr": 500,
            "min_roof_area_sqft": 100,
            "max_roof_area_sqft": 2000,
            "roof_area_step_sqft": 50,
            "min_capacity_kw": 1,
            "max_capacity_kw": 10,
            "horizon_years": 25,
            "subsidy_tiers": [
                {"max_kw": 1, "amount_inr": 30000},
                {"max_kw": 2, "amount_inr": 60000},
                {"max_kw": 10, "amount_inr": 78000},
            ],
        },
        "subsidy": {
            "title": "PM Surya Ghar: Muft Bijli Yojana Subsidy Structure",
            "description": "Direct Benefit Transfer (DBT) deposited straight into the homeowner's registered bank account post commissioning.",
            "tiers": [
                {"label": "Tier 1: 1 kW System", "amount": "₹30,000", "description": "Flat central DBT subsidy for residential installations up to 1 kW capacity."},
                {"label": "Tier 2: 2 kW System", "amount": "₹60,000", "description": "Flat central DBT subsidy for residential installations up to 2 kW capacity."},
                {"label": "Tier 3: 3 kW to 10 kW", "amount": "₹78,000", "description": "Maximum capped DBT central government subsidy for 3 kW and higher systems."},
            ],
        },
        "stats": [
            {"value": "40+", "label": "Projects per month", "tone": "white"},
            {"value": "15", "label": "Certified technicians", "tone": "amber"},
            {"value": "₹78,000", "label": "Direct DBT subsidy", "tone": "emerald"},
            {"value": "20 Years", "label": "Panel output guarantee", "tone": "sky"},
        ],
        "about": {
            "eyebrow": "About SunPower Solutions",
            "title": "Full Turnkey Rooftop Solar Engineering",
            "subtitle": "Engineered with strict quality standards, deterministic inventory control, and end-to-end execution.",
            "cards": [
                {"title": "Government Empaneled", "description": "Approved channel partner under the Ministry of New & Renewable Energy (MNRE) for direct DBT PM Surya Ghar subsidies.", "icon": "award", "tone": "amber"},
                {"title": "Certified Field Crew", "description": "15 full-time certified solar technicians with rigorous structural anchor testing, lightning arrestors, and earthing chemical pits.", "icon": "shield", "tone": "emerald"},
                {"title": "40 Projects Monthly", "description": "Serving Punjab, Haryana, and Delhi NCR with guaranteed DISCOM net-metering synchronization within 14 business days.", "icon": "building", "tone": "sky"},
            ],
        },
        "architectures": [
            {
                "system_type": "ON_GRID",
                "name": "On-Grid Rooftop System",
                "subtitle": "Net metering with DISCOM",
                "badge": "Govt Subsidy Eligible",
                "badge_tone": "emerald",
                "icon": "zap",
                "features": [
                    "Exports surplus generation back to the grid for monthly billing credit.",
                    "Lowest lifetime CAPEX with zero recurring battery replacement cost.",
                    "Central Government DBT PM Surya Ghar subsidy up to ₹78,000.",
                    "20-Year linear panel power output warranty.",
                ],
                "payback": "~2.8 to 3.5 years",
                "payback_tone": "emerald",
            },
            {
                "system_type": "OFF_GRID",
                "name": "Off-Grid Solar System",
                "subtitle": "Battery energy storage included",
                "badge": "24x7 Power Backup",
                "badge_tone": "slate",
                "icon": "battery",
                "features": [
                    "Complete power independence from DISCOM power cuts and grid outages.",
                    "High-capacity tubular or LiFePO4 lithium battery energy storage options.",
                    "Ideal for farmhouses, manufacturing workshops, and areas with unreliable power.",
                    "Heavy-duty pure sine wave inverter with MPPT charger.",
                ],
                "payback": "~4.0 to 5.2 years",
                "payback_tone": "slate",
            },
        ],
        "sections": {
            "products": {"eyebrow": "Hardware & Components", "title": "Certified Tier-1 Solar Products", "description": "Every serialized component is tracked in our central database with automated warranty registration upon dispatch."},
            "architectures": {"eyebrow": "System Architectures", "title": "Choose Your Solar System Type", "description": "Compare grid-tied net metering with independent battery energy storage."},
            "packages": {"eyebrow": "Ready-Made Systems", "title": "Turnkey Solar Packages", "description": "Transparent, all-inclusive packages with installation, earthing and subsidy support included."},
            "testimonials": {"eyebrow": "Customer Stories", "title": "Trusted by Homeowners Across India", "description": "Real feedback from families whose electricity bills now reflect sunlight, not dependence on the grid."},
            "faqs": {"eyebrow": "Answers", "title": "Frequently Asked Questions", "description": "Everything you need to know before switching your rooftop to solar."},
        },
    }
    for key, value in settings_data.items():
        row = db.query(models.SiteSetting).filter(models.SiteSetting.key == key).first()
        if not row:
            row = models.SiteSetting(key=key)
            db.add(row)
        row.value = value
        row.updated_at = datetime.now(timezone.utc)
    db.commit()


if __name__ == "__main__":
    seed()
