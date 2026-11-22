"""Auto-BOM engine tests (Module 05)."""
from app.models.quotation import SystemTopology
from app.services.quotation_service import QuotationService


def test_bom_contains_core_components():
    bom, gross = QuotationService.generate_bom(3.0, SystemTopology.ON_GRID)
    skus = {line["sku"] for line in bom}
    assert any(s.startswith("PNL-") for s in skus)
    assert any(s.startswith("INV-") for s in skus)
    assert "STR-ALUM-RAIL" in skus
    assert gross > 0


def test_panel_count_scales_with_capacity():
    bom3, _ = QuotationService.generate_bom(3.0, SystemTopology.ON_GRID)
    bom5, _ = QuotationService.generate_bom(5.0, SystemTopology.ON_GRID)
    panels3 = next(l["quantity"] for l in bom3 if l["category"] == "panel")
    panels5 = next(l["quantity"] for l in bom5 if l["category"] == "panel")
    assert panels5 > panels3


def test_warranty_years_follow_ps_rules():
    bom, _ = QuotationService.generate_bom(3.0, SystemTopology.ON_GRID)
    panel = next(l for l in bom if l["category"] == "panel")
    inverter = next(l for l in bom if l["category"] == "inverter")
    assert panel["warranty_years"] == 20
    assert inverter["warranty_years"] == 2
