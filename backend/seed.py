from datetime import date, datetime, timedelta
from database import SessionLocal, engine, Base
from models import (
    User, CustomerLead, SiteSurvey, InventoryItem,
    BOMTemplate, BOMItem, Quotation, Order,
    SerialUnit, Installation, ServiceTicket
)

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).count() > 0:
        print("Database already seeded. Skipping.")
        db.close()
        return

    print("Seeding SunPower ERP database with realistic Indian Solar Data...")

    # 1. Users (Staff + 15 Technicians + Admin)
    admin = User(name="Vikram Malhotra", email="admin@sunpower.in", role="ADMIN", hourly_rate=600.0)
    sales = User(name="Pooja Sharma", email="sales@sunpower.in", role="SALES", hourly_rate=400.0)
    warehouse = User(name="Gaurav Singhal", email="warehouse@sunpower.in", role="WAREHOUSE", hourly_rate=350.0)
    support = User(name="Neha Kapoor", email="support@sunpower.in", role="SUPPORT", hourly_rate=350.0)
    customer_user = User(name="Arvind Sharma", email="arvind.sharma@gmail.com", role="CUSTOMER", hourly_rate=0.0)

    tech_names = [
        ("Ramesh Sharma", 380.0, "PRESENT"),
        ("Suresh Verma", 350.0, "PRESENT"),
        ("Amit Patel", 420.0, "PRESENT"),
        ("Rajesh Kumar", 360.0, "PRESENT"),
        ("Deepak Singh", 400.0, "ON_LEAVE"),
        ("Manoj Yadav", 340.0, "PRESENT"),
        ("Vikram Rathore", 450.0, "PRESENT"),
        ("Sanjay Gupta", 370.0, "PRESENT"),
        ("Pradeep Joshi", 390.0, "PRESENT"),
        ("Rahul Tiwari", 360.0, "PRESENT"),
        ("Dinesh Chandra", 350.0, "PRESENT"),
        ("Vinod Maurya", 340.0, "ABSENT"),
        ("Ashok Saini", 380.0, "PRESENT"),
        ("Harish Choudhary", 410.0, "PRESENT"),
        ("Pankaj Mishra", 390.0, "PRESENT"),
    ]
    technicians = []
    for idx, (tname, rate, att) in enumerate(tech_names):
        email = f"tech.{tname.lower().replace(' ', '.')}@sunpower.in"
        tech = User(name=tname, email=email, role="TECHNICIAN", hourly_rate=rate, attendance_status=att)
        technicians.append(tech)

    db.add_all([admin, sales, warehouse, support, customer_user] + technicians)
    db.commit()

    # 2. Inventory Items
    items = [
        # PANELS
        InventoryItem(sku="PNL-MONO-540W", name="540W Mono-PERC Half-Cut Tier-1 Solar Panel", category="PANELS", unit_cost_inr=11500.0, selling_price_inr=14800.0, stock_qty=180, reorder_threshold=30),
        InventoryItem(sku="PNL-POLY-330W", name="330W Polycrystalline Solar Panel", category="PANELS", unit_cost_inr=7200.0, selling_price_inr=9200.0, stock_qty=95, reorder_threshold=20),
        # INVERTERS
        InventoryItem(sku="INV-GT-1KW", name="1kW Single-Phase Grid-Tie String Inverter", category="INVERTERS", unit_cost_inr=14000.0, selling_price_inr=18500.0, stock_qty=18, reorder_threshold=5),
        InventoryItem(sku="INV-GT-3KW", name="3kW Smart Grid-Tie Inverter with WiFi Dongle", category="INVERTERS", unit_cost_inr=24000.0, selling_price_inr=32000.0, stock_qty=24, reorder_threshold=6),
        InventoryItem(sku="INV-GT-5KW", name="5kW High-Efficiency Dual MPPT On-Grid Inverter", category="INVERTERS", unit_cost_inr=36000.0, selling_price_inr=48000.0, stock_qty=14, reorder_threshold=5),
        InventoryItem(sku="INV-HYB-3KW", name="3kW Hybrid Off-Grid/On-Grid Solar Inverter", category="INVERTERS", unit_cost_inr=32000.0, selling_price_inr=42000.0, stock_qty=12, reorder_threshold=4),
        InventoryItem(sku="INV-HYB-5KW", name="5kW Solar Hybrid Inverter 48V Pure Sine Wave", category="INVERTERS", unit_cost_inr=48000.0, selling_price_inr=62000.0, stock_qty=8, reorder_threshold=4),
        # BATTERIES
        InventoryItem(sku="BAT-TUB-150AH", name="150Ah C10 Tall Tubular Solar Battery", category="BATTERIES", unit_cost_inr=11000.0, selling_price_inr=14500.0, stock_qty=35, reorder_threshold=10),
        InventoryItem(sku="BAT-LI-200AH", name="48V 100Ah (5kWh) Wall-Mount LiFePO4 Battery Pack", category="BATTERIES", unit_cost_inr=72000.0, selling_price_inr=95000.0, stock_qty=9, reorder_threshold=3),
        # MOUNTING STRUCTURES
        InventoryItem(sku="STR-HDG-4P", name="Hot-Dip Galvanized Elevated Structure (4 Panels)", category="MOUNTING_STRUCTURES", unit_cost_inr=4200.0, selling_price_inr=6000.0, stock_qty=60, reorder_threshold=15),
        InventoryItem(sku="STR-AL-TILT", name="Anodized Aluminum Universal Roof Rail & Clamps Kit", category="MOUNTING_STRUCTURES", unit_cost_inr=2800.0, selling_price_inr=4000.0, stock_qty=80, reorder_threshold=20),
        # WIRES & CONNECTORS
        InventoryItem(sku="CAB-DC-4MM", name="4 sq.mm UV-Resistant Dual-Insulated Copper DC Cable (100m)", category="WIRES_CONNECTORS", unit_cost_inr=3200.0, selling_price_inr=4800.0, stock_qty=40, reorder_threshold=10),
        InventoryItem(sku="CON-MC4-P10", name="IP68 Waterproof MC4 Male/Female Connector Set (10 Pairs)", category="WIRES_CONNECTORS", unit_cost_inr=650.0, selling_price_inr=1100.0, stock_qty=110, reorder_threshold=25),
        InventoryItem(sku="BOX-ACDC-SPD", name="Pre-wired ACDB + DCDB Box with Type-II Surge Protection", category="WIRES_CONNECTORS", unit_cost_inr=4800.0, selling_price_inr=6800.0, stock_qty=22, reorder_threshold=8),
        # SAFETY EQUIPMENT
        InventoryItem(sku="SAF-EARTH-2M", name="2 Meter Copper-Bonded Chemical Earthing Electrode Kit", category="SAFETY_EQUIPMENT", unit_cost_inr=2600.0, selling_price_inr=3900.0, stock_qty=45, reorder_threshold=12),
        InventoryItem(sku="SAF-LA-COPPER", name="Pure Copper Lightning Arrestor Spike with Base & Counter", category="SAFETY_EQUIPMENT", unit_cost_inr=3400.0, selling_price_inr=5200.0, stock_qty=30, reorder_threshold=10),
    ]
    db.add_all(items)
    db.commit()

    # Re-query inventory for IDs
    inv_map = {item.sku: item for item in db.query(InventoryItem).all()}

    # 3. BOM Templates (1kW to 5kW On-Grid and Off-Grid)
    # We will build BOM templates for 1kW, 2kW, 3kW, 4kW, 5kW for ON_GRID and OFF_GRID
    bom_configs = [
        # On-Grid
        (1.0, "ON_GRID", 12000.0, "1 kW Rooftop On-Grid Solar Package", [
            ("PNL-MONO-540W", 2),
            ("INV-GT-1KW", 1),
            ("STR-HDG-4P", 1),
            ("CAB-DC-4MM", 1),
            ("CON-MC4-P10", 1),
            ("BOX-ACDC-SPD", 1),
            ("SAF-EARTH-2M", 1),
            ("SAF-LA-COPPER", 1),
        ]),
        (2.0, "ON_GRID", 15000.0, "2 kW Rooftop On-Grid Solar Package", [
            ("PNL-MONO-540W", 4),
            ("INV-GT-3KW", 1),
            ("STR-HDG-4P", 1),
            ("CAB-DC-4MM", 1),
            ("CON-MC4-P10", 2),
            ("BOX-ACDC-SPD", 1),
            ("SAF-EARTH-2M", 2),
            ("SAF-LA-COPPER", 1),
        ]),
        (3.0, "ON_GRID", 18000.0, "3 kW Rooftop On-Grid Solar Package (PM Surya Ghar Subsidy Eligible)", [
            ("PNL-MONO-540W", 6),
            ("INV-GT-3KW", 1),
            ("STR-HDG-4P", 2),
            ("CAB-DC-4MM", 1),
            ("CON-MC4-P10", 2),
            ("BOX-ACDC-SPD", 1),
            ("SAF-EARTH-2M", 2),
            ("SAF-LA-COPPER", 1),
        ]),
        (4.0, "ON_GRID", 22000.0, "4 kW Rooftop On-Grid Solar Package", [
            ("PNL-MONO-540W", 8),
            ("INV-GT-5KW", 1),
            ("STR-HDG-4P", 2),
            ("CAB-DC-4MM", 2),
            ("CON-MC4-P10", 3),
            ("BOX-ACDC-SPD", 1),
            ("SAF-EARTH-2M", 2),
            ("SAF-LA-COPPER", 1),
        ]),
        (5.0, "ON_GRID", 26000.0, "5 kW High Capacity On-Grid Solar Package", [
            ("PNL-MONO-540W", 10),
            ("INV-GT-5KW", 1),
            ("STR-HDG-4P", 3),
            ("CAB-DC-4MM", 2),
            ("CON-MC4-P10", 3),
            ("BOX-ACDC-SPD", 1),
            ("SAF-EARTH-2M", 3),
            ("SAF-LA-COPPER", 1),
        ]),
        # Off-Grid (includes batteries & hybrid inverters)
        (1.0, "OFF_GRID", 16000.0, "1 kW Off-Grid Solar Package with Battery Backup", [
            ("PNL-MONO-540W", 2),
            ("INV-HYB-3KW", 1),
            ("BAT-TUB-150AH", 1),
            ("STR-HDG-4P", 1),
            ("CAB-DC-4MM", 1),
            ("CON-MC4-P10", 1),
            ("BOX-ACDC-SPD", 1),
            ("SAF-EARTH-2M", 1),
            ("SAF-LA-COPPER", 1),
        ]),
        (2.0, "OFF_GRID", 19000.0, "2 kW Off-Grid Solar Package with Dual Battery Storage", [
            ("PNL-MONO-540W", 4),
            ("INV-HYB-3KW", 1),
            ("BAT-TUB-150AH", 2),
            ("STR-HDG-4P", 1),
            ("CAB-DC-4MM", 1),
            ("CON-MC4-P10", 2),
            ("BOX-ACDC-SPD", 1),
            ("SAF-EARTH-2M", 2),
            ("SAF-LA-COPPER", 1),
        ]),
        (3.0, "OFF_GRID", 23000.0, "3 kW Off-Grid Solar Package with 4-Battery Storage", [
            ("PNL-MONO-540W", 6),
            ("INV-HYB-3KW", 1),
            ("BAT-TUB-150AH", 4),
            ("STR-HDG-4P", 2),
            ("CAB-DC-4MM", 1),
            ("CON-MC4-P10", 2),
            ("BOX-ACDC-SPD", 1),
            ("SAF-EARTH-2M", 2),
            ("SAF-LA-COPPER", 1),
        ]),
        (4.0, "OFF_GRID", 27000.0, "4 kW Off-Grid Solar Package with Lithium Storage", [
            ("PNL-MONO-540W", 8),
            ("INV-HYB-5KW", 1),
            ("BAT-LI-200AH", 1),
            ("STR-HDG-4P", 2),
            ("CAB-DC-4MM", 2),
            ("CON-MC4-P10", 3),
            ("BOX-ACDC-SPD", 1),
            ("SAF-EARTH-2M", 2),
            ("SAF-LA-COPPER", 1),
        ]),
        (5.0, "OFF_GRID", 32000.0, "5 kW Heavy Duty Off-Grid Solar Package with Lithium Storage", [
            ("PNL-MONO-540W", 10),
            ("INV-HYB-5KW", 1),
            ("BAT-LI-200AH", 1),
            ("BAT-TUB-150AH", 2),
            ("STR-HDG-4P", 3),
            ("CAB-DC-4MM", 2),
            ("CON-MC4-P10", 3),
            ("BOX-ACDC-SPD", 1),
            ("SAF-EARTH-2M", 3),
            ("SAF-LA-COPPER", 1),
        ]),
    ]

    for cap, stype, install_chg, desc, bom_list in bom_configs:
        template = BOMTemplate(capacity_kw=cap, system_type=stype, installation_charge_inr=install_chg, description=desc)
        db.add(template)
        db.flush()
        for sku, qty in bom_list:
            item = inv_map.get(sku)
            if item:
                db.add(BOMItem(template_id=template.id, inventory_item_id=item.id, quantity=qty))
    db.commit()

    # 4. Realistic Projects at Different Lifecycle Stages
    today = date.today()

    # --- PROJECT 1: COMPLETED 18 MONTHS AGO (Live Warranty Triage Test Ready) ---
    past_date = today - timedelta(days=540) # 18 months ago
    lead1 = CustomerLead(
        customer_name="Arvind Sharma",
        phone="+91 98101 23456",
        email="arvind.sharma@gmail.com",
        address="B-42, Sector 15, Noida, Uttar Pradesh 201301",
        capacity_kw=3.0,
        system_type="ON_GRID",
        subsidy_requested=True,
        monthly_bill_inr=4200.0,
        grid_suitable=True,
        pipeline_stage="INSTALLED",
        follow_up_notes="Completed rooftop installation under PM Surya Ghar. Very satisfied customer.",
        created_at=datetime.combine(past_date - timedelta(days=20), datetime.min.time())
    )
    db.add(lead1)
    db.flush()

    survey1 = SiteSurvey(
        lead_id=lead1.id,
        technician_id=technicians[0].id,
        scheduled_date=past_date - timedelta(days=15),
        roof_direction="South-West (210° Azimuth)",
        tilt_angle_deg=22.5,
        shadow_free_area_sqft=380.0,
        cable_distance_m=20.0,
        is_approved=True,
        notes="RCC Flat terrace, unshaded South exposure, excellent structural stability."
    )
    db.add(survey1)
    db.flush()

    quote1 = Quotation(
        lead_id=lead1.id,
        survey_id=survey1.id,
        capacity_kw=3.0,
        system_type="ON_GRID",
        hardware_total_inr=146000.0,
        installation_charge_inr=18000.0,
        subsidy_discount_inr=78000.0,
        grand_total_inr=86000.0,
        status="APPROVED_BY_CUSTOMER"
    )
    db.add(quote1)
    db.flush()

    order1 = Order(
        quotation_id=quote1.id,
        lead_id=lead1.id,
        total_amount_inr=86000.0,
        advance_paid_inr=86000.0,
        balance_due_inr=0.0,
        payment_status="FULLY_PAID",
        subsidy_tracking_status="DISBURSED",
        bom_deducted=True
    )
    db.add(order1)
    db.flush()

    # Serials for Project 1:
    # 1. Inverter with 2-year warranty (Started 18 months ago -> Expires in 6 months -> IN WARRANTY!)
    inv_item_3k = inv_map["INV-GT-3KW"]
    serial_inv1 = SerialUnit(
        serial_number="INV-2025-0518",
        order_id=order1.id,
        lead_id=lead1.id,
        inventory_item_id=inv_item_3k.id,
        component_type="INVERTER",
        packed_status=True,
        dispatched_at=datetime.combine(past_date - timedelta(days=5), datetime.min.time()),
        delivery_confirmed=True,
        warranty_years=2,
        warranty_start_date=past_date,
        warranty_expiry_date=past_date + timedelta(days=365*2) # Active: expires in ~6 months
    )
    # 2. Panels with 20-year warranty (Active until 2045)
    pnl_item = inv_map["PNL-MONO-540W"]
    serial_pnl1 = SerialUnit(
        serial_number="PNL-2025-0911",
        order_id=order1.id,
        lead_id=lead1.id,
        inventory_item_id=pnl_item.id,
        component_type="PANEL",
        packed_status=True,
        dispatched_at=datetime.combine(past_date - timedelta(days=5), datetime.min.time()),
        delivery_confirmed=True,
        warranty_years=20,
        warranty_start_date=past_date,
        warranty_expiry_date=past_date + timedelta(days=365*20)
    )
    # 3. Old Battery unit with 2-year warranty that EXPIRED 10 months ago (for testing expired warranty triage!)
    bat_item = inv_map["BAT-TUB-150AH"]
    serial_bat_exp = SerialUnit(
        serial_number="BAT-2023-0104",
        order_id=order1.id,
        lead_id=lead1.id,
        inventory_item_id=bat_item.id,
        component_type="BATTERY",
        packed_status=True,
        dispatched_at=datetime.combine(past_date - timedelta(days=400), datetime.min.time()),
        delivery_confirmed=True,
        warranty_years=2,
        warranty_start_date=past_date - timedelta(days=400),
        warranty_expiry_date=past_date - timedelta(days=400) + timedelta(days=730) # Expired ~300 days ago
    )
    db.add_all([serial_inv1, serial_pnl1, serial_bat_exp])
    db.flush()

    install1 = Installation(
        order_id=order1.id,
        technician_id=technicians[0].id,
        scheduled_date=past_date,
        start_time="08:30 AM",
        end_time="04:30 PM",
        hours_logged=8.0,
        progress_pct=100,
        verified_kw=3.12,
        system_tested_ok=True,
        install_photo_url="/photos/install_arvind_sharma.jpg",
        customer_signature_base64="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        is_completed=True,
        completion_notes="Earthing resistance tested < 2 Ohms. Grid sync verified smoothly at 230V."
    )
    db.add(install1)
    db.flush()

    # Pre-existing solved ticket for Arvind Sharma
    ticket1 = ServiceTicket(
        lead_id=lead1.id,
        serial_number="INV-2025-0518",
        fault_code="E04-GRID-LOSS",
        issue_description="Inverter stopped feeding power during brief voltage fluctuation.",
        is_under_warranty=True,
        assigned_technician_id=technicians[1].id,
        resolution_type="REPAIR",
        parts_cost_inr=0.0,
        labor_cost_inr=0.0,
        billed_invoice_amount_inr=0.0,
        status="RESOLVED_CONFIRMED"
    )
    db.add(ticket1)

    # --- PROJECT 2: IN INSTALLATION PROGRESS (Active Field Crew) ---
    lead2 = CustomerLead(
        customer_name="Sunita Rao",
        phone="+91 98202 88776",
        email="sunita.rao@outlook.com",
        address="Villa 14, Palm Meadows, Whitefield, Bengaluru, Karnataka 560066",
        capacity_kw=5.0,
        system_type="ON_GRID",
        subsidy_requested=True,
        monthly_bill_inr=7800.0,
        grid_suitable=True,
        pipeline_stage="WON",
        follow_up_notes="5 kW system confirmed. Customer paid 50% advance. Materials dispatched."
    )
    db.add(lead2)
    db.flush()

    survey2 = SiteSurvey(
        lead_id=lead2.id,
        technician_id=technicians[2].id,
        scheduled_date=today - timedelta(days=7),
        roof_direction="South (180° Azimuth)",
        tilt_angle_deg=18.0,
        shadow_free_area_sqft=650.0,
        cable_distance_m=32.0,
        is_approved=True,
        notes="High-elevation roof. Minimal shadows. Good mounting anchor points."
    )
    db.add(survey2)
    db.flush()

    quote2 = Quotation(
        lead_id=lead2.id,
        survey_id=survey2.id,
        capacity_kw=5.0,
        system_type="ON_GRID",
        hardware_total_inr=242000.0,
        installation_charge_inr=26000.0,
        subsidy_discount_inr=78000.0,
        grand_total_inr=190000.0,
        status="APPROVED_BY_CUSTOMER"
    )
    db.add(quote2)
    db.flush()

    order2 = Order(
        quotation_id=quote2.id,
        lead_id=lead2.id,
        total_amount_inr=190000.0,
        advance_paid_inr=100000.0,
        balance_due_inr=90000.0,
        payment_status="ADVANCE_PAID",
        subsidy_tracking_status="APPLIED",
        bom_deducted=True
    )
    db.add(order2)
    db.flush()

    serial_inv2 = SerialUnit(
        serial_number="INV-2026-9021",
        order_id=order2.id,
        lead_id=lead2.id,
        inventory_item_id=inv_map["INV-GT-5KW"].id,
        component_type="INVERTER",
        packed_status=True,
        dispatched_at=datetime.utcnow() - timedelta(days=2),
        delivery_confirmed=True,
        warranty_years=2,
        warranty_start_date=today,
        warranty_expiry_date=today + timedelta(days=730)
    )
    db.add(serial_inv2)
    db.flush()

    install2 = Installation(
        order_id=order2.id,
        technician_id=technicians[2].id,
        scheduled_date=today,
        start_time="09:00 AM",
        end_time="Pending",
        hours_logged=5.0,
        progress_pct=60,
        verified_kw=0.0,
        system_tested_ok=False,
        is_completed=False,
        completion_notes="Mounting structure erected. 10 panels mounted. Inverter wiring in progress."
    )
    db.add(install2)

    # --- PROJECT 3: NEW LEAD / SURVEY SCHEDULED (Sales Pipeline) ---
    lead3 = CustomerLead(
        customer_name="Rajesh Mehta",
        phone="+91 97114 55667",
        email="rajesh.mehta@gmail.com",
        address="House 88, Model Town, Jalandhar, Punjab 144003",
        capacity_kw=3.0,
        system_type="ON_GRID",
        subsidy_requested=True,
        monthly_bill_inr=3900.0,
        grid_suitable=True,
        pipeline_stage="SURVEY_SCHEDULED",
        follow_up_notes="Requested roof survey for 3kW On-Grid system. Survey scheduled for today."
    )
    db.add(lead3)
    db.flush()

    survey3 = SiteSurvey(
        lead_id=lead3.id,
        technician_id=technicians[3].id,
        scheduled_date=today,
        roof_direction="South (180° Azimuth)",
        tilt_angle_deg=24.0,
        shadow_free_area_sqft=340.0,
        cable_distance_m=18.0,
        is_approved=False, # Survey awaiting technician approval!
        notes="Preliminary check shows good sun access. Water tank may cast minor 4 PM shadow."
    )
    db.add(survey3)

    # Additional leads in pipeline for rich CRM demo
    lead4 = CustomerLead(
        customer_name="Anil Kapoor",
        phone="+91 98765 43210",
        email="anil.kapoor@yahoo.co.in",
        address="102, Green Avenue, Ludhiana, Punjab 141001",
        capacity_kw=4.0,
        system_type="OFF_GRID",
        subsidy_requested=False,
        monthly_bill_inr=6200.0,
        grid_suitable=False,
        pipeline_stage="NEW",
        follow_up_notes="Remote farmhouse with frequent power cuts. Requires 4kW Off-Grid battery package."
    )
    lead5 = CustomerLead(
        customer_name="Meenakshi Sundaram",
        phone="+91 94440 12345",
        email="m.sundaram@chennaisolar.com",
        address="Flat 4B, Coastal Towers, ECR Road, Chennai, Tamil Nadu 600041",
        capacity_kw=2.0,
        system_type="ON_GRID",
        subsidy_requested=True,
        monthly_bill_inr=2400.0,
        grid_suitable=True,
        pipeline_stage="FOLLOW_UP",
        follow_up_notes="Discussed terrace space availability with apartment association. Follow-up on Monday."
    )
    db.add_all([lead4, lead5])

    db.commit()
    db.close()
    print("Database successfully seeded with realistic Indian Solar ERP records!")

if __name__ == "__main__":
    seed_database()
