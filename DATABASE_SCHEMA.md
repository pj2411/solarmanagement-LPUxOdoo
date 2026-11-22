# SIMS Database Schema (PostgreSQL 16)

**Database:** `sims_db` · **Container:** `sims_postgres_db` · **Host port:** `5433` → container `5432`
**App access:** async SQLAlchemy 2.0 + asyncpg (see `backend/app/core/database.py`)
**Schema source of truth:** `backend/app/models/*.py` · **Migrations:** `backend/alembic/versions/`
**Current Alembic revision:** `a1b2c3d4e5f6`

> 21 tables in `public` = **20 application tables + 1 Alembic metadata table** (`alembic_version`).
> Live counts (verified): **266 columns, 31 foreign keys**, `service_tickets` has 22 columns.

## Live proof commands

```powershell
docker exec -it sims_postgres_db psql -U postgres -d sims_db
\dt                      -- list all 21 tables
\d service_tickets       -- describe one table
\q
```

Or one command: `powershell -ExecutionPolicy Bypass -File backend/show_db.ps1`

---

## 0. Conventions (har table me ye 3 columns hote hain)

Every application table inherits from `BaseModel` (`app/models/base.py`):

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PRIMARY KEY, indexed, generated in Python (`uuid.uuid4`) |
| `created_at` | `timestamptz` | NOT NULL, server default `now()` |
| `updated_at` | `timestamptz` | NOT NULL, server default `now()`, auto-updated |

**Enums** are stored as `VARCHAR(50)` with Python-side validation (`native_enum=False`), so values can
change without an expensive DB enum migration.

---

## 1. Entity relationship map (foreign keys)

```
users
 ├── customers.user_id            (SET NULL, unique)
 ├── employees.user_id            (CASCADE, unique)
 ├── leads.assigned_sales_rep_id  (SET NULL)
 ├── site_surveys.technician_id / approved_by_id (SET NULL)
 ├── installation_jobs.lead_technician_id (SET NULL)
 └── service_tickets.assigned_technician_id (SET NULL)

customers
 ├── leads.customer_id            (CASCADE)
 ├── quotations.customer_id       (CASCADE)
 ├── orders.customer_id           (RESTRICT)
 ├── warranty_records.customer_id (CASCADE)
 └── service_tickets.customer_id  (CASCADE)

leads ── quotations.lead_id, site_surveys.lead_id   (CASCADE)
quotations ── orders.quotation_id                    (RESTRICT, unique)

orders
 ├── payment_milestones.order_id   (CASCADE)
 ├── invoices.order_id             (CASCADE)
 ├── installation_jobs.order_id    (CASCADE, unique)
 ├── serial_items.order_id         (SET NULL)
 ├── warranty_records.order_id     (CASCADE)
 ├── project_pnl_ledgers.order_id  (CASCADE, unique)
 └── subsidy_claims.order_id       (CASCADE)

payment_milestones ── invoices.milestone_id          (SET NULL)
products ── stock_items.product_id                   (CASCADE)
products ── serial_items.product_id                  (RESTRICT)
warehouses ── stock_items.warehouse_id               (CASCADE)
warehouses ── serial_items.warehouse_id              (RESTRICT)
serial_items ── warranty_records.serial_item_id      (RESTRICT, unique)
serial_items ── service_tickets.replacement_serial_id (SET NULL)
warranty_records ── service_tickets.warranty_id      (SET NULL)
employees ── attendance_logs.employee_id             (CASCADE)
```

---

## 2. Module 01–03 — Users, Customers, Leads

### `users` — auth + RBAC
| Column | Type | Constraints |
|---|---|---|
| email | varchar(255) | unique, indexed, nullable |
| phone | varchar(20) | unique, indexed, NOT NULL |
| hashed_password | varchar(255) | nullable (OTP-only users) |
| full_name | varchar(150) | NOT NULL |
| role | varchar(50) | NOT NULL, indexed — `UserRole` enum |
| is_active | boolean | NOT NULL, default true |
| is_verified | boolean | NOT NULL, default false |

`UserRole`: `super_admin`, `sales_exec`, `survey_tech`, `design_eng`, `warehouse_mgr`,
`install_tech`, `qc_inspector`, `support_agent`, `customer`

