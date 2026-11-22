"""Comprehensive seeder for SunPower Solar ERP: Inserts 200+ realistic records across all tables."""
import os
import sys
import datetime
from decimal import Decimal
import random

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import SessionLocal, engine
from app.security import hash_password
from app import models

DEMO_PASSWORD = "demo2026"

CITIES = [
    ("Patna", "Bihar", "NBPDCL / SBPDCL"),
    ("Ranchi", "Jharkhand", "JBVNL"),
    ("Varanasi", "Uttar Pradesh", "UPPCL"),
    ("Lucknow", "Uttar Pradesh", "MVVNL"),
    ("Delhi", "Delhi NCR", "BSES Rajdhani"),
    ("Noida", "Uttar Pradesh", "PVVNL"),
    ("Jaipur", "Rajasthan", "JVVNL"),
    ("Bhopal", "Madhya Pradesh", "MPPKVVCL"),
    ("Indore", "Madhya Pradesh", "MPPKVVCL"),
    ("Mumbai", "Maharashtra", "MSEDCL"),
    ("Pune", "Maharashtra", "MSEDCL"),
    ("Ahmedabad", "Gujarat", "Torrent Power"),
    ("Bengaluru", "Karnataka", "BESCOM"),
    ("Hyderabad", "Telangana", "TSSPDCL"),
    ("Kolkata", "West Bengal", "WBSEDCL"),
]

FIRST_NAMES = [
    "Aditya", "Rohan", "Pooja", "Vikram", "Ramesh", "Gaurav", "Neha", "Arvind",
    "Deepak", "Sunita", "Anil", "Meera", "Sanjay", "Kavita", "Rajesh", "Priya",
    "Amit", "Swati", "Manoj", "Shweta", "Suresh", "Divya", "Alok", "Rashmi",
    "Tarun", "Ananya", "Harish", "Preeti", "Kunal", "Sneha", "Ashok", "Kiran"
]

LAST_NAMES = [
    "Pathak", "Sharma", "Malhotra", "Singhal", "Kapoor", "Mehra", "Verma", "Gupta",
    "Mishra", "Pandey", "Tiwari", "Yadav", "Singh", "Choudhary", "Jha", "Kumar"
]

