# ☀️ SunPower Solar Installation Management System (Standalone ERP)

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite%20Relational-003B57?logo=sqlite&logoColor=white)](https://sqlite.org/)

A complete, production-grade, standalone full-stack ERP web application built for **SunPower Solutions** — a rooftop solar installation and EPC company completing **~40 projects/month with a 15-technician crew**.

Designed and built for the **LPU x Odoo Solar Management Challenge**, replacing disconnected CRUD forms with a strict relational database engine, deterministic Bill of Materials (BoM) stock reservations, camera-based QR serial tracking, zero-click warranty triage, and dynamic project-wise job costing.

---

## ⚡ The 5 Mandatory Backend Automation Rules

Inside `backend/main.py`, FastAPI enforces five non-negotiable business rules backed by foreign keys:

| # | Business Rule | Enforcing Endpoint | Automated Behavior |
|---|---|---|---|
| **1** | **Survey Gatekeeper Rule** | `POST /api/quotations` | Returns **`HTTP 400 Bad Request`** if `site_surveys.is_approved` is `False`. Quotes cannot be generated until a technician measures and approves azimuth, tilt, and shade-free area. |
| **2** | **BoM Explosion & Stock Deduction** | `POST /api/orders/{id}/pay` | Upon advance or full payment receipt, queries `bom_items` for that `(kW, system_type)` configuration, deducts exact quantities from `inventory_items.stock_qty`, flags reorder alerts, and auto-schedules a field installation job. |
| **3** | **Dispatch-to-Warranty Automation** | `POST /api/warehouse/delivery-confirm/{serial}` | When delivery is confirmed, automatically sets `warranty_start_date = today` and computes `warranty_expiry_date = today + 20 years` for **PANEL** or `+ 2 years` for **INVERTER**, **BATTERY**, and **CHARGE CONTROLLER** with zero manual date entry. |
| **4** | **Zero-Click Helpdesk Warranty Triage** | `POST /api/tickets` | Evaluates `today <= serial_units.warranty_expiry_date`. If active: sets `is_under_warranty = True` and auto-bills **₹0** (free repair). If expired: auto-bills customer invoice for `parts_cost_inr + labor_cost_inr`. |
| **5** | **Dynamic Project-Wise P&L Formula** | `GET /api/analytics` | Dynamically computes net profitability per project directly from relational rows:<br>$$\text{Profit} = \text{Collected Revenue} - \sum(\text{BoM Component Costs}) - (\text{Hours Logged} \times \text{Tech Hourly Rate})$$ |

---

## 🧭 Complete 13-Module ERP Directory

The UI organizes all enterprise operations into a streamlined sidebar with real-time badge counters:

1. **Public Website & Solar Savings Calculator**
   - Consumer landing hero, On-Grid vs. Off-Grid technical comparison, government solar subsidy details.
   - Interactive monthly bill slider (₹1,000 to ₹25,000/mo) calculating recommended system capacity, monthly savings, net investment after subsidy, and estimated payback period in years.
   - Lead capture form that automatically queues a site survey.
2. **Authentication & 1-Click Persona Switcher**
   - Persistent top bar allowing evaluators to switch between 6 personas with 1 click:
     - 👤 `Public / Customer` (Homeowner)
     - 📋 `Sales & Survey`
     - 📦 `Warehouse Dispatch`
     - 👷 `Field Technician`
     - 🎧 `Support / Helpdesk`
     - 👑 `Director / Admin`
   - RBAC security permissions matrix.
3. **Customer Management & Homeowner Portal**
   - Leads directory with pipeline filter (`NEW`, `FOLLOW_UP`, `SURVEY_SCHEDULED`, `SURVEY_APPROVED`, `QUOTED`, `WON`, `INSTALLED`).
   - Homeowner Self-Service Portal where customers view project progression, review quotes, check warranty cards, and raise service tickets.
4. **Site Survey Management**
   - Roof direction (Azimuth), tilt angle (deg), shadow-free area (sq.ft), cable distance (m), roof photos, and the **"Approve Survey"** gatekeeper button.
5. **Quotation Management**
   - Select 1kW to 5kW packages and On-Grid/Off-Grid architecture (locked with lock icon until survey approval).
   - Itemized hardware BoM breakdown, installation charge, government subsidy discount, and customer net payable total.
   - Download official **Quotation PDF** via `jspdf`.
6. **Order & Payment Management**
   - Convert approved quote to active Order.
   - Record advance or full payment (triggers Rule 2 BoM deduction).
   - Track government subsidy DBT stages (`NOT_APPLIED`, `APPLIED`, `INSPECTED`, `DISBURSED`).
   - Download official **GST Tax Invoice PDF**.
7. **Inventory & Auto-BOM Management**
   - Real-time stock ledger across 6 categories: *Panels, Inverters, Batteries, Mounting Structures, Wires & Connectors, Safety Equipment*.
   - Red animated warning badges when items fall below `reorder_threshold`.
   - Pre-configured BoM templates for 1kW–5kW packages.
8. **Warehouse Dispatch & Serial Number Tracking**
   - Camera QR/Barcode scanning (`html5-qrcode`) or instant keyboard serial registration.
   - Customer-order hardware serial mapping.
   - One-click **"Confirm Delivery & Start Warranty"** action (Rule 3).
9. **Field Installation Management**
   - Technician checklist, field timer, system kW generation test verification.
   - **HTML5 Canvas Customer Digital Signature Pad** (`react-signature-canvas`) for rooftop acceptance sign-off.
10. **Master Solar Warranty Registry**
    - Searchable serial registry with live active vs. expired status pills.
    - Official printable **Warranty Certificate Modal** with coverage terms.
11. **Service, Maintenance & Helpdesk**
    - Instant serial lookup with **BOLD GREEN "UNDER WARRANTY — ₹0 FREE REPAIR"** or **BOLD RED "WARRANTY EXPIRED — AUTO-BILLED INVOICE"** banner (Rule 4).
    - Solar fault code catalog (`E04-GRID-LOSS`, `B02-LOW-VOLTAGE`, `E01-DC-ISOLATION`, etc.).
    - Technician assignment and ticket closure.
12. **Field Crew & Attendance Management**
    - 15 certified technicians with hourly billing rates (₹340 to ₹450/hr).
    - Attendance status toggles (`PRESENT`, `ABSENT`, `ON_LEAVE`).
    - Estimated monthly payroll calculation.
13. **Executive BI & Dynamic Financial Analytics**
    - High-level KPI summary: Total Collected Revenue, Operating Costs, Net Profit, Pending Customer Receivables, and Total Warehouse Stock Valuation.
    - Recharts Financial Comparison Bar Chart.
    - Itemized Project-Wise Job-Costing Ledger.
    - One-click **CSV Report Export**.

---

## 🗄️ Relational Database Schema (`backend/models.py`)

All tables are strictly relational with foreign keys:

```
users (id, name, email, role, hourly_rate, attendance_status)
  │
  ├──< site_surveys (id, lead_id, technician_id, azimuth, tilt, is_approved)
  ├──< installations (id, order_id, technician_id, hours, signature_base64)
  └──< service_tickets (id, lead_id, serial_number, fault_code, is_under_warranty)

customers_leads (id, customer_name, phone, capacity_kw, system_type, stage)
  │
  ├──< site_surveys
  ├──< quotations (id, lead_id, survey_id, capacity_kw, grand_total, status)
  │      └──< orders (id, quotation_id, lead_id, total, advance_paid, bom_deducted)
  │             ├──< installations
  │             └──< serial_units (serial_number, order_id, item_id, expiry_date)
  │                    └──< service_tickets
  └──< service_tickets

inventory_items (id, sku, name, category, unit_cost, selling_price, stock_qty)
  │
  ├──< bom_items (template_id, inventory_item_id, quantity)
  └──< serial_units
```

---

## 🧪 Pre-Seeded Indian Solar Demo Projects

The database auto-seeds realistic Indian solar data on first boot (`backend/seed.py`):

1. **Project 1: Arvind Sharma (Completed 18 Months Ago - Live Warranty Triage Ready)**
   - 3 kW On-Grid system in Noida.
   - Fully installed, tested, and commissioned with customer signature.
   - Serial `INV-2025-0518` (Inverter, 2-Year Warranty): **Active / In Warranty** (Expires in 6 months). Triaging in Helpdesk produces **₹0 Free Repair**.
   - Serial `BAT-2023-0104` (Old Battery, 2-Year Warranty): **Expired 10 months ago**. Triaging in Helpdesk auto-generates an invoice for parts + labor.
2. **Project 2: Sunita Rao (In Active Field Installation)**
   - 5 kW On-Grid villa project in Whitefield, Bengaluru.
   - Survey approved, quote approved, 50% advance recorded, BoM deducted from warehouse.
   - Field technician currently has job in progress at 60%.
3. **Project 3: Rajesh Mehta (Sales Pipeline / Survey Gatekeeper Test)**
   - 3 kW system in Model Town, Jalandhar.
   - Survey scheduled but **NOT yet approved**.
   - Attempting to generate a quote triggers the **Survey Gatekeeper Rule (HTTP 400)**. Approving the survey unlocks quoting.

---

## 🚀 Quickstart Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+ & npm**

### 1. Backend Setup (FastAPI)
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install fastapi uvicorn sqlalchemy pydantic python-multipart

# Seed database (creates and populates sunpower.db)
python3 seed.py

# Run unit tests
python3 test_backend.py

# Start FastAPI server
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
* **API Swagger Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **API Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

### 2. Frontend Setup (React + Vite)
```bash
# Navigate to frontend (in a separate terminal)
cd frontend

# Install npm packages
npm install

# Start Vite development server
npm run dev
```
* **ERP Web Application**: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Automated Test Verification

Run the automated backend test suite:
```bash
cd backend
python3 test_backend.py
```
**Test Results:**
```text
.....
----------------------------------------------------------------------
Ran 5 tests in 0.059s

OK
```
Tests verify:
1. `test_01_survey_gatekeeper_rule`: Rejects unapproved surveys with HTTP 400, passes once approved.
2. `test_02_bom_explosion_and_stock_reservation_on_payment`: Deducts stock and auto-queues field jobs.
3. `test_03_dispatch_to_warranty_automation`: Auto-computes 20-yr and 2-yr expiry dates.
4. `test_04_zero_click_warranty_triage`: Verifies ₹0 active repair vs auto-billed expired ticket.
5. `test_05_dynamic_project_pnl_analytics`: Mathematical verification of project profit formula.
