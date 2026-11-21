# Solar Installation Management System (SIMS) - Project Memory

> **System Status**: Phase 1 & 2 Live & Operational (Database Tables Created & Live FastAPI Server Active)  
> **Target Platform**: Custom Python / FastAPI Solar EPC & Operations ERP Backend  
> **Last Updated**: November 2026 (Live Database Seeded, Port 5433 Configured, FastAPI Live on http://localhost:8000/docs)  
> **Architecture Principle**: Clean Architecture (API Router $\rightarrow$ Business Service $\rightarrow$ Data Repository / SQLAlchemy $\rightarrow$ PostgreSQL). Backend-only scope.

---

## 1. Project Overview & Scope
The **Solar Installation Management System (SIMS)** is a full-lifecycle backend ERP and operations platform tailored for Solar Rooftop and Commercial & Industrial (C&I) solar providers.

### Scope Boundaries:
- **In-Scope (Our Responsibility)**:
  - 100% of the **Backend** development.
  - Python 3.11+, FastAPI (Async), SQLAlchemy 2.0 (Async), PostgreSQL 16, Redis 7 (caching/task queues), Alembic (migrations).
  - Background workers (PDF generation, email/WhatsApp notifications, payment webhooks).
  - Complete RESTful API contracts, OpenAPI specs (`/docs`), authentication (JWT/OTP), and RBAC.
  - Frontend Developer Handover & Integration Guides.
- **Out-of-Scope (External Frontend Team)**:
  - Client-side implementation (Public Web, Customer Portal, Admin Dashboard, Technician PWA).
  - External frontend developer will build the UI (e.g. React + Vite + Tailwind) against our FastAPI endpoints.
- **Strict Rule**: **NO Odoo**. Pure custom Python / FastAPI architecture.

### Runtime Environment Status (Active & Verified):
- **PostgreSQL 16 (Docker Container `sims_postgres_db`)**: Active on `localhost:5433` (mapped from container 5432 to avoid collision with native Windows service).
- **Redis 7 (Docker Container `sims_redis`)**: Active on `localhost:6379`.
- **FastAPI Live Server**: Running at `http://localhost:8000` with interactive Swagger docs at `http://localhost:8000/docs`.
- **Seeded Credentials for Testing**:
  - **Super Admin**: `admin@sims.com` / `Admin@12345` (Phone: `9876543210`)
  - **Sales Executive**: `sales@sims.com` / `Sales@12345` (Phone: `9876543211`)
  - **Field Technician**: `tech@sims.com` / `Tech@12345` (Phone: `9876543212`)
  - **Test OTP**: `123456` or dynamic via `POST /api/v1/auth/request-otp`
- **Local Dev Workflow**:
  - Docker Desktop runs **PostgreSQL 16**, **Redis 7**, and **MinIO S3** containers.
  - FastAPI runs either in container or on host with hot-reload (`uvicorn app.main:app --reload`).

---

## 2. Directory & File Inventory: Which File is for What

All files have been scaffolded with descriptive header docstrings in `backend/`:

### 2.1 Root Configuration & Infrastructure
- `backend/Dockerfile`: Multi-stage production container definition for FastAPI & WeasyPrint dependencies.
- `backend/docker-compose.yml`: Multi-service orchestration (FastAPI app, PostgreSQL 16, Redis 7, MinIO S3).
- `backend/.env.example`: Template for environment variables (DB credentials, JWT keys, Redis, S3, payment APIs).
- `backend/.gitignore`: Python, venv, IDE, and media file exclusions.
- `backend/alembic.ini`: Configuration file for Alembic database migrations.
- `backend/requirements.txt`: Python dependencies (FastAPI, SQLAlchemy, asyncpg, Alembic, Celery, WeasyPrint, etc.).

### 2.2 Core Application (`backend/app/core/`)
- `app/main.py`: Main FastAPI app instance, CORS middleware, global error handlers, route mounting, lifespan events.
- `app/core/config.py`: Pydantic `BaseSettings` for type-safe environment configuration.
- `app/core/database.py`: SQLAlchemy 2.0 async engine, `AsyncSessionLocal`, and `get_db` FastAPI dependency.
- `app/core/security.py`: Password hashing (Bcrypt/Argon2), JWT token generation/decoding, OAuth2 scheme.
- `app/core/exceptions.py`: Custom application exceptions and standardized JSON error handlers.
- `app/core/redis.py`: Async Redis client for caching, OTP rate-limiting, and temporary verification storage.

### 2.3 Database Models (`backend/app/models/` - SQLAlchemy 2.0)
- `base.py`: Base declarative class with UUID primary key, `created_at`, `updated_at`.
- `user.py`: Users & RBAC credentials across 9 system roles (Module 02).
- `customer.py`: Customer KYC, utility provider (DISCOM), consumer number, sanctioned load (Module 03).
- `lead.py`: CRM leads, electricity bills, roof areas, recommended kW, pipeline stages (Module 01 & 03).
- `survey.py`: Roof tilt, azimuth, shadow-free area, cable runs, geo-tagged photo JSONB (Module 04).
- `quotation.py`: 1–5kW system quotes, on-grid/off-grid, dynamic BOM snapshot, subsidy deduction (Module 05).
- `order.py`: Confirmed sales orders, contract values, balance due (Module 06).
- `payment.py`: Milestone payments (Advance, Pre-dispatch, Handover), transaction records, GST invoices (Module 06).
- `inventory.py`: Product catalog (panels, inverters, batteries, structures, cables), stock levels, reorder alerts (Module 07).
- `serial_tracking.py`: Serial numbers (14-16 digit panel RFIDs/barcodes), customer equipment mapping (Module 08).
- `installation.py`: Installation jobs, step checklists, electrical tests ($V_{oc}, I_{sc}, \text{Earth} < 5\Omega$), signatures (Module 09).
- `warranty.py`: Component warranty records (25-yr panel, 5-10 yr inverter), expiry dates, status (Module 10).
- `maintenance.py`: Service tickets, inverter fault code lookup, technician dispatch, RMA tracking (Module 11).
- `employee.py`: Employee directory, technician skill tags, mobile geo-attendance logs, per-kW incentives (Module 12).
- `analytics.py`: Financial views, project-level P&L tracking, subsidy claims aging ledger (Module 13).

### 2.4 Pydantic Schemas / DTOs (`backend/app/schemas/`)
- `common.py`: Standard `ApiResponse[T]` envelope, pagination queries, error response schemas.
- `auth.py`: LoginRequest, TokenResponse, RequestOtpSchema, VerifyOtpSchema, RefreshTokenRequest.
- `customer.py`: CustomerCreate, CustomerUpdate, CustomerResponse.
- `lead.py`: CalculatorInputSchema, CalculatorResultSchema, LeadCreate, LeadResponse.
- `survey.py`: SurveyScheduleRequest, SurveySubmitReport, RoofInspectionData, SurveyPhotoMetadata.
- `quotation.py`: QuotationGenerateRequest, BOMItemDetail, QuotationResponse, QuotationApprovalSchema.
- `order.py`: OrderCreateFromQuotation, OrderStatusUpdate, OrderResponse.
- `payment.py`: CreatePaymentOrderRequest, PaymentWebhookPayload, InvoiceResponse.
- `inventory.py`: ProductCreate, ProductUpdate, StockAdjustmentRequest, LowStockAlertResponse.
- `serial_tracking.py`: BarcodeScanRequest, SerialNumberMappingSchema, DispatchSlipResponse.
- `installation.py`: InstallationStepProgressUpdate, ElectricalTestingData, HandoverSignatureSchema.
- `warranty.py`: WarrantyCardResponse, WarrantyClaimRequest, WarrantyStatusUpdate.
- `maintenance.py`: ServiceTicketCreate, ServiceTicketUpdate, FaultCodeLookupResponse, RMAReplacementSchema.
- `employee.py`: EmployeeCreate, AttendanceCheckInRequest, ScheduleAssignmentSchema.
- `analytics.py`: DashboardKPIResponse, ProjectProfitLossResponse, SubsidyAgingResponse.

### 2.5 API Endpoints (`backend/app/api/`)
- `deps.py`: Shared dependencies (`get_db`, `get_current_user`, `get_current_active_admin`, `get_technician`).
- `v1/router.py`: Master v1 router aggregating all 13 module endpoints under `/api/v1`.
- `v1/auth.py`: `/api/v1/auth` (Login, OTP request/verify, token refresh, password recovery).
- `v1/public_calculator.py`: `/api/v1/public` (Solar savings calculator, subsidy guide, public enquiry).
- `v1/customers.py`: `/api/v1/customers` (Customer profiles, portal access, KYC documents).
- `v1/surveys.py`: `/api/v1/surveys` (Survey scheduling, feasibility reports, photo uploads with EXIF/GPS).
- `v1/quotations.py`: `/api/v1/quotations` (Dynamic BOM quoting, PDF download, customer approval).
- `v1/orders.py`: `/api/v1/orders` (Order management, status transitions).
- `v1/payments.py`: `/api/v1/payments` (Milestone checkout, Razorpay/Stripe webhooks, GST invoices).
- `v1/inventory.py`: `/api/v1/inventory` (SKU management, stock levels, warehouse transfers).
- `v1/dispatch.py`: `/api/v1/dispatch` (Barcode/QR scanning, packing lists, serial mapping).
- `v1/installations.py`: `/api/v1/installations` (Checklists, progress photos, electrical tests, customer sign-off).
- `v1/warranties.py`: `/api/v1/warranties` (Warranty registration, serial verification, expiry tracking).
- `v1/maintenance.py`: `/api/v1/maintenance` (Tickets, fault code dictionary, RMA replacements).
- `v1/employees.py`: `/api/v1/employees` (Employee records, geo-fenced attendance, scheduling).
- `v1/analytics.py`: `/api/v1/analytics` (Executive KPIs, project P&L, subsidy tracking).

### 2.6 Business Logic Services (`backend/app/services/`)
- `auth_service.py`: User registration, password verification, token issuance, Redis OTP logic.
- `calculator_service.py`: Sizing formulas ($kWh / (30 \times 4.2)$), roof area, subsidy deduction, 25-yr ROI.
- `crm_service.py`: Lead qualification, sales rep assignment, follow-up cadence automation.
- `survey_service.py`: Shading feasibility check, EXIF GPS coordinate verification, photo storage.
- `quotation_service.py`: Dynamic BOM generator (Tier-1 modules, inverters, structures, cables, BOS, GST).
- `order_service.py`: Order confirmation, coordination with inventory for stock reservation.
- `payment_service.py`: Payment order creation, webhook verification, invoice generation.
- `inventory_service.py`: Stock allocation, low-stock threshold alerts, warehouse transfers.
- `dispatch_service.py`: Barcode validation, mapping serials to orders, dispatch challan generation.
- `installation_service.py`: Step-by-step progress, test metric validation ($V_{oc}, I_{sc}, \text{Earth} < 5\Omega$), signature processing.
- `warranty_service.py`: Automated warranty registration on commissioning, expiration alerts.
- `maintenance_service.py`: Inverter fault code diagnostic lookup, SLA monitoring, RMA warranty claims.
- `employee_service.py`: Geo-fenced attendance validation ($\pm100\text{m}$), per-kW incentive calculation.
- `analytics_service.py`: Project-level margin calculation, subsidy receivables ledger, inventory valuation.

### 2.7 Workers, Templates, Migrations & Tests
- `app/workers/celery_app.py`: Background worker initialization with Redis broker.
- `app/workers/pdf_generator.py`: HTML-to-PDF rendering (WeasyPrint) for quotes, invoices, certificates.
- `app/workers/notification_worker.py`: Background SMS/WhatsApp Cloud API alerts and email dispatch.
- `app/templates/`: Jinja2 HTML templates (`quotation_template.html`, `invoice_template.html`, `handover_certificate_template.html`).
- `alembic/`: Database migration environment and version history (`env.py`, `script.py.mako`, `versions/`).
- `tests/`: Pytest configuration, fixtures (`conftest.py`), and test suites for auth, calculator, surveys, quotes.

---

## 3. Next Steps (Code Implementation Sequence)
When given the signal to write code, execution will proceed step-by-step:
1. Core settings, database engine & Redis client (`app/core/`).
2. SQLAlchemy Declarative Models (`app/models/`) & initial Alembic migration.
3. Pydantic Schemas (`app/schemas/`).
4. Auth & Security Service with JWT and Redis OTP (`app/services/auth_service.py`, `app/api/v1/auth.py`).
5. Business Services & Routers for all 13 modules.
6. Jinja2 + WeasyPrint PDF Generation Worker (`app/workers/`).