### `customers` — KYC + DISCOM details
| Column | Type | Constraints |
|---|---|---|
| user_id | uuid | FK → users (SET NULL), unique, nullable |
| full_name | varchar(150) | NOT NULL, indexed |
| phone | varchar(20) | NOT NULL, indexed |
| email | varchar(255) | nullable |
| address | text | NOT NULL |
| city / state | varchar(100) | NOT NULL |
| pincode | varchar(20) | NOT NULL, indexed |
| latitude / longitude | float | nullable |
| discom_provider | varchar(150) | nullable |
| consumer_number | varchar(100) | indexed, nullable |
| sanctioned_load_kw | float | nullable |
| electricity_bill_url / roof_ownership_proof_url | varchar(500) | nullable |

### `leads` — CRM pipeline
| Column | Type | Constraints |
|---|---|---|
| customer_id | uuid | FK → customers (CASCADE), NOT NULL, indexed |
| source | varchar(100) | default `website_calculator` |
| monthly_bill / monthly_kwh | float | nullable |
| roof_area_sqft / recommended_kw | float | nullable |
| status | varchar(50) | default `new`, indexed |
| assigned_sales_rep_id | uuid | FK → users (SET NULL) |
| notes | text | nullable |

`LeadStatus`: `new`, `contacted`, `survey_scheduled`, `survey_completed`, `quoted`, `negotiation`, `won`, `lost`

---

## 3. Module 04–05 — Survey & Quotation

### `site_surveys` — site engineering report
| Column | Type | Constraints |
|---|---|---|
| lead_id | uuid | FK → leads (CASCADE), NOT NULL, indexed |
| technician_id / approved_by_id | uuid | FK → users (SET NULL) |
| scheduled_date / completed_at | timestamptz | nullable |
| roof_type | varchar(50) | default `rcc_flat` |
| tilt_angle_deg | float | default 15 |
| azimuth_angle_deg | float | default 180 (South) |
| shadow_free_area_sqft | float | default 0 |
| dc_cable_distance_m / ac_cable_distance_m | float | default 0 |
| earthing_pit_count | integer | default 2 |
| photos | jsonb | default `[]` (URL, caption, lat, lng, timestamp) |
| **feasibility_status** | varchar(50) | default `pending`, indexed |
| engineering_notes | text | nullable |

`FeasibilityStatus`: `pending`, `feasible`, `feasible_with_modifications`, `rejected`
> **PS gate:** quotation is blocked unless this is `feasible` or `feasible_with_modifications`.

### `quotations` — quote + BOM snapshot
| Column | Type | Constraints |
|---|---|---|
| lead_id / customer_id | uuid | FK → leads / customers (CASCADE), indexed |
| quote_number | varchar(50) | unique, indexed |
| version | integer | default 1 |
| system_capacity_kw | float | NOT NULL (1–5 kW) |
| topology | varchar(50) | default `on_grid` |
| gross_amount / net_payable_amount | float | NOT NULL |
| subsidy_amount / discount_amount / tax_amount | float | default 0 |
| bom_snapshot | jsonb | default `[]` (SKU, qty, price, warranty_years) |
| status | varchar(50) | default `draft`, indexed |
| customer_signature_url | varchar(500) | nullable |
| approved_at | timestamptz | nullable |
| pdf_url | varchar(500) | nullable |

`SystemTopology`: `on_grid`, `off_grid`, `hybrid` · `QuotationStatus`: `draft`, `sent`, `approved`, `rejected`, `expired`

---

## 4. Module 06 — Orders, Payments, Invoices

### `orders`
| Column | Type | Constraints |
|---|---|---|
| order_number | varchar(50) | unique, indexed |
| quotation_id | uuid | FK → quotations (RESTRICT), unique, NOT NULL |
| customer_id | uuid | FK → customers (RESTRICT), indexed |
| total_amount / balance_due | float | NOT NULL |
| subsidy_receivable / amount_paid | float | default 0 |
| status | varchar(50) | default `confirmed`, indexed |

`OrderStatus`: `confirmed`, `in_procurement`, `ready_for_dispatch`, `dispatched`,
`installation_in_progress`, `testing_qa`, `commissioned`, `closed`, `cancelled`

