# Solution Record: SunPower Solar ERP Architecture & 5 Mandatory Automation Rules

**Status:** Verified & Passing (8 Backend Tests, 10 Playwright E2E Browser Tests)  
**Date:** November 2026  
**Stack:** FastAPI (Python 3.13), SQLAlchemy, SQLite, React 18, Vite, Tailwind CSS, Playwright Test  

---

## 1. Context & Business Domain

SunPower is a standalone Solar Installation Management System (ERP) designed for Indian rooftop solar EPC companies executing ~40 projects/month with a 15-technician certified crew.

The platform provides end-to-end automation across 13 standalone modules:
1. Public Website & Interactive Solar Savings Calculator (Monthly bill slider, 1-5 kW On-Grid/Off-Grid recommendation, Government Solar Subsidy formula)
2. Role Switcher (Customer, Sales, Warehouse, Field Technician, Support, Admin)
3. Customer Management & Homeowner Self-Service Portal
4. Rooftop Site Survey Management (Shading analysis, structural feasibility, geo-coordinates)
5. Quotation & Turnkey Pricing Engine (Deterministic BoM calculations, PDF generation)
6. Orders & Payment Schedule (Milestone payments: Advance, Dispatch, Grid Sync)
7. Inventory & Bill of Materials (Stock reservation, low-stock alerts, inbound restock)
8. Warehouse Serial Dispatch & Warranty Activation (Barcode scanning, serial tracking)
9. Field Installation & Commissioning (5-step checklist, technician hours, digital customer signature)
10. Warranty & Serial Ledger (20-year panels, 2-year inverters/batteries, live warranty clock)
11. Service Helpdesk & Zero-Click Warranty Triage (Fault codes, automatic billing triage)
12. Field Crew & Technician Roster (15 technicians, attendance, workload inspector, job costing)
13. Executive Financial Analytics & Dynamic Project P&L (Turnkey project-wise job costing)

---

## 2. The 5 Mandatory Automation Rules Enforced

| Rule | Enforcement Point | Technical Implementation | Business Guarantee |
|---|---|---|---|
| **Rule 1: Survey Gatekeeper** | `POST /api/quotations` | Rejects with `HTTP 400` if `site_surveys.is_approved == False` | No quotation can be issued before technical feasibility approval. |
| **Rule 2: BoM Explosion & Stock Reservation** | `POST /api/orders/{id}/pay` | Explodes BoM kit and deducts exact inventory units from `inventory_items.stock_qty`. Auto-schedules installation job. | Eliminates hardware stockouts and automates installation scheduling. |
| **Rule 3: Dispatch to Warranty Automation** | `POST /api/warehouse/delivery-confirm/{serial}` | Auto-sets `warranty_start_date = today` and calculates `warranty_expiry_date = today + 20 years` (Panels) or `+ 2 years` (Inverters/Batteries). | Guarantees legally enforceable warranty tracking upon physical handover. |
| **Rule 4: Zero-Click Helpdesk Triage** | `POST /api/tickets` | Evaluates `serial.warranty_expiry_date >= today`. If active: `₹0` free repair; if expired: auto-bills parts + labor. | Eliminates manual claims adjudication and prevents leakage. |
| **Rule 5: Dynamic Project-Wise P&L** | `GET /api/analytics` | $\text{Profit} = \text{Revenue} - \sum(\text{BoM Costs}) - (\text{Hours Logged} \times \text{Tech Rate})$. | Provides real-time margins per rooftop project. |

---

## 3. Key Technical Learnings & Best Practices

1. **Client-Side API Direct Connectivity vs Proxying:**
   - In containerized and sandboxed environments, Node dev-server reverse proxies can hit socket permission boundaries (`connect EPERM`).
   - *Fix:* Configure browser client `frontend/src/api.js` to target `http://${window.location.hostname}:8000/api` with FastAPI `CORSMiddleware`, removing proxy dependencies.

2. **Idempotent Test Fixtures:**
   - Sequential integration tests that update database state (e.g. approving a site survey) must ensure idempotent pre-conditions during `setUp` to allow repeatable test runs without requiring manual DB reseeding.

3. **Pydantic V2 Migration:**
   - In Pydantic V2, `.dict(exclude_unset=True)` is deprecated and emits warnings. Replaced with `.model_dump(exclude_unset=True)` across all PUT/POST routers.

4. **Hallmark UI Principles:**
   - Dark slate palette (`slate-950` background, `slate-900` cards, `slate-800` borders) accented with solar amber (`amber-400`/`amber-500`) and emerald for positive states.
   - Clean, high-density typography with monospace metrics for financial numbers and serial numbers.

---

## 4. Verification Evidence

- **Backend Integration Tests:** `cd backend && python3 -m unittest test_backend.py` -> 8/8 tests passed in 0.09s.
- **Frontend Production Build:** `cd frontend && npm run build` -> 2,284 modules compiled cleanly in 2.25s.
- **Playwright E2E Suite:** `cd frontend && npx playwright test` -> 10/10 browser tests passed in 5.8s.
