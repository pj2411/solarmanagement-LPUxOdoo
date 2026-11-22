# SunPower Backend (FastAPI + PostgreSQL + Redis + OAuth2)

Lives at `frontend/backend`. Every screen in the React app is backed by these
tables and endpoints — no hardcoded catalogue data in the UI.

## 1. Run

### Docker (full stack: API + PostgreSQL + Redis)
```powershell
cd frontend\backend
Copy-Item .env.example .env     # already created locally
docker compose up --build -d
docker compose exec api python seed.py
```
- API: http://localhost:8000/docs
- Postgres: `localhost:5433` (db/user/password: `sunpower`)
- Redis: `localhost:6379`

### Local Python (containers still provide DB + Redis)
```powershell
cd frontend\backend
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
.\.venv\Scripts\python seed.py
.\.venv\Scripts\python -m uvicorn app.main:app --reload
```

## 2. Demo logins (seeded)

| Email | Password | Role |
|---|---|---|
| admin@sunpower.in | demo2026 | ADMIN |
| sales@sunpower.in | demo2026 | SALES |
| tech.ramesh.sharma@sunpower.in | demo2026 | TECHNICIAN |
| warehouse@sunpower.in | demo2026 | WAREHOUSE |
| support@sunpower.in | demo2026 | SUPPORT |
| arvind.sharma@gmail.com | demo2026 | CUSTOMER |

## 3. Auth

- **OAuth2 password grant** — `POST /api/v1/auth/login` with JSON
  `{email, password}` → `{access_token, refresh_token, token_type, user}`.
  Send `Authorization: Bearer <access_token>` on protected calls
  (`GET /api/auth/me`).
- **Refresh** — `POST /api/v1/auth/refresh` with `{refresh_token}`.
- **OTP** — `POST /api/v1/auth/request-otp` → code (returned in `otp` in dev),
  then `POST /api/v1/auth/verify-otp` → tokens. Forgot/reset use the same store.
- **Google / GitHub OAuth2 authorization code**
  1. `GET /api/v1/auth/oauth/google` (or `/github`) → redirects to provider.
  2. Register `http://localhost:8000/api/v1/auth/oauth/<provider>/callback`
     as the OAuth redirect URI.
  3. Callback redirects to `OAUTH_FRONTEND_CALLBACK` with tokens in query.
  Set `GOOGLE_CLIENT_ID/SECRET` and `GITHUB_CLIENT_ID/SECRET` in `.env`.

OTP codes, OAuth `state`, login rate-limit counters and all read caches live in
**Redis** (with an in-process fallback if Redis is briefly unavailable).

## 4. Endpoint map (frontend `src/api.js` contract)

| Area | Endpoints |
|---|---|
| Meta | `GET /api/health`, `/api/roles` |
| Auth | `POST /api/auth/register`, `/api/v1/auth/login`, `/refresh`, `/request-otp`, `/verify-otp`, `/api/auth/forgot-password`, `/reset-password`, `GET /api/auth/me` |
| CRM | `/api/leads` (GET/POST/PUT), `/api/surveys` (+ `/approve`), `/api/quotations` (+ `/approve`), `/api/bom/templates`, `/api/bom/calculate` |
| Operations | `/api/inventory` (+ `/restock`), `/api/orders` (+ `/pay`, `/subsidy`), `/api/warehouse/serials`, `/dispatch`, `/delivery-confirm/{serial}`, `/api/installations` (+ update, `/sync`, `/handover`, `/complete`), `/api/v1/media/upload` |
| Support | `/api/tickets`, `/api/employees`, `/api/employees/{id}/jobs`, attendance (v1 + legacy) |
| Analytics | `GET /api/analytics`, `POST /api/analytics/expenses` |
| Dynamic public site | `GET /api/public/site` (settings + packages + products + testimonials + FAQs) |

All list responses use `{ "success": true, "data": [...] }`, which `api.js`
unwraps automatically.

## 5. Business rules

- Quotation requires an **approved survey** (409 otherwise).
- BOM is computed from `bom_templates` rows; subsidy capped at ₹15,000.
- Dispatch decrements stock, moves serial to `IN_TRANSIT` in one transaction.
- Delivery confirmation starts warranty: panel 240 months, inverter/battery 24,
  others 12.
- Tickets are free in warranty; closing requires `customer_confirmed: true`.
- Attendance upserts per employee per day (unique constraint).

## 6. Reset demo data

```powershell
docker compose down -v      # destroys DB + Redis volumes
docker compose up -d db redis
.\.venv\Scripts\python seed.py
```