### `payment_milestones` — 20% / 60% / 20%
| Column | Type | Constraints |
|---|---|---|
| order_id | uuid | FK → orders (CASCADE), indexed |
| milestone_name | varchar(50) | `MilestoneType` enum |
| percentage / amount | float | NOT NULL |
| status | varchar(50) | default `pending`, indexed |
| gateway_order_id / gateway_payment_id | varchar(100) | nullable |
| paid_at | timestamptz | nullable |

`MilestoneType`: `advance_booking`, `pre_dispatch`, `commissioning_handover` ·
`PaymentStatus`: `pending`, `paid`, `overdue`, `waived`

### `invoices` — GST tax invoice
| Column | Type | Constraints |
|---|---|---|
| order_id | uuid | FK → orders (CASCADE), indexed |
| milestone_id | uuid | FK → payment_milestones (SET NULL) |
| invoice_number | varchar(50) | unique, indexed |
| invoice_type | varchar(50) | default `tax_invoice` |
| base_amount / total_amount | float | NOT NULL |
| cgst_amount / sgst_amount / igst_amount | float | default 0 |
| pdf_url | varchar(500) | nullable |
| is_paid | boolean | default false |

---

## 5. Module 07–08 — Inventory & Serial Tracking

### `products` (SKU master)
`sku` varchar(50) unique indexed · `name` varchar(150) · `category` varchar(50) indexed
(`panel/inverter/battery/structure/cable/bos/safety`) · `manufacturer` varchar(100) ·
`model_number` varchar(100) · `wattage_or_rating` varchar(50) · `unit_of_measure` varchar(20) default `nos` ·
`unit_cost` float · `selling_price` float · `min_threshold_alert` integer default 10 ·
`is_serialized` boolean default false · `specifications` jsonb default `{}`

### `warehouses`
`name` varchar(100) · `code` varchar(20) unique indexed · `address` varchar(255) ·
`city` varchar(100) · `is_active` boolean default true

### `stock_items`
`product_id` FK → products (CASCADE) indexed · `warehouse_id` FK → warehouses (CASCADE) indexed ·
`quantity_on_hand` integer default 0 · `quantity_reserved` integer default 0

### `serial_items` — 1 serial = 1 order
| Column | Type | Constraints |
|---|---|---|
| product_id / warehouse_id | uuid | FK (RESTRICT), indexed |
| order_id | uuid | FK → orders (SET NULL), indexed, nullable |
| serial_number | varchar(100) | unique, indexed |
| barcode | varchar(100) | indexed, nullable |
| current_status | varchar(50) | default `in_warehouse`, indexed |
| dispatched_at / installed_at | timestamptz | nullable |

`SerialStatus`: `in_warehouse`, `reserved`, `dispatched`, `installed`, `defective`, `returned_rma`

---

## 6. Module 09–10 — Installation & Warranty

### `installation_jobs`
| Column | Type | Constraints |
|---|---|---|
| order_id | uuid | FK → orders (CASCADE), unique |
| lead_technician_id | uuid | FK → users (SET NULL) |
| scheduled_date / start_time / finish_time | timestamptz | nullable |
| status | varchar(50) | default `scheduled`, indexed |
| structure_mounting_completed / panel_clamping_completed | boolean | default false |
| inverter_wiring_completed / earthing_pits_completed | boolean | default false |
| voc_measured / isc_measured | float | nullable (electrical QA) |
| earth_resistance_ohms | float | nullable (**must be < 5 Ω**) |
| grid_synchronization_tested | boolean | default false |
| step_photos | jsonb | default `[]` |
| customer_signature_url / commissioning_certificate_url | varchar(500) | nullable |
| customer_sign_name | varchar(150) | nullable |

`InstallationStatus`: `scheduled`, `in_progress`, `testing_qa`, `completed`, `failed`

### `warranty_records` — PS rule table
| Column | Type | Constraints |
|---|---|---|
| customer_id | uuid | FK → customers (CASCADE), indexed |
| serial_item_id | uuid | FK → serial_items (RESTRICT), unique |
| order_id | uuid | FK → orders (CASCADE), indexed |
| component_type | varchar(50) | indexed — `WarrantyComponent` enum |
| warranty_years | integer | column default 5; **service writes 20 / 2 / 2** |
| **start_date** | timestamptz | NOT NULL — **delivery confirmation date** |
| expiry_date | timestamptz | NOT NULL, indexed |
| status | varchar(50) | default `active`, indexed |
| certificate_url | varchar(500) | nullable |

