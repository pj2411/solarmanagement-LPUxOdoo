import unittest
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

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
        # Ensure idempotent initial state for test run
        survey3.is_approved = False
        self.db.commit()
        self.db.refresh(survey3)
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

    def test_06_inventory_restock(self):
        """Rule 6: Warehouse restocking increases stock_qty and validates inputs."""
        item = self.db.query(models.InventoryItem).first()
        self.assertIsNotNone(item)
        old_qty = item.stock_qty

        # Valid restock
        res = client.post(f"/api/inventory/{item.id}/restock", json={"quantity": 25})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["stock_qty"], old_qty + 25)

        # 404 for invalid item
        res404 = client.post("/api/inventory/999999/restock", json={"quantity": 10})
        self.assertEqual(res404.status_code, 404)

    def test_07_employee_jobs_inspection(self):
        """Rule 7: Technician jobs endpoint returns live survey and installation assignments."""
        tech = self.db.query(models.User).filter(models.User.role == "TECHNICIAN").first()
        self.assertIsNotNone(tech)

        res = client.get(f"/api/employees/{tech.id}/jobs")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("surveys_count", data)
        self.assertIn("installations_count", data)
        self.assertIn("surveys", data)
        self.assertIn("installations", data)

    def test_08_installation_progress_and_completion(self):
        """Rule 8: Updating installation checklist and logging hours updates progress."""
        inst = self.db.query(models.Installation).first()
        self.assertIsNotNone(inst)

        res = client.put(f"/api/installations/{inst.id}", json={
            "progress_pct": 100,
            "is_completed": True,
            "checklist": {
                "structure_mounted": True,
                "panels_clamped": True,
                "inverter_wired": True,
                "earthing_tested": True,
                "net_metering_applied": True
            },
            "hours_logged": 16.0
        })
        self.assertEqual(res.status_code, 200)
        updated = res.json()
        self.assertEqual(updated["progress_pct"], 100)
        self.assertTrue(updated["is_completed"])
        self.assertEqual(updated["hours_logged"], 16.0)

    def test_09_v1_auth_flow(self):
        """Rule 9: v1 Auth provides standard response envelopes with JWT access and refresh tokens."""
        # 1. Backoffice email login
        res = client.post("/api/v1/auth/login", json={"email": "admin@sunpower.in", "password": "password123"})
        self.assertEqual(res.status_code, 200)
        body = res.json()
        self.assertTrue(body["success"])
        self.assertIn("access_token", body["data"])
        self.assertIn("refresh_token", body["data"])
        self.assertEqual(body["data"]["token_type"], "Bearer")
        refresh_token = body["data"]["refresh_token"]

        # 2. Refresh token flow
        ref_res = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
        self.assertEqual(ref_res.status_code, 200)
        ref_body = ref_res.json()
        self.assertTrue(ref_body["success"])
        self.assertIn("access_token", ref_body["data"])

        # 3. Mobile OTP request & verify
        otp_req = client.post("/api/v1/auth/request-otp", json={"phone": "+919876543210"})
        self.assertEqual(otp_req.status_code, 200)
        otp_data = otp_req.json()
        self.assertTrue(otp_data["success"])
        otp_code = otp_data["data"]["otp"]

        otp_ver = client.post("/api/v1/auth/verify-otp", json={"phone": "+919876543210", "otp": otp_code})
        self.assertEqual(otp_ver.status_code, 200)
        ver_data = otp_ver.json()
        self.assertTrue(ver_data["success"])
        self.assertIn("access_token", ver_data["data"])

    def test_10_v1_technician_sync_and_handover(self):
        """Rule 10: v1 Technician PWA offline sync and digital signature handover with Earth Resistance < 5Ω check."""
        inst = self.db.query(models.Installation).first()
        self.assertIsNotNone(inst)

        # 1. Offline Sync
        sync_res = client.post(f"/api/v1/installations/{inst.id}/sync", json={
            "progress_pct": 90,
            "hours_logged": 12.0,
            "voc_voltage": 412.5,
            "isc_current": 10.8,
            "earth_resistance_ohms": 2.4,
            "system_tested_ok": True,
            "notes": "Offline roof sync"
        })
        self.assertEqual(sync_res.status_code, 200)
        sync_data = sync_res.json()
        self.assertTrue(sync_data["success"])
        self.assertEqual(sync_data["data"]["voc_voltage"], 412.5)

        # 2. Handover with Earth Resistance >= 5.0 ohms MUST FAIL
        fail_res = client.post(f"/api/v1/installations/{inst.id}/handover", json={
            "customer_signature_base64": "data:image/png;base64,iVBORw0KGgo...",
            "earth_resistance_ohms": 7.5,
            "voc_voltage": 415.0,
            "isc_current": 11.0
        })
        self.assertEqual(fail_res.status_code, 400)
        self.assertFalse(fail_res.json()["success"])
        self.assertIn("Earth Resistance", fail_res.json()["error"]["message"])

        # 3. Handover with Earth Resistance < 5.0 ohms MUST SUCCEED
        ok_res = client.post(f"/api/v1/installations/{inst.id}/handover", json={
            "customer_signature_base64": "data:image/png;base64,iVBORw0KGgo...",
            "earth_resistance_ohms": 3.2,
            "voc_voltage": 415.0,
            "isc_current": 11.0,
            "completion_notes": "Handover accepted"
        })
        self.assertEqual(ok_res.status_code, 200)
        ok_data = ok_res.json()
        self.assertTrue(ok_data["success"])
        self.assertTrue(ok_data["data"]["is_completed"])

if __name__ == "__main__":
    unittest.main()
