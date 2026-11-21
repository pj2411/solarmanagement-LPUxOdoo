import math
import uuid
from typing import Any, Dict, List, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import NotFoundException
from app.models.lead import Lead, LeadStatus
from app.models.quotation import Quotation, QuotationStatus, SystemTopology
from app.schemas.quotation import QuotationGenerateRequest
from app.services.calculator_service import CalculatorService


class QuotationService:
    """Dynamic Bill of Materials (BOM) & Quotation Calculation Engine (Module 05)."""

    # Component base cost benchmarks (INR)
    PANEL_550W_COST = 11500.0        # Tier-1 Mono PERC 550W
    INVERTER_COST_PER_KW = 9000.0    # Grid-tied MPPT String Inverter
    STRUCTURE_KIT_PER_PANEL = 1200.0 # Aluminum rails + mid/end clamps
    DC_CABLE_PER_METER = 75.0        # 4 sq.mm Solar DC cable
    AC_CABLE_PER_METER = 85.0        # 4 sq.mm AC cable
    BOS_KIT_COST = 8500.0            # DCDB, ACDB, MC4 connectors, conduit
    EARTHING_KIT_COST = 6500.0       # 2 Earth pits + Lightning Arrester
    INSTALLATION_PER_KW = 4500.0     # Labor, civil mounting, testing

    @classmethod
    def generate_bom(
        cls, capacity_kw: float, topology: SystemTopology, panel_wattage: int = 550
    ) -> Tuple[List[Dict[str, Any]], float]:
        """Explodes dynamic Bill of Materials lines based on capacity and topology."""
        bom_items = []

        # 1. Solar Modules
        num_panels = math.ceil((capacity_kw * 1000) / panel_wattage)
        panel_total = num_panels * cls.PANEL_550W_COST
        bom_items.append({
            "sku": f"PNL-{panel_wattage}W",
            "name": f"Tier-1 Mono PERC Solar Panel {panel_wattage}W",
            "category": "panel",
            "quantity": num_panels,
            "unit_price": cls.PANEL_550W_COST,
            "total_price": panel_total,
            "warranty_years": 25,
        })

        # 2. Inverter
        inverter_price = capacity_kw * cls.INVERTER_COST_PER_KW
        bom_items.append({
            "sku": f"INV-{int(capacity_kw)}KW-{topology.value.upper()}",
            "name": f"Smart MPPT Solar Inverter {capacity_kw}kW ({topology.value.replace('_', ' ').title()})",
            "category": "inverter",
            "quantity": 1,
            "unit_price": inverter_price,
            "total_price": inverter_price,
            "warranty_years": 8,
        })

        # 3. Mounting Structure
        structure_total = num_panels * cls.STRUCTURE_KIT_PER_PANEL
        bom_items.append({
            "sku": "STR-ALUM-RAIL",
            "name": "High-Grade Anodized Aluminum Mounting Structure Kit",
            "category": "structure",
            "quantity": num_panels,
            "unit_price": cls.STRUCTURE_KIT_PER_PANEL,
            "total_price": structure_total,
            "warranty_years": 10,
        })

        # 4. Cables (DC & AC)
        dc_meters = int(capacity_kw * 12)
        ac_meters = int(capacity_kw * 8)
        bom_items.append({
            "sku": "CBL-DC-4SQMM",
            "name": "4 sq.mm UV-Resistant Dual-Core DC Solar Cable",
            "category": "cable",
            "quantity": dc_meters,
            "unit_price": cls.DC_CABLE_PER_METER,
            "total_price": dc_meters * cls.DC_CABLE_PER_METER,
            "warranty_years": 5,
        })
        bom_items.append({
            "sku": "CBL-AC-4SQMM",
            "name": "4 sq.mm 3-Core Heavy Duty AC Copper Cable",
            "category": "cable",
            "quantity": ac_meters,
            "unit_price": cls.AC_CABLE_PER_METER,
            "total_price": ac_meters * cls.AC_CABLE_PER_METER,
            "warranty_years": 5,
        })

        # 5. Electrical BOS (DCDB / ACDB / MC4)
        bom_items.append({
            "sku": "BOS-DB-COMBO",
            "name": "Pre-wired DCDB & ACDB with Surge Protection (SPD) & MCBs",
            "category": "bos",
            "quantity": 1,
            "unit_price": cls.BOS_KIT_COST,
            "total_price": cls.BOS_KIT_COST,
            "warranty_years": 5,
        })

        # 6. Earthing & Lightning Protection
        bom_items.append({
            "sku": "EARTH-LA-KIT",
            "name": "Chemical Earthing Electrodes (2 pits) + Copper Lightning Arrester",
            "category": "bos",
            "quantity": 1,
            "unit_price": cls.EARTHING_KIT_COST,
            "total_price": cls.EARTHING_KIT_COST,
            "warranty_years": 5,
        })

        # 7. Professional Installation & Commissioning
        install_total = capacity_kw * cls.INSTALLATION_PER_KW
        bom_items.append({
            "sku": "SRV-INSTALL",
            "name": "Civil Anchoring, Electrical Cabling, Testing & Grid Sync",
            "category": "service",
            "quantity": 1,
            "unit_price": install_total,
            "total_price": install_total,
            "warranty_years": 1,
        })

        gross_component_total = sum(item["total_price"] for item in bom_items)
        return bom_items, gross_component_total

    @classmethod
    async def create_quotation(
        cls, db: AsyncSession, request: QuotationGenerateRequest
    ) -> Quotation:
        # Verify lead exists
        lead_query = select(Lead).where(Lead.id == request.lead_id)
        lead_result = await db.execute(lead_query)
        lead = lead_result.scalar_one_or_none()
        if not lead:
            raise NotFoundException("Lead", request.lead_id)

        bom_items, gross_amount = cls.generate_bom(
            capacity_kw=request.system_capacity_kw,
            topology=request.topology,
            panel_wattage=request.panel_wattage,
        )

        subsidy = CalculatorService.calculate_central_subsidy(request.system_capacity_kw)
        discount = request.discount_amount
        taxable_value = max(0.0, gross_amount - discount)
        tax_amount = round(taxable_value * 0.138, 2)  # Blended GST rate (~13.8%)
        net_payable = max(0.0, (gross_amount + tax_amount) - (subsidy + discount))

        quote_count_query = select(Quotation)
        quote_count_result = await db.execute(quote_count_query)
        count = len(quote_count_result.scalars().all()) + 1
        quote_number = f"QTN-SIMS-{count:05d}"

        quotation = Quotation(
            lead_id=lead.id,
            customer_id=lead.customer_id,
            quote_number=quote_number,
            version=1,
            system_capacity_kw=request.system_capacity_kw,
            topology=request.topology,
            gross_amount=round(gross_amount, 2),
            subsidy_amount=round(subsidy, 2),
            discount_amount=round(discount, 2),
            tax_amount=round(tax_amount, 2),
            net_payable_amount=round(net_payable, 2),
            bom_snapshot=bom_items,
            status=QuotationStatus.DRAFT,
        )

        db.add(quotation)
        lead.status = LeadStatus.QUOTED
        await db.commit()
        await db.refresh(quotation)
        return quotation