`WarrantyComponent`: `solar_panel` (20 yr), `inverter` (2 yr), `battery` (2 yr), `workmanship_amc` (1–5 yr)
`WarrantyStatus`: `active`, `expiring_soon`, `expired`, `voided`

---

## 7. Module 11 — Service & Maintenance

### `service_tickets` — includes the new PS billing/closure columns
| Column | Type | Constraints |
|---|---|---|
| ticket_number | varchar(50) | unique, indexed (`TCK-SIMS-00001`) |
| customer_id | uuid | FK → customers (CASCADE), indexed |
| warranty_id | uuid | FK → warranty_records (SET NULL) |
| assigned_technician_id | uuid | FK → users (SET NULL) |
| fault_code | varchar(50) | indexed, nullable |
| description | text | NOT NULL |
| priority | varchar(50) | default `medium` |
| status | varchar(50) | default `open`, indexed |
| reported_at / resolved_at | timestamptz | reported NOT NULL |
| resolution_summary | text | nullable |
| **in_warranty** | boolean | default false |
| **parts_cost / labour_cost / billable_amount** | float | default 0 |
| **customer_confirmed** | boolean | default false |
| **closed_at** | timestamptz | nullable |
| rma_number | varchar(100) | nullable |
| replacement_serial_id | uuid | FK → serial_items (SET NULL) |

`TicketStatus`: `open`, `assigned`, `in_progress`, `resolved`, `closed` ·
`TicketPriority`: `low`, `medium`, `high`, `critical`
> Billing rule: in-warranty → all charges 0; out-of-warranty → `1500 + 500×hours + parts`.
> Ticket closes **only** after `customer_confirmed = true` and status `resolved`.

### `fault_codes` — inverter diagnostic dictionary
`fault_code` varchar(50) unique indexed · `inverter_brand` varchar(100) default `Generic` ·
`title` varchar(150) · `description` text · `recommended_actions` text · `severity` varchar(50) default `medium`

---

## 8. Module 12–13 — Employees & Analytics

### `employees`
`user_id` FK → users (CASCADE) unique · `employee_code` varchar(50) unique indexed ·
`designation` varchar(100) · `department` varchar(100) · `skill_tags` jsonb default `[]` ·
`is_field_tech` boolean default false · `base_salary` float default 0 ·
`per_kw_incentive_rate` float default 500 · `joining_date` timestamptz

### `attendance_logs` — geo-fenced check-in
`employee_id` FK → employees (CASCADE) indexed · `check_in_time` / `check_out_time` timestamptz ·
`latitude` / `longitude` float · `site_address` varchar(255) ·
`distance_from_site_meters` float · `is_geofence_verified` boolean default false

### `project_pnl_ledgers`
`order_id` FK → orders (CASCADE) unique · `contract_revenue` float ·
`cogs_panels` / `cogs_inverters` / `cogs_structures` / `cogs_bos` float default 0 ·
`labor_cost` / `logistics_cost` / `liaisoning_overhead` float default 0 ·
`net_profit_margin` float · `computed_at` timestamptz

### `subsidy_claims`
`order_id` FK → orders (CASCADE) indexed · `claim_reference_no` varchar(100) unique indexed ·
`scheme_name` varchar(150) default `PM Surya Ghar Muft Bijli Yojana` · `sanctioned_amount` float ·
`status` varchar(50) default `application_draft` indexed · `submitted_at` / `disbursed_at` timestamptz

`SubsidyStatus`: `application_draft`, `submitted_to_portal`, `discom_inspection_pending`,
`approved_for_disbursal`, `disbursed`, `rejected`

### `alembic_version` (migration metadata, not an app table)
`version_num` varchar(32) PRIMARY KEY — current value: `a1b2c3d4e5f6`

---

## 9. Judge one-liner

> *"20 application tables across 13 modules, all with UUID primary keys and timestamps, connected by
> explicit foreign keys with deliberate cascade rules. Enums are varchar + Python validation for
> cheap changes. Schema is Alembic-versioned — current revision added the warranty billing and
> customer-confirmation columns needed by the problem statement."*