def seed_200():
    db = SessionLocal()
    try:
        print("Starting 200+ record comprehensive seed...")

        # -------------------------------------------------------------
        # 1. USERS (including Aditya Pathak)
        # -------------------------------------------------------------
        # Check or update Aditya Pathak
        aditya = db.query(models.User).filter(
            (models.User.email == "adityapathak6262@gmail.com") | (models.User.phone == "8789988023")
        ).first()

        if not aditya:
            aditya = models.User(email="adityapathak6262@gmail.com")
            db.add(aditya)
        aditya.full_name = "Aditya Pathak"
        aditya.phone = "8789988023"
        aditya.role = "ADMIN"
        aditya.hashed_password = hash_password(DEMO_PASSWORD)
        aditya.is_active = True
        aditya.is_verified = True
        aditya.avatar_url = aditya.avatar_url or "https://lh3.googleusercontent.com/a/ACg8ocJe48txQVekY_evDzlFo0p4oqZzzIMCMRA-gA8NsvB9LOLr58FL=s96-c"
        db.commit()
        db.refresh(aditya)
        print(f"Verified Aditya Pathak: ID={aditya.id}, Email={aditya.email}, Phone={aditya.phone}, Role={aditya.role}")

        # Seed 25 additional diverse users
        roles = ["CUSTOMER", "CUSTOMER", "CUSTOMER", "TECHNICIAN", "WAREHOUSE", "SALES", "SUPPORT", "ADMIN"]
        created_users = [aditya]

        for i in range(1, 26):
            fn = FIRST_NAMES[i % len(FIRST_NAMES)]
            ln = LAST_NAMES[(i * 3) % len(LAST_NAMES)]
            email = f"{fn.lower()}.{ln.lower()}.{i}@sunpower.in"
            user = db.query(models.User).filter(models.User.email == email).first()
            if not user:
                user = models.User(
                    email=email,
                    full_name=f"{fn} {ln}",
                    phone=f"+91 98100 {10000 + i}",
                    role=roles[i % len(roles)],
                    hashed_password=hash_password(DEMO_PASSWORD),
                    is_active=True,
                    is_verified=True,
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            created_users.append(user)

        print(f"Total Users in DB: {db.query(models.User).count()}")

        # -------------------------------------------------------------
        # 2. EMPLOYEES & ATTENDANCE (15 Employees, 40 Attendance logs)
        # -------------------------------------------------------------
        staff_roles = [
            ("Survey Engineer", "ENGINEERING", 350.0),
            ("Senior Solar Technician", "OPERATIONS", 400.0),
            ("Warehouse Dispatch Lead", "LOGISTICS", 300.0),
            ("Electrical QC Inspector", "QUALITY", 450.0),
            ("Site Installation Supervisor", "PROJECTS", 420.0),
            ("Customer Support Specialist", "SUPPORT", 250.0),
            ("Solar Sales Consultant", "SALES", 320.0),
        ]

        employees = []
        for i in range(15):
            fn = FIRST_NAMES[(i + 5) % len(FIRST_NAMES)]
            ln = LAST_NAMES[(i + 2) % len(LAST_NAMES)]
            desig, dept, rate = staff_roles[i % len(staff_roles)]
            emp = db.query(models.Employee).filter(models.Employee.email == f"{fn.lower()}.{ln.lower()}@sunpower.in").first()
            if not emp:
                emp = models.Employee(
                    name=f"{fn} {ln}",
                    email=f"{fn.lower()}.{ln.lower()}@sunpower.in",
                    phone=f"+91 98710 {20000 + i}",
                    designation=desig,
                    department=dept,
                    hourly_rate=Decimal(str(rate)),
                    active=True,
                    leave_status="Active Duty",
                    attendance_status="PRESENT" if i % 6 != 0 else "ON_LEAVE",
                    joined_at=datetime.datetime(2024, 1 + (i % 12), 1 + (i % 25)),
                )
                db.add(emp)
                db.commit()
                db.refresh(emp)
            employees.append(emp)

        # 40 Attendance Records
        today = datetime.date.today()
        attendance_count = db.query(models.Attendance).count()
        if attendance_count < 35:
            for day_offset in range(1, 6):
                date_val = today - datetime.timedelta(days=day_offset)
                for emp in employees[:8]:
                    check_in = datetime.datetime.combine(date_val, datetime.time(9, 15 + random.randint(0, 20)))
                    check_out = datetime.datetime.combine(date_val, datetime.time(18, 5 + random.randint(0, 30)))
                    att = models.Attendance(
                        employee_id=emp.id,
                        work_date=date_val,
                        status="PRESENT" if (emp.id + day_offset) % 7 != 0 else "HALF_DAY",
                        check_in=check_in,
                        check_out=check_out,
                    )
                    db.add(att)
            db.commit()
        print(f"Total Attendance logs in DB: {db.query(models.Attendance).count()}")

        # -------------------------------------------------------------
        # 3. LEADS (30 detailed solar leads)
        # -------------------------------------------------------------
        system_types = ["ON_GRID", "HYBRID", "OFF_GRID", "COMMERCIAL_ROOFTOP"]
        sources = ["Website Enquiry", "Google Ads", "Referral", "Solar Calculator", "Field Drive"]
        leads = []

        # Ensure Aditya Pathak is also represented as a prime lead
        aditya_lead = db.query(models.Lead).filter(models.Lead.email == "adityapathak6262@gmail.com").first()
        if not aditya_lead:
            aditya_lead = models.Lead(
                customer_name="Aditya Pathak",
                email="adityapathak6262@gmail.com",
                phone="8789988023",
                address="Boring Road, Near Canal Cross",
                city="Patna",
                state="Bihar",
                capacity_kw=Decimal("5.0"),
                system_type="ON_GRID",
                pipeline_stage="PROPOSAL_SENT",
                monthly_bill_inr=Decimal("4500.0"),
                subsidy_requested=True,
                source="Solar Calculator",
                grid_suitable=True,
                notes="Premium residential rooftop. 400 sq.ft shadow-free RCC roof.",
            )
            db.add(aditya_lead)
            db.commit()
            db.refresh(aditya_lead)
        leads.append(aditya_lead)

        for i in range(1, 30):
            fn = FIRST_NAMES[(i * 2) % len(FIRST_NAMES)]
            ln = LAST_NAMES[(i * 3) % len(LAST_NAMES)]
            city, state, discom = CITIES[i % len(CITIES)]
            email = f"lead.{fn.lower()}.{i}@example.com"
            ld = db.query(models.Lead).filter(models.Lead.email == email).first()
            if not ld:
                cap = Decimal(str(random.choice([3.0, 5.0, 7.5, 10.0, 15.0])))
                bill = cap * Decimal("900")
                ld = models.Lead(
                    customer_name=f"{fn} {ln}",
                    email=email,
                    phone=f"+91 97200 {30000 + i}",
                    address=f"Plot #{100 + i}, Sector {2 + (i % 20)}, {city}",
                    city=city,
                    state=state,
                    capacity_kw=cap,
                    system_type=system_types[i % len(system_types)],
                    pipeline_stage=random.choice(["NEW", "SURVEY_SCHEDULED", "PROPOSAL_SENT", "ORDER_CONFIRMED"]),
                    monthly_bill_inr=bill,
                    subsidy_requested=True,
                    source=sources[i % len(sources)],
                    grid_suitable=True,
                    notes=f"DISCOM: {discom}. RCC shadow-free rooftop available.",
                )
                db.add(ld)
                db.commit()
                db.refresh(ld)
            leads.append(ld)

        print(f"Total Leads in DB: {db.query(models.Lead).count()}")

        # -------------------------------------------------------------
        # 4. SURVEYS (25 Site Surveys)
        # -------------------------------------------------------------
        surveys = []
        for i, ld in enumerate(leads[:25]):
            surv = db.query(models.Survey).filter(models.Survey.lead_id == ld.id).first()
            if not surv:
                surv = models.Survey(
                    lead_id=ld.id,
                    technician_id=employees[i % len(employees)].id,
                    scheduled_date=datetime.date.today() - datetime.timedelta(days=random.randint(2, 30)),
                    roof_direction=random.choice(["South", "South-East", "South-West"]),
                    tilt_angle_deg=Decimal(str(random.choice([15.0, 20.0, 25.0, 28.0]))),
                    shadow_free_area_sqft=Decimal(str(float(ld.capacity_kw) * 85.0)),
                    cable_distance_m=Decimal(str(random.randint(15, 35))),
                    is_approved=True,
                    notes=f"RCC Roof structure verified. Structural stability approved. 3-Phase meter available.",
                )
                db.add(surv)
                db.commit()
                db.refresh(surv)
            surveys.append(surv)

        print(f"Total Surveys in DB: {db.query(models.Survey).count()}")

        # -------------------------------------------------------------
        # 5. QUOTATIONS (25 BoM Proposals)
        # -------------------------------------------------------------
        quotations = []
        for i, ld in enumerate(leads[:25]):
            q = db.query(models.Quotation).filter(models.Quotation.lead_id == ld.id).first()
            if not q:
                kw = float(ld.capacity_kw)
                subtotal = Decimal(str(round(kw * 54000.0)))
                install_charge = Decimal("15000.0")
                subsidy = Decimal("78000.0" if kw >= 3.0 else "30000.0")
                total = subtotal + install_charge - subsidy

                q = models.Quotation(
                    lead_id=ld.id,
                    survey_id=surveys[i].id if i < len(surveys) else None,
                    quotation_number=f"SP-QT-2025-{5000 + i}",
                    capacity_kw=ld.capacity_kw,
                    system_type=ld.system_type,
                    subtotal=subtotal,
                    installation_charge=install_charge,
                    subsidy_estimate=subsidy,
                    discount=Decimal("2000.0"),
                    total=total,
                    status=random.choice(["APPROVED", "ACCEPTED", "SENT"]),
                    valid_until=datetime.date.today() + datetime.timedelta(days=45),
                    notes="Includes 25-Year performance warranty and MNRE subsidy assistance.",
                )
                db.add(q)
                db.commit()
                db.refresh(q)
            quotations.append(q)

        print(f"Total Quotations in DB: {db.query(models.Quotation).count()}")

        # -------------------------------------------------------------
        # 6. ORDERS (20 Sales Orders)
        # -------------------------------------------------------------
        orders = []
        for i, q in enumerate(quotations[:20]):
            ord_rec = db.query(models.Order).filter(models.Order.quotation_id == q.id).first()
            if not ord_rec:
                ld = db.query(models.Lead).filter(models.Lead.id == q.lead_id).first()
                tot = q.total
                adv = Decimal(str(round(float(tot) * 0.3)))
                paid = Decimal(str(round(float(tot) * random.choice([0.3, 0.6, 1.0]))))
                bal = tot - paid

                ord_rec = models.Order(
                    order_number=f"SP-ORD-2025-{7000 + i}",
                    lead_id=q.lead_id,
                    quotation_id=q.id,
                    customer_name=ld.customer_name if ld else "Solar Customer",
                    customer_phone=ld.phone if ld else "9810010000",
                    address=ld.address if ld else "Site Address",
                    capacity_kw=q.capacity_kw,
                    system_type=q.system_type,
                    total_amount=tot,
                    advance_amount=adv,
                    paid_amount=paid,
                    balance_amount=bal,
                    status=random.choice(["CONFIRMED", "IN_PROGRESS", "COMPLETED"]),
                    payment_status="PAID" if bal <= 0 else "PARTIALLY_PAID",
                    subsidy_status="DISBURSED" if i % 2 == 0 else "SUBMITTED",
                    subsidy_amount=q.subsidy_estimate,
                    order_date=datetime.date.today() - datetime.timedelta(days=random.randint(5, 60)),
                )
                db.add(ord_rec)
                db.commit()
                db.refresh(ord_rec)
            orders.append(ord_rec)

        print(f"Total Orders in DB: {db.query(models.Order).count()}")

        # -------------------------------------------------------------
        # 7. PAYMENTS (25 Payments with Razorpay and UPI)
        # -------------------------------------------------------------
        payments_count = db.query(models.Payment).count()
        if payments_count < 25:
            methods = ["razorpay", "upi", "card", "neft", "cash"]
            for i in range(25):
                ord_rec = orders[i % len(orders)]
                method = methods[i % len(methods)]
                ref = f"pay_Rzp{random.randint(1000000, 9999999)}" if method == "razorpay" else f"UTR-{random.randint(10000000, 99999999)}"
                amt = Decimal(str(random.choice([25000, 45000, 75000, 108000, 150000])))

                p = models.Payment(
                    order_id=ord_rec.id,
                    amount=amt,
                    method=method,
                    reference=ref,
                    status="SUCCESS",
                    notes=f"Payment settlement via {method.upper()} for {ord_rec.order_number}",
                    paid_at=datetime.datetime.now() - datetime.timedelta(days=random.randint(1, 40)),
                )
                db.add(p)
            db.commit()
        print(f"Total Payments in DB: {db.query(models.Payment).count()}")

        # -------------------------------------------------------------
        # 8. DISPATCHES & INSTALLATIONS (15 Dispatches, 15 Installations)
        # -------------------------------------------------------------
        serials = db.query(models.SerialUnit).all()
        if not serials:
            inv_items = db.query(models.InventoryItem).all()
            for itm in inv_items[:5]:
                for sfx in ("001", "002", "003", "004"):
                    su = models.SerialUnit(
                        inventory_item_id=itm.id,
                        serial_number=f"{itm.sku}-{sfx}",
                        status="IN_STOCK",
                    )
                    db.add(su)
            db.commit()
            serials = db.query(models.SerialUnit).all()

        for i in range(15):
            ord_rec = orders[i % len(orders)]
            ser_unit = serials[i % len(serials)]
            # Dispatch
            disp = db.query(models.Dispatch).filter(models.Dispatch.order_id == ord_rec.id).first()
            if not disp:
                disp = models.Dispatch(
                    order_id=ord_rec.id,
                    serial_unit_id=ser_unit.id,
                    serial_number=ser_unit.serial_number,
                    status="DELIVERED",
                    receiver_name=ord_rec.customer_name,
                    receiver_phone=ord_rec.customer_phone,
                    delivery_address=ord_rec.address,
                    dispatched_at=datetime.datetime.now() - datetime.timedelta(days=random.randint(10, 30)),
                    delivery_confirmed_at=datetime.datetime.now() - datetime.timedelta(days=random.randint(1, 9)),
                    notes=f"Vehicle DL-01-AB-{1000 + i}. Unloaded at site and verified.",
                )
                db.add(disp)

            # Installation
            inst = db.query(models.Installation).filter(models.Installation.order_id == ord_rec.id).first()
            if not inst:
                inst = models.Installation(
                    order_id=ord_rec.id,
                    lead_id=ord_rec.lead_id,
                    technician_id=employees[i % len(employees)].id,
                    customer_name=ord_rec.customer_name,
                    system_kw=ord_rec.capacity_kw,
                    scheduled_date=datetime.date.today() - datetime.timedelta(days=random.randint(5, 25)),
                    progress_pct=100 if i % 3 != 0 else 75,
                    hours_logged=Decimal("18.5"),
                    verified_kw=ord_rec.capacity_kw,
                    system_tested_ok=True,
                    voc_voltage=Decimal("485.0"),
                    isc_current=Decimal("13.2"),
                    earth_resistance_ohms=Decimal("2.1"),
                    status="COMPLETED" if i % 3 != 0 else "IN_PROGRESS",
                    completion_notes="Mounting torque checked. Earthing copper bonded. Grid synchronization verified.",
                )
                db.add(inst)
        db.commit()
        print(f"Total Dispatches in DB: {db.query(models.Dispatch).count()}")
        print(f"Total Installations in DB: {db.query(models.Installation).count()}")

        # -------------------------------------------------------------
        # 9. WARRANTIES & TICKETS (15 Warranties, 15 Service Tickets)
        # -------------------------------------------------------------
        for i in range(15):
            ord_rec = orders[i % len(orders)]
            # Ensure each warranty has a distinct unused serial unit
            ser_unit = serials[i % len(serials)]
            war = db.query(models.Warranty).filter(
                (models.Warranty.order_id == ord_rec.id) | (models.Warranty.serial_unit_id == ser_unit.id)
            ).first()
            if not war:
                war = models.Warranty(
                    order_id=ord_rec.id,
                    serial_unit_id=ser_unit.id,
                    start_date=datetime.date.today() - datetime.timedelta(days=random.randint(10, 90)),
                    duration_months=300, # 25 years
                    expiry_date=datetime.date.today() + datetime.timedelta(days=9125),
                    status="ACTIVE",
                    terms="25-Year Tier-1 Mono PERC Linear Power Warranty (>=84.8% at Year 25).",
                )
                db.add(war)

            # Ticket
            tkt = db.query(models.Ticket).filter(models.Ticket.ticket_number == f"TKT-2025-{8000 + i}").first()
            if not tkt:
                tkt = models.Ticket(
                    ticket_number=f"TKT-2025-{8000 + i}",
                    lead_id=ord_rec.lead_id,
                    order_id=ord_rec.id,
                    serial_unit_id=ser_unit.id,
                    customer_name=ord_rec.customer_name,
                    subject=random.choice([
                        "Routine 6-Month AMC Health Checkup",
                        "Inverter Wifi Dongle Reconnection",
                        "Panel Dust & Soiling Cleaning Service",
                        "Net Meter Export Reading Verification"
                    ]),
                    description="Standard post-installation preventive maintenance and generation monitoring.",
                    priority=random.choice(["LOW", "MEDIUM"]),
                    status=random.choice(["RESOLVED", "CLOSED", "IN_PROGRESS"]),
                    in_warranty=True,
                    billable_amount=Decimal("0.0"),
                    assigned_to=employees[i % len(employees)].name,
                    assigned_technician_id=employees[i % len(employees)].id,
                )
                db.add(tkt)
        db.commit()
        print(f"Total Warranties in DB: {db.query(models.Warranty).count()}")
        print(f"Total Tickets in DB: {db.query(models.Ticket).count()}")

        # -------------------------------------------------------------
        # 10. EXPENSES (15 Site Project Expenses)
        # -------------------------------------------------------------
        expense_cats = ["TRANSPORT", "EQUIPMENT_RENTAL", "CIVIL_MATERIALS", "ELECTRICAL_PARTS", "LABOR"]
        for i in range(15):
            ord_rec = orders[i % len(orders)]
            cat = expense_cats[i % len(expense_cats)]
            exp = models.Expense(
                order_id=ord_rec.id,
                category=cat,
                amount=Decimal(str(random.choice([2500, 4800, 7500, 12000, 18500]))),
                note=f"Project site expense for {ord_rec.order_number} ({cat.lower()})",
                incurred_at=datetime.datetime.now() - datetime.timedelta(days=random.randint(3, 45)),
            )
            db.add(exp)
        db.commit()
        print(f"Total Expenses in DB: {db.query(models.Expense).count()}")

        print("\nALL 200+ RECORDS SUCCESSFULLY INSERTED INTO POSTGRESQL!")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_200()
