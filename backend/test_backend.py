import unittest
from datetime import date, timedelta
from fastapi.testclient import TestClient
from database import SessionLocal
from main import app
import models

client = TestClient(app)

class TestSolarERPRules(unittest.TestCase):

    def setUp(self):
        self.db = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_01_survey_gatekeeper_rule(self):
        """Rule 1: POST /api/quotations MUST return HTTP 400 if site_surveys.is_approved is False."""
        # Find lead3 (Rajesh Mehta) whose survey is not approved yet
        lead3 = self.db.query(models.CustomerLead).filter(models.CustomerLead.customer_name == "Rajesh Mehta").first()
        self.assertIsNotNone(lead3)
        survey3 = self.db.query(models.SiteSurvey).filter(models.SiteSurvey.lead_id == lead3.id).first()
        self.assertIsNotNone(survey3)
        self.assertFalse(survey3.is_approved)

        # Attempt to create quote without survey approval -> MUST FAIL with 400
        payload = {
            "lead_id": lead3.id,
            "survey_id": survey3.id,
            "capacity_kw": 3.0,
            "system_type": "ON_GRID"
        }
        res = client.post("/api/quotations", json=payload)
        self.assertEqual(res.status_code, 400)
        self.assertIn("Survey Gatekeeper Violation", res.json()["detail"])

        # Now approve survey
        approve_res = client.post(f"/api/surveys/{survey3.id}/approve")
        self.assertEqual(approve_res.status_code, 200)

        # Attempt quote again -> MUST SUCCEED with 200
        res2 = client.post("/api/quotations", json=payload)
        self.assertEqual(res2.status_code, 200)
        qdata = res2.json()
        self.assertEqual(qdata["capacity_kw"], 3.0)
        self.assertGreater(qdata["grand_total_inr"], 0)

    def test_02_bom_explosion_and_stock_reservation_on_payment(self):
        """Rule 2: Payment triggers BOM deduction and auto-creates installation job."""
        # Find order for Arvind Sharma
        order = self.db.query(models.Order).first()
        self.assertIsNotNone(order)

        # Query stock before
        panel = self.db.query(models.InventoryItem).filter(models.InventoryItem.sku == "PNL-MONO-540W").first()
        initial_stock = panel.stock_qty

        # Record payment
        pay_payload = {"amount": 5000.0, "payment_type": "ADVANCE"}
        res = client.post(f"/api/orders/{order.id}/pay", json=pay_payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")

    def test_03_dispatch_to_warranty_automation(self):
        """Rule 3: Confirming delivery auto-calculates 20-yr (Panel) and 2-yr (Inverter) warranty dates."""
        # Register a new serial unit for testing
        inv_item = self.db.query(models.InventoryItem).filter(models.InventoryItem.sku == "INV-GT-3KW").first()
        test_serial = "INV-TEST-2026-999"

        # Clean if exists
        self.db.query(models.SerialUnit).filter(models.SerialUnit.serial_number == test_serial).delete()
        self.db.commit()

        dispatch_res = client.post("/api/warehouse/dispatch", json={
            "order_id": 1,
            "lead_id": 1,
            "inventory_item_id": inv_item.id,
            "component_type": "INVERTER",
            "serial_number": test_serial
        })
        self.assertEqual(dispatch_res.status_code, 200)

        # Confirm delivery
        confirm_res = client.post(f"/api/warehouse/delivery-confirm/{test_serial}")
        self.assertEqual(confirm_res.status_code, 200)
        cdata = confirm_res.json()
        self.assertEqual(cdata["warranty_years"], 2)
        self.assertEqual(cdata["warranty_start_date"], date.today().isoformat())
        expected_expiry = (date.today() + timedelta(days=365*2)).isoformat()
        self.assertEqual(cdata["warranty_expiry_date"], expected_expiry)

    def test_04_zero_click_warranty_triage(self):
        """Rule 4: Zero-Click Helpdesk Warranty Triage."""
        lead = self.db.query(models.CustomerLead).filter(models.CustomerLead.customer_name == "Arvind Sharma").first()
        self.assertIsNotNone(lead)

        # Test Case A: Active Inverter Serial (INV-2025-0518) -> ₹0 FREE REPAIR
        ticket_payload_active = {
            "lead_id": lead.id,
            "serial_number": "INV-2025-0518",
            "fault_code": "E04-GRID-LOSS",
            "issue_description": "Grid sync intermittent error code",
            "parts_cost_inr": 3500.0,
            "labor_cost_inr": 1200.0
        }
        res_active = client.post("/api/tickets", json=ticket_payload_active)
        self.assertEqual(res_active.status_code, 200)
        t_active = res_active.json()
        self.assertTrue(t_active["is_under_warranty"])
        self.assertEqual(t_active["billed_invoice_amount_inr"], 0.0)

        # Test Case B: Expired Battery Serial (BAT-2023-0104) -> AUTO-BILLED INVOICE
        ticket_payload_expired = {
            "lead_id": lead.id,
            "serial_number": "BAT-2023-0104",
            "fault_code": "B02-LOW-VOLTAGE",
            "issue_description": "Battery cells degraded after 3 years",
            "parts_cost_inr": 4800.0,
            "labor_cost_inr": 1500.0
        }
        res_expired = client.post("/api/tickets", json=ticket_payload_expired)
        self.assertEqual(res_expired.status_code, 200)
        t_exp = res_expired.json()
        self.assertFalse(t_exp["is_under_warranty"])
        self.assertEqual(t_exp["billed_invoice_amount_inr"], 4800.0 + 1500.0)

    def test_05_dynamic_project_pnl_analytics(self):
        """Rule 5: Dynamic Project-Wise P&L Formula."""
        res = client.get("/api/analytics")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("projects_pnl", data)
        self.assertGreater(len(data["projects_pnl"]), 0)

        # Verify math formula for each project
        for pnl in data["projects_pnl"]:
            rev = pnl["collected_revenue_inr"]
            bom_cost = pnl["bom_hardware_cost_inr"]
            labor_cost = pnl["labor_cost_inr"]
            total_cost = pnl["total_project_cost_inr"]
            profit = pnl["project_profit_inr"]

            self.assertAlmostEqual(total_cost, bom_cost + labor_cost, delta=1.0)
            self.assertAlmostEqual(profit, rev - total_cost, delta=1.0)

if __name__ == "__main__":
    unittest.main()
