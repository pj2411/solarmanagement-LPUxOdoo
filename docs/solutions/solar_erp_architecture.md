# SunPower Solar Installation Management System (Standalone ERP)
## Architecture & Solution Documentation

### 1. Executive Summary
SunPower ERP is a production-grade, standalone full-stack solar installation management system built specifically for rooftop solar engineering companies completing ~40 projects/month with a 15-technician crew. It replaces disconnected CRUD forms with a strict relational database engine (FastAPI + SQLAlchemy + SQLite), backend business rule enforcement, deterministic Bill of Materials (BoM) inventory deductions, automated 20-year / 2-year warranty calculations, and dynamic job-costing profitability math.

---

### 2. Tech Stack
- **Backend:** Python 3, FastAPI, SQLAlchemy 2.0 ORM, Pydantic, SQLite (`sunpower.db`), Uvicorn.
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Recharts (Dynamic P&L charts), `react-signature-canvas` (Homeowner rooftop sign-off), `html5-qrcode` (Warehouse serial barcode scanning), `jspdf` + `jspdf-autotable` (PDF export).
- **Authentication & Testing UX:** Persistent top-bar **1-Click Role Switcher** (`Public / Customer`, `Sales & Survey`, `Warehouse Dispatch`, `Field Technician`, `Support / Helpdesk`, `Director / Admin`).

---

### 3. Enforced Business Logic Rules
1. **Survey Gatekeeper Rule (`POST /api/quotations`):**
   - Returns `HTTP 400 Bad Request` if `site_surveys.is_approved` is `False`.
   - Prevents sales staff from committing hardware without technician rooftop structural & shadow angle verification.
2. **Automatic BoM Explosion & Stock Deduction (`POST /api/orders/{id}/pay`):**
   - Upon receipt of advance or full payment, the backend resolves the deterministic BoM template for that `(capacity_kw, system_type)` combination.
   - Deducts exact stock quantities from `inventory_items.stock_qty`.
   - Flags items where `stock_qty <= reorder_threshold` as low-stock alerts.
   - Automatically queues an installation job for the field crew.
3. **Dispatch-to-Warranty Automation (`POST /api/warehouse/delivery-confirm/{serial_number}`):**
   - When warehouse staff confirms hardware delivery, the backend automatically sets `warranty_start_date = today` and computes `warranty_expiry_date`:
     - **20 Years** for `PANEL` (linear output degradation guarantee).
     - **2 Years** for `INVERTER`, `BATTERY`, `CHARGE_CONTROLLER`.
   - Eliminates manual date entry mistakes.
4. **Zero-Click Helpdesk Warranty Triage (`POST /api/tickets`):**
   - Checks if `today <= serial_units.warranty_expiry_date`.
   - If **IN WARRANTY**: Sets `is_under_warranty = True` and auto-bills `₹0` (free repair/replacement).
   - If **EXPIRED**: Sets `is_under_warranty = False` and auto-generates invoice for `parts_cost_inr + labor_cost_inr`.
5. **Dynamic Project-Wise P&L Formula (`GET /api/analytics`):**
   - Dynamically calculated from database records:
     $$\text{Project Profit} = \text{Collected Revenue} - \sum(\text{BoM Component Unit Costs}) - (\text{Installation Hours Logged} \times \text{Technician Hourly Rate})$$

---

### 4. 13-Module Architecture
1. **Public Website & Solar Savings Calculator:** Consumer landing hero, On-Grid vs Off-Grid comparison, PM Surya Ghar subsidy rules, interactive monthly bill calculator, and instant survey booking form.
2. **Authentication & Role Switcher:** Multi-role JWT simulation and 1-click persona testing.
3. **Customer Management & Portal:** Lead pipeline directory, follow-up notes, and homeowner self-service portal for quote approvals and tickets.
4. **Site Survey Management:** Technician roof azimuth, tilt angle, shadow-free area (sq.ft), cable run (m), and gatekeeper approval action.
5. **Quotation Management:** 1kW to 5kW On-Grid/Off-Grid packages, BoM calculation, PDF quotation generation, and customer approval.
6. **Order & Payment Management:** Advance / full payment receipt, BoM stock deduction trigger, and official GST Tax Invoice PDF generation.
7. **Inventory & Auto-BOM Management:** Stock tracker across 6 categories, reorder threshold alerts, and kit configurators.
8. **Dispatch & Serial Tracking:** Camera QR/barcode scanner, serial registration, and delivery confirmation warranty trigger.
9. **Field Installations:** Technician checklist, generation test verification (kW), and HTML5 canvas digital signature acceptance pad.
10. **Warranty Management:** Serial registry, active vs expired filters, and official warranty certificate generation.
11. **Service Helpdesk:** Fast triage lookup, fault code catalog, technician dispatch, and zero-click warranty auto-billing.
12. **Crew & Attendance:** 15 certified technicians, attendance toggle, hourly rate tracking, and monthly payroll estimation.
13. **Admin & Financial Analytics:** Dynamic job-costing table, Recharts revenue vs costs chart, PM Surya Ghar subsidy tracking, and CSV export.

---

### 5. Running the Application
#### Backend (FastAPI):
```bash
cd backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation available at: `http://localhost:8000/docs`

#### Frontend (React + Vite):
```bash
cd frontend
npm run dev
```
Web application available at: `http://localhost:5173`
