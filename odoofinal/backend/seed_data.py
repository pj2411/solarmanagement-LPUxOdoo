import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.inventory import Product, ProductCategory, Warehouse
from app.models.maintenance import FaultCodeDictionary, TicketPriority
from app.models.user import User, UserRole


async def seed():
    print("Seeding initial data...")
    async with AsyncSessionLocal() as session:
        # 1. Seed Super Admin
        admin_query = select(User).where(User.email == "admin@sims.com")
        admin_res = await session.execute(admin_query)
        if not admin_res.scalar_one_or_none():
            admin = User(
                email="admin@sims.com",
                phone="9876543210",
                full_name="Super Administrator",
                hashed_password=get_password_hash("Admin@12345"),
                role=UserRole.SUPER_ADMIN,
                is_active=True,
                is_verified=True,
            )
            session.add(admin)
            print("Created Super Admin: admin@sims.com / Admin@12345")

        # 2. Seed Sales Executive
        sales_query = select(User).where(User.email == "sales@sims.com")
        sales_res = await session.execute(sales_query)
        if not sales_res.scalar_one_or_none():
            sales = User(
                email="sales@sims.com",
                phone="9876543211",
                full_name="Priyanshu Raj (Sales)",
                hashed_password=get_password_hash("Sales@12345"),
                role=UserRole.SALES_EXEC,
                is_active=True,
                is_verified=True,
            )
            session.add(sales)
            print("Created Sales Exec: sales@sims.com / Sales@12345")

        # 3. Seed Field Technician
        tech_query = select(User).where(User.email == "tech@sims.com")
        tech_res = await session.execute(tech_query)
        if not tech_res.scalar_one_or_none():
            tech = User(
                email="tech@sims.com",
                phone="9876543212",
                full_name="Ramesh Kumar (Lead Tech)",
                hashed_password=get_password_hash("Tech@12345"),
                role=UserRole.INSTALL_TECH,
                is_active=True,
                is_verified=True,
            )
            session.add(tech)
            print("Created Technician: tech@sims.com / Tech@12345")

        # 4. Seed Warehouse
        wh_query = select(Warehouse).where(Warehouse.code == "WH-DEL-01")
        wh_res = await session.execute(wh_query)
        if not wh_res.scalar_one_or_none():
            wh = Warehouse(
                name="Delhi Central Warehouse",
                code="WH-DEL-01",
                address="Plot 45, Okhla Industrial Area Phase III",
                city="New Delhi",
                is_active=True,
            )
            session.add(wh)
            print("Created Warehouse: WH-DEL-01")

        # 5. Seed Core Products (Panels, Inverters)
        p1_query = select(Product).where(Product.sku == "PNL-550W")
        p1_res = await session.execute(p1_query)
        if not p1_res.scalar_one_or_none():
            panel = Product(
                sku="PNL-550W",
                name="550W Mono PERC Half-Cut Bifacial Solar Module",
                category=ProductCategory.PANEL,
                manufacturer="Tata Power Solar",
                model_number="TP-550M",
                wattage_or_rating="550W",
                unit_of_measure="nos",
                unit_cost=10500.0,
                selling_price=12500.0,
                min_threshold_alert=20,
                is_serialized=True,
                specifications={"efficiency": "21.4%", "voc": 49.8, "isc": 13.9},
            )
            session.add(panel)

        inv_query = select(Product).where(Product.sku == "INV-3KW-ONGRID")
        inv_res = await session.execute(inv_query)
        if not inv_res.scalar_one_or_none():
            inverter = Product(
                sku="INV-3KW-ONGRID",
                name="3kW Single Phase Dual MPPT On-Grid Solar Inverter",
                category=ProductCategory.INVERTER,
                manufacturer="Havells / Growatt",
                model_number="GW-3000-S",
                wattage_or_rating="3kW",
                unit_of_measure="nos",
                unit_cost=24000.0,
                selling_price=28000.0,
                min_threshold_alert=5,
                is_serialized=True,
                specifications={"mppt_channels": 2, "max_efficiency": "97.6%"},
            )
            session.add(inverter)

        # 6. Seed Inverter Fault Codes
        fault_query = select(FaultCodeDictionary).where(FaultCodeDictionary.fault_code == "ERR-F04")
        fault_res = await session.execute(fault_query)
        if not fault_res.scalar_one_or_none():
            f1 = FaultCodeDictionary(
                fault_code="ERR-F04",
                inverter_brand="Generic Growatt/Havells",
                title="Grid Overvoltage / Frequency Out of Range",
                description="Grid AC voltage exceeded permissible utility tolerance (> 253V).",
                recommended_actions="Check AC distribution board breaker, verify grid transformer tap settings with DISCOM.",
                severity=TicketPriority.HIGH,
            )
            f2 = FaultCodeDictionary(
                fault_code="ERR-F12",
                inverter_brand="Generic Growatt/Havells",
                title="PV Array Insulation Resistance Low (Ground Fault)",
                description="DC wiring isolation fault; moisture ingress or damaged DC cable sheath.",
                recommended_actions="Inspect MC4 connectors on roof, test Megger insulation resistance across DC+ and DC- to Earth.",
                severity=TicketPriority.CRITICAL,
            )
            session.add_all([f1, f2])

        await session.commit()
    print("SUCCESS: Seed completed!")


if __name__ == "__main__":
    asyncio.run(seed())
