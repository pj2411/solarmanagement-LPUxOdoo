# ☀️ SunPower Solar Installation Management System (Standalone ERP)

<div align="center">

![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React 18](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![SQLite](https://img.shields.io/badge/Database-SQLite%20Relational-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Python 3.13](https://img.shields.io/badge/Python-3.13+-3776AB?style=for-the-badge&logo=python&logoColor=white)

<p align="center">
  <b>A production-grade, standalone turnkey ERP for rooftop solar EPC enterprises.</b><br>
  Built for companies completing <b>~40 rooftop projects/month with a 15-technician crew</b>.<br>
  Engineered with strict foreign-key dependencies, deterministic BoM inventory deductions, live QR scanning, digital canvas signatures, and real-time job costing.
</p>

</div>

---

## 📑 Table of Contents
- [Executive Overview](#-executive-overview)
- [System Architecture & Lifecycle Pipeline](#-system-architecture--lifecycle-pipeline)
- [The 5 Mandatory Backend Automation Rules](#-the-5-mandatory-backend-automation-rules)
- [13 Standalone Modules Directory](#-13-standalone-modules-directory)
- [Relational Database Schema](#-relational-database-schema)
- [Interactive UI & Hardware Capabilities](#-interactive-ui--hardware-capabilities)
- [Pre-Seeded Demo Scenarios](#-pre-seeded-demo-scenarios)
- [REST API Endpoints Reference](#-rest-api-endpoints-reference)
- [Directory Structure](#-directory-structure)
- [Quickstart & Installation](#-quickstart--installation)
- [Automated Test Suite](#-automated-test-suite)

---

## 🌟 Executive Overview

Most traditional solar management systems rely on disconnected CRUD forms with mock states. **SunPower ERP** connects the entire operational lifecycle through a strict relational database (SQLite + SQLAlchemy 2.0 ORM + FastAPI):

* **No Disconnected Mock Forms**: When a homeowner pays an advance, the backend automatically reserves and deducts exact hardware components (panels, inverters, cables, mounting stands) from live stock.
* **Gatekeeper Protocol**: Sales personnel cannot create formal customer quotations until a certified field technician completes and approves the roof structural & shadow-angle survey.
* **Deterministic Warranty Engine**: Dispatched serial numbers are tracked by hardware category; on delivery confirmation, the backend auto-calculates 20-Year (Modules) or 2-Year (Inverters/Batteries) warranties without manual date entry.
* **Zero-Click Helpdesk Triage**: Customer complaints with serial numbers automatically check live warranty expiration, auto-billing ₹0 for active warranties or generating invoice amounts for expired units.
* **True Job Costing**: Every project's gross profit is computed dynamically from collected revenues, actual hardware procurement costs, and logged technician labor hours.

---

## 🔄 System Architecture & Lifecycle Pipeline

```text
 1. PUBLIC INQUIRY          2. SITE SURVEY              3. SURVEY GATEKEEPER
 ┌───────────────────┐      ┌───────────────────┐      ┌─────────────────────────┐
 │ Savings Calculator│ ───► │ Measure Azimuth,  │ ───► │ Technician Review       │
 │ Lead Capture Form │      │ Tilt & Shade Area │      │ (HTTP 400 Lock Enforced)│
 └───────────────────┘      └───────────────────┘      └─────────────────────────┘
                                                                    │
                                                                    ▼
 6. ORDER & ADVANCE         5. CUSTOMER APPROVAL        4. QUOTATION & BOM
 ┌───────────────────┐      ┌───────────────────┐      ┌─────────────────────────┐
 │ 20% Advance Paid  │ ◄─── │ Homeowner Review  │ ◄─── │ Auto-Calculate 1-5 kW   │
 │ GST Invoice Gen   │      │ Portal Sign-off   │      │ On/Off-Grid Hardware    │
 └───────────────────┘      └───────────────────┘      └─────────────────────────┘
          │
          ▼
 7. INVENTORY DEDUCTION     8. WAREHOUSE DISPATCH       9. FIELD INSTALLATION
 ┌───────────────────┐      ┌───────────────────┐      ┌─────────────────────────┐
 │ BoM Explosion     │ ───► │ Camera QR Scanner │ ───► │ Power Gen kW Test       │
 │ Stock Deductions  │      │ Serial Binding    │      │ Canvas Digital Signature│
 └───────────────────┘      └───────────────────┘      └─────────────────────────┘
                                                                    │
                                                                    ▼
12. EXECUTIVE BI           11. SERVICE HELPDESK        10. WARRANTY REGISTRY
 ┌───────────────────┐      ┌───────────────────┐      ┌─────────────────────────┐
 │ Dynamic Project   │ ◄─── │ Zero-Click Triage │ ◄─── │ Auto-Start Today        │
 │ Profit & Loss     │      │ ₹0 vs Auto-Billed │      │ 20-Yr Module / 2-Yr Inv │
 └───────────────────┘      └───────────────────┘      └─────────────────────────┘
```

---

## ⚡ The 5 Mandatory Backend Automation Rules

FastAPI enforces five core business rules backed by foreign-key relational integrity:

### 1. Survey Gatekeeper Rule (`POST /api/quotations`)
* **Behavior:** Returns `HTTP 400 Bad Request` if `site_surveys.is_approved` is `False` for the requested lead.
* **Business Value:** Prevents sales representatives from promising system delivery before a technician certifies roof load capacity and shadow obstruction.

### 2. Automatic BoM Explosion & Stock Deduction (`POST /api/orders/{id}/pay`)
* **Behavior:** When an advance payment is registered, the system resolves the exact `bom_items` for that `capacity_kw` + `system_type`.
* **Action:** Deducts exact quantities from `inventory_items.stock_qty`, flags red reorder alerts for items at or below `reorder_threshold`, and automatically schedules a field installation task.

### 3. Dispatch-to-Warranty Automation (`POST /api/warehouse/delivery-confirm/{serial}`)
* **Behavior:** Binds serial numbers to customer orders during warehouse packing.
* **Action:** Upon delivery confirmation, automatically computes:
  * **20 Years** linear output warranty for `PANEL` units.
  * **2 Years** comprehensive warranty for `INVERTER`, `BATTERY`, and `CHARGE_CONTROLLER`.

### 4. Zero-Click Helpdesk Warranty Triage (`POST /api/tickets`)
* **Behavior:** Instantly evaluates `today <= serial_units.warranty_expiry_date`:
  * **Active:** Sets `is_under_warranty = True` and auto-bills **₹0** (free component repair/replacement).
  * **Expired:** Sets `is_under_warranty = False` and auto-bills invoice for `parts_cost_inr + labor_cost_inr`.

### 5. Dynamic Project-Wise P&L Formula (`GET /api/analytics`)
* **Behavior:** Dynamically computes profitability per project from real relational records:
  $$\text{Project Profit} = \text{Collected Revenue} - \sum(\text{BoM Component Procurement Costs}) - (\text{Field Hours Logged} \times \text{Technician Hourly Rate})$$

---

## 🧭 13 Standalone Modules Directory

| Module | Core Purpose & Technical Highlights | Key Entities |
|---|---|---|
| **1. Public Website** | Consumer landing page with On-Grid vs Off-Grid comparison, government subsidy guide, and interactive monthly bill slider calculating recommended kW, savings, and payback period. | `CustomerLead` |
| **2. Authentication** | JWT-style role claim simulation with persistent top-bar **1-Click Persona Switcher** and full RBAC security matrix. | `User` |
| **3. Customer CRM & Portal** | Pipeline tracking across 7 stages (`NEW` to `INSTALLED`) + **Homeowner Self-Service Portal** to approve quotes and view active warranties. | `CustomerLead` |
| **4. Site Survey Management** | Technician measurement of Azimuth, tilt angle, shadow-free area (sq.ft), cable distance (m), roof photos, and survey approval. | `SiteSurvey`, `User` |
| **5. Quotation Engine** | 1kW to 5kW On-Grid/Off-Grid packages, dynamic BoM calculation, subsidy credit calculation, and downloadable **Quotation PDF**. | `Quotation`, `BOMTemplate` |
| **6. Order & Payments** | Advance/full payment recording, automatic BoM stock deduction, subsidy status tracking, and **GST Tax Invoice PDF**. | `Order`, `Quotation` |
| **7. Inventory & BoM** | Real-time stock across 6 hardware categories, reorder threshold alerts, and turnkey BoM kit configurators. | `InventoryItem`, `BOMItem` |
| **8. Dispatch & Serials** | Camera QR/Barcode scanning (`html5-qrcode`) or manual serial input, customer mapping, and delivery confirmation. | `SerialUnit`, `Order` |
| **9. Field Installation** | Field technician workbench, kW power test verification, and **HTML5 Canvas Digital Signature Pad** (`react-signature-canvas`). | `Installation`, `User` |
| **10. Warranty Registry** | Master hardware serial registry with live active vs. expired status pills and official **Warranty Certificate Modal**. | `SerialUnit` |
| **11. Service Helpdesk** | Instant serial lookup with **Bold Green (₹0)** or **Bold Red (Auto-Billed)** banners, solar fault code catalog, and technician dispatch. | `ServiceTicket` |
| **12. Field Crew & Attendance** | Roster of 15 certified technicians, hourly rates (₹340 to ₹450/hr), attendance toggles (`PRESENT`, `ABSENT`, `ON_LEAVE`), and payroll estimates. | `User` |
| **13. Financial BI & Analytics** | Executive dashboard with total revenue, expenses, net profit, pending receivables, stock valuation, Recharts graphs, and **CSV Report Export**. | Real-Time DB Aggregation |

---

## 🗄️ Relational Database Schema

All 10 database tables enforce foreign-key cascading and relational integrity:

```
┌─────────────────────────────────┐
│              users              │
├─────────────────────────────────┤
│ id (PK)                         │
│ name, email, password_hash      │
│ role (ADMIN, SALES, TECH, etc.) │
│ hourly_rate, attendance_status  │
└────────────────┬────────────────┘
                 │
       ┌─────────┴─────────┐───────────────────┐
       ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌─────────────────┐
│ site_surveys │   │installations │   │ service_tickets │
└──────┬───────┘   └──────┬───────┘   └────────┬────────┘
       │                  │                    │
       ▼                  │                    ▼
┌──────────────────┐      │           ┌─────────────────┐
│ customers_leads  │◄─────┼───────────┤   serial_units  │
└──────┬───────────┘      │           │ (serial_number) │
       │                  │           └────────┬────────┘
       ▼                  ▼                    ▲
┌──────────────┐   ┌──────────────┐            │
│  quotations  ├──►│    orders    ├────────────┘
└──────────────┘   └──────────────┘
```

---

## 🎨 Interactive UI & Hardware Capabilities

* **1-Click Persona Switcher**: Persistent top bar allows instant evaluation from any role (`Customer`, `Sales`, `Warehouse`, `Technician`, `Support`, `Admin`).
* **Live Camera QR/Barcode Scanner**: Utilizes `html5-qrcode` to scan product serial barcodes directly from smartphone or webcam video streams.
* **Canvas Digital Signature**: Homeowners inspect completed installations and sign off directly on an HTML5 canvas pad before handover.
* **Client-Side PDF Generation**: Generates clean, branded PDF estimates and GST invoices via `jspdf` and `jspdf-autotable`.
* **Recharts Financial Visualizations**: Visualizes project revenue vs. hardware costs vs. technician labor in real time.

---

## 🧪 Pre-Seeded Demo Scenarios

The system auto-seeds realistic Indian solar data on first boot (`backend/seed.py`):

1. **Project 1: Arvind Sharma (Completed 18 Months Ago - Live Warranty Triage Ready)**
   - 3 kW On-Grid system in Noida.
   - Fully installed, tested, and commissioned with customer digital signature.
   - **Inverter (`INV-2025-0518`)**: Active 2-Year warranty (expires in 6 months). Triaging in Helpdesk produces a **₹0 Free Repair Claim**.
   - **Old Battery (`BAT-2023-0104`)**: Expired 10 months ago. Triaging in Helpdesk produces an **Auto-Billed Customer Invoice**.
2. **Project 2: Sunita Rao (In Active Field Installation)**
   - 5 kW On-Grid villa project in Whitefield, Bengaluru.
   - Survey approved, quote approved, 50% advance recorded, BoM deducted from warehouse.
   - Field technician currently has job in progress at 60%.
3. **Project 3: Rajesh Mehta (Sales Pipeline / Survey Gatekeeper Test)**
   - 3 kW system in Model Town, Jalandhar.
   - Survey scheduled but **NOT yet approved**.
   - Attempting to generate a quote triggers the **Survey Gatekeeper Rule (HTTP 400)**. Approving the survey unlocks quoting.

---

## 📡 REST API Endpoints Reference

<details>
<summary><b>Click to expand full API endpoint table</b></summary>

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System status and UTC timestamp. |
| `GET` | `/api/roles` | Available persona profiles for 1-click switching. |
| `GET` | `/api/leads` | Retrieve all customer leads. |
| `POST` | `/api/leads` | Create lead and auto-schedule site survey. |
| `PUT` | `/api/leads/{id}` | Update customer lead notes or pipeline stage. |
| `GET` | `/api/surveys` | List all scheduled rooftop surveys. |
| `POST` | `/api/surveys/{id}/approve` | Approve survey (unlocks quoting for that lead). |
| `GET` | `/api/inventory` | Retrieve stock levels across all 6 hardware categories. |
| `GET` | `/api/bom/calculate` | Compute live BoM cost for a `(kW, system_type)` pair. |
| `GET` | `/api/quotations` | List issued quotations. |
| `POST` | `/api/quotations` | Create quotation (**Enforces Rule 1 Gatekeeper**). |
| `POST` | `/api/quotations/{id}/approve` | Mark quote approved by customer; creates Order. |
| `GET` | `/api/orders` | Retrieve all orders and payment states. |
| `POST` | `/api/orders/{id}/pay` | Record payment (**Enforces Rule 2 BoM Explosion**). |
| `PUT` | `/api/orders/{id}/subsidy` | Update government subsidy DBT stage. |
| `GET` | `/api/warehouse/serials` | Master registry of hardware serial units. |
| `POST` | `/api/warehouse/dispatch` | Register and map serial number to customer order. |
| `POST` | `/api/warehouse/delivery-confirm/{serial}` | Confirm delivery (**Enforces Rule 3 Warranty Auto-Start**). |
| `GET` | `/api/installations` | List active field installation jobs. |
| `POST` | `/api/installations/{id}/complete` | Complete installation with canvas signature. |
| `GET` | `/api/tickets` | List helpdesk maintenance tickets. |
| `POST` | `/api/tickets` | Create service ticket (**Enforces Rule 4 Zero-Click Triage**). |
| `PUT` | `/api/tickets/{id}` | Update ticket or mark resolved. |
| `GET` | `/api/employees` | List 15 certified technicians and attendance logs. |
| `PUT` | `/api/employees/{id}/attendance` | Toggle attendance status (`PRESENT`, `ABSENT`, `ON_LEAVE`). |
| `GET` | `/api/analytics` | Executive BI & itemized dynamic project P&L (**Enforces Rule 5**). |

</details>

---

## 📁 Directory Structure

```text
solarmanagement-LPUxOdoo/
├── backend/
│   ├── database.py              # SQLite connection & sessionmaker
│   ├── main.py                  # FastAPI server & business rule endpoints
│   ├── models.py                # 10 SQLAlchemy relational ORM models
│   ├── schemas.py               # Pydantic request/response schemas
│   ├── seed.py                  # Auto-seeder with Indian solar dataset
│   └── test_backend.py          # Automated test suite (5 rules verified)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── RoleSwitcher.jsx # 1-Click Role Switcher top bar
│   │   │   └── Sidebar.jsx      # 13-Module navigation sidebar
│   │   ├── utils/
│   │   │   └── pdfExport.js     # Quotation & GST Invoice PDF generator
│   │   ├── views/
│   │   │   ├── PublicWebsiteView.jsx
│   │   │   ├── AuthView.jsx
│   │   │   ├── CustomerManagementView.jsx
│   │   │   ├── SiteSurveyView.jsx
│   │   │   ├── QuotationView.jsx
│   │   │   ├── OrderPaymentView.jsx
│   │   │   ├── InventoryView.jsx
│   │   │   ├── DispatchView.jsx
│   │   │   ├── InstallationView.jsx
│   │   │   ├── WarrantyView.jsx
│   │   │   ├── HelpdeskView.jsx
│   │   │   ├── EmployeeView.jsx
│   │   │   └── AnalyticsView.jsx
│   │   ├── App.jsx              # Main state coordinator
│   │   ├── api.js               # Centralized FastAPI client
│   │   ├── index.css            # Tailwind & typography styling
│   │   └── main.jsx             # React entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Quickstart & Installation

### Prerequisites
* **Python 3.10+**
* **Node.js 18+ & npm**

### 1. Backend Setup (FastAPI)
```bash
# Navigate to backend folder
cd backend

# Install Python dependencies
pip install fastapi uvicorn sqlalchemy pydantic python-multipart

# Initialize database & seed demo dataset
python3 seed.py

# Run unit tests
python3 test_backend.py

# Start FastAPI server
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
* **Swagger API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **API Health Endpoint**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

### 2. Frontend Setup (React 18 + Vite)
```bash
# In a new terminal window, navigate to frontend folder
cd frontend

# Install npm packages
npm install

# Start Vite development server
npm run dev
```
* **Web Application**: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Automated Test Suite

Run the backend unit test suite to verify the business automation rules:
```bash
cd backend
python3 test_backend.py
```

**Expected Output:**
```text
.....
----------------------------------------------------------------------
Ran 5 tests in 0.059s

OK
```
Tests automatically assert:
1. `test_01_survey_gatekeeper_rule`: Rejects unapproved surveys with HTTP 400, accepts once approved.
2. `test_02_bom_explosion_and_stock_reservation_on_payment`: Deducts inventory stock and queues jobs.
3. `test_03_dispatch_to_warranty_automation`: Confirms automated 20-Year (Panel) and 2-Year (Inverter) dates.
4. `test_04_zero_click_warranty_triage`: Verifies ₹0 active repair vs auto-billed invoice calculation.
5. `test_05_dynamic_project_pnl_analytics`: Mathematical verification of project profit formula.
