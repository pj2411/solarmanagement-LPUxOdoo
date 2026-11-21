# 🛡️ Security Vulnerability Assessment & Hardening Audit

**Project:** SunPower Solar Installation Management System (SIMS / solarmanagement-LPUxOdoo)  
**Date of Audit:** November 21, 2026  
**Auditor:** Senior Security & Systems Architect  
**Scope:** Standalone Backend (`backend/`), Production Async Backend (`odoofinal/backend/`), and Frontend Client (`frontend/`)  
**Assumed Production Load:** ~40 concurrent rooftop EPC projects/month with ~15 field crew technicians, backoffice staff, and consumer portal access.

---

## 📑 Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Vulnerability Severity Matrix](#2-vulnerability-severity-matrix)
3. [🔴 MUST FIX: Critical & High Severity Vulnerabilities](#3--must-fix-critical--high-severity-vulnerabilities)
4. [🟡 SHOULD FIX: Medium Severity Risks & Hardening Gaps](#4--should-fix-medium-severity-risks--hardening-gaps)
5. [🟢 VERIFIED CONTROLS: Strong Existing Security Defenses](#5--verified-controls-strong-existing-security-defenses)
6. [🛠️ Step-by-Step Remediation Plan](#6-️-step-by-step-remediation-plan)

---

## 1. Executive Summary

This codebase implements a solar ERP across customer CRM, quotations, warehouse inventory, dispatch, field installation, and accounting.

The audit identified **5 High/Critical vulnerabilities** primarily originating from development/demo shortcuts in the standalone SQLite prototype (`backend/`), alongside **4 Medium-risk operational gaps** that must be addressed prior to deploying customer and field data onto public cloud infrastructure. Conversely, business logic gatekeepers (such as preventing unapproved survey quotations, stock reservations, and electrical testing safety $< 5\Omega$) are solidly enforced.

---

## 2. Vulnerability Severity Matrix

| ID | Vulnerability | Severity | Target Area | Exploit Impact |
|:---|:---|:---:|:---|:---|
| **VULN-01** | Unverified Passwords & Unsigned JWT Tokens | **CRITICAL** | `backend/main.py` | Full Account Takeover (Admin privilege spoofing) |
| **VULN-02** | Permissive Wildcard CORS with Credentials | **HIGH** | `backend/main.py` | Cross-Site Request Forgery / Malicious Data Exfiltration |
| **VULN-03** | Unsanitized File Upload & Missing Size Limits | **HIGH** | `backend/v1_routes.py` | Stored XSS / Disk Exhaustion / Path Traversal |
| **VULN-04** | Base64 Signature in URL Query Parameter | **MEDIUM** | `backend/main.py` | URL Log Leakage / HTTP 414 URI Too Long Failures |
| **VULN-05** | Static Secret Keys in Committed `.env` File | **MEDIUM** | `odoofinal/backend/.env` | Potential Token Forgery if repo is shared |
| **VULN-06** | JWT Tokens in Browser `localStorage` | **MEDIUM** | `frontend/src/api.js` | Token theft in the event of any XSS flaw |
| **VULN-07** | Missing Rate Limiting on OTP / Auth Endpoints | **MEDIUM** | `backend/v1_routes.py` | SMS/OTP flooding and brute-force attacks |
| **VULN-08** | Missing Security HTTP Response Headers | **LOW** | `backend/main.py` | Clickjacking & MIME-confusion attacks |

---

## 3. 🔴 MUST FIX: Critical & High Severity Vulnerabilities

### VULN-01: Unverified Passwords & Unsigned JWT Tokens
* **Location:** [backend/main.py](file:///Users/priyanshuraj/Downloads/solarmanagement-LPUxOdoo/backend/main.py#L43-L75) & [backend/v1_routes.py](file:///Users/priyanshuraj/Downloads/solarmanagement-LPUxOdoo/backend/v1_routes.py#L22-L65)
* **Type:** CWE-287: Improper Authentication / CWE-345: Insufficient Verification of Authenticity
* **Concrete Vulnerability:**
  In `backend/main.py` (lines 46–71), the `/api/auth/login` endpoint queries the database by email but **never verifies `payload.password` against `user.password_hash`**:
  ```python
  # Vulnerable Code:
  user = db.query(models.User).filter(func.lower(models.User.email) == email_clean).first()
  # Does not compare password!
  token = f"jwt_sunpower_{user.id}_{user.role}_{int(datetime.now(timezone.utc).timestamp())}"
  ```
  Furthermore, the issued token is a plain string (`jwt_sunpower_1_ADMIN_...`) without cryptographic signature (HMAC-SHA256). Any caller can manually manufacture an Authorization header: `Authorization: Bearer jwt_sunpower_1_ADMIN_9999999999` and bypass all admin access barriers.
* **Remediation:**
  * Adopt the production authentication pattern already implemented in [odoofinal/backend/app/core/security.py](file:///Users/priyanshuraj/Downloads/solarmanagement-LPUxOdoo/odoofinal/backend/app/core/security.py).
  * Use `passlib[bcrypt]` to hash and verify passwords: `verify_password(payload.password, user.password_hash)`.
  * Sign all JWT tokens using `python-jose` with a secure server-side `SECRET_KEY`.

---

### VULN-02: Permissive Wildcard CORS with Credentials
* **Location:** [backend/main.py](file:///Users/priyanshuraj/Downloads/solarmanagement-LPUxOdoo/backend/main.py#L26-L32)
* **Type:** CWE-942: Overly Permissive Cross-Domain Whitelist
* **Concrete Vulnerability:**
  ```python
  # Vulnerable Code:
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["*"],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```
  Allowing `*` (any origin) while enabling `allow_credentials=True` allows third-party malicious websites visited by logged-in users to issue credentialed cross-origin AJAX requests against the ERP backend.
* **Remediation:**
  Whitelist explicit origins in production:
  ```python
  allow_origins=[
      "http://localhost:5173",
      "https://portal.sunpower.in",
      "https://erp.sunpower.in"
  ]
  ```

---

### VULN-03: Unsanitized File Upload & Missing Size Limits
* **Location:** [backend/v1_routes.py](file:///Users/priyanshuraj/Downloads/solarmanagement-LPUxOdoo/backend/v1_routes.py#L155-L168)
* **Type:** CWE-434: Unrestricted Upload of File with Dangerous Type
* **Concrete Vulnerability:**
  ```python
  # Vulnerable Code:
  safe_filename = f"{int(datetime.now(timezone.utc).timestamp())}_{file.filename}"
  file_path = os.path.join(upload_dir, safe_filename)
  with open(file_path, "wb") as buffer:
      shutil.copyfileobj(file.file, buffer)
  ```
  1. **No Extension Whitelisting:** An attacker can upload `.html`, `.svg`, or `.exe` files. If served directly by a static web server, an uploaded `.svg` or `.html` file can execute JavaScript in the domain context (Stored Cross-Site Scripting).
  2. **No Payload Size Limit:** There is no maximum upload size constraint. Streaming massive multi-gigabyte files can exhaust server disk space (Denial of Service).
  3. **Path Traversal Risk:** If `file.filename` contains relative paths like `../../`, string concatenation can attempt writes outside the intended folder.
* **Remediation:**
  * Validate allowed MIME types (`image/jpeg`, `image/png`, `image/webp`).
  * Enforce maximum upload limit (e.g. 10 MB per photo).
  * Use Python's `os.path.basename` or generate a random UUID filename (e.g. `uuid.uuid4().hex + ".jpg"`).

---

## 4. 🟡 SHOULD FIX: Medium Severity Risks & Hardening Gaps

### VULN-04: Base64 Signature in URL Query Parameter
* **Location:** [backend/main.py](file:///Users/priyanshuraj/Downloads/solarmanagement-LPUxOdoo/backend/main.py#L583-L585)
* **Type:** CWE-598: Use of GET/Query Parameters with Sensitive Info
* **Concrete Vulnerability:**
  In the legacy endpoint:
  ```python
  @app.post("/api/installations/{id}/complete")
  def complete_installation(id: int, customer_signature_base64: str = Query(...)):
  ```
  Canvas PNG base64 strings range from 15 KB to 80 KB. Placing base64 payload into a query parameter exceeds standard reverse proxy URI limits (NGINX/Cloudflare default max URI length is ~8 KB), resulting in `HTTP 414 URI Too Long`. It also bloats access log files with raw image data.
* **Remediation:**
  Deprecate query-param signature and strictly use the JSON request body schema in `/api/v1/installations/{id}/handover`:
  ```json
  { "customer_signature_base64": "data:image/png;base64,..." }
  ```

---

### VULN-05: Committed Static Secrets in `.env`
* **Location:** [odoofinal/backend/.env](file:///Users/priyanshuraj/Downloads/solarmanagement-LPUxOdoo/odoofinal/backend/.env)
* **Type:** CWE-798: Use of Hard-coded Credentials
* **Concrete Vulnerability:**
  The `.env` file in the extracted archive contains static secrets:
  `SECRET_KEY=sims_super_secret_jwt_key_2026_production_grade_random_seed` and mock Razorpay secrets.
* **Remediation:**
  * Add `.env` to `.gitignore`.
  * Only commit `.env.example` with empty placeholder values.
  * Supply `SECRET_KEY` via production container environment injection.

---

### VULN-06: LocalStorage JWT Storage
* **Location:** [frontend/src/api.js](file:///Users/priyanshuraj/Downloads/solarmanagement-LPUxOdoo/frontend/src/api.js#L5)
* **Type:** CWE-922: Insecure Storage of Sensitive Information
* **Concrete Vulnerability:**
  Tokens are retrieved and stored directly in `window.localStorage`. While common in single-page apps, any third-party script or XSS vulnerability allows complete extraction of `localStorage.getItem('token')`.
* **Remediation:**
  In high-security production environments, migrate refresh tokens to `HttpOnly`, `SameSite=Strict`, `Secure` cookies so JavaScript cannot directly read the token.

---

### VULN-07: Missing Rate Limiting on Authentication & OTP
* **Location:** [backend/v1_routes.py](file:///Users/priyanshuraj/Downloads/solarmanagement-LPUxOdoo/backend/v1_routes.py#L67-L115)
* **Type:** CWE-307: Improper Restriction of Excessive Authentication Attempts
* **Concrete Vulnerability:**
  Neither `/api/v1/auth/request-otp` nor `/api/v1/auth/verify-otp` enforce IP or phone number rate limits in the standalone backend. An automated bot can trigger hundreds of SMS requests (causing SMS billing exhaustion) or brute-force 6-digit OTP codes.
* **Remediation:**
  * Use Redis rate limiting (already scaffolded in [odoofinal/backend/app/core/redis.py](file:///Users/priyanshuraj/Downloads/solarmanagement-LPUxOdoo/odoofinal/backend/app/core/redis.py)).
  * Enforce maximum 3 OTP requests per phone number per hour, and 5 failed verification attempts before 15-minute lock.

---

## 5. 🟢 VERIFIED CONTROLS: Strong Existing Security Defenses

The codebase already enforces several enterprise-grade security and business guarantees:

1. **SQL Injection Immune**:
   All database queries in both backends strictly utilize SQLAlchemy ORM filter expressions (`models.CustomerLead.phone == ...`) and parameterized statements. Zero raw SQL string concatenation exists in the codebase.
2. **Mandatory Survey Feasibility Gatekeeper (Rule 1)**:
   A salesperson cannot issue a legally binding quotation before a certified field technician completes and approves the rooftop structural and shading survey (`site_surveys.is_approved == True`).
3. **Hardware Stockout Protection (Rule 2)**:
   Order confirmation atomically explodes the Bill of Materials and reserves hardware units from physical warehouse stock, preventing double-allocation attacks.
4. **Physical Electrical Safety Gatekeeper (< 5Ω)**:
   The handover endpoint in `/api/v1/installations/{id}/handover` rejects project completion if Earth Resistance $\ge 5\Omega$, ensuring the electrical earthing pit adheres to IS 3043 / CEA safety standards before grid synchronization.
5. **Deterministic Warranty Engine (Rule 3)**:
   Serial number tracking automatically calculates non-repudiable 20-Year (Modules) or 2-Year (Inverters) warranties on delivery confirmation, preventing retroactive warranty tampering.

---

## 6. 🛠️ Step-by-Step Remediation Plan

```mermaid
flowchart TD
    A["Vulnerability Audit Identified"] --> B["Phase 1: Immediate Fixes (Dev Environment)"]
    A --> C["Phase 2: Production Hardening (Deployment)"]
    
    B --> B1["Replace query-param signature with JSON body in /handover"]
    B --> B2["Restrict CORS allow_origins to frontend URLs"]
    B --> B3["Add File Extension & 10MB Limit to /media/upload"]
    
    C --> C1["Switch to odoofinal PostgreSQL Backend with Passlib/Bcrypt"]
    C --> C2["Inject high-entropy SECRET_KEY via Docker Secrets"]
    C --> C3["Activate Redis OTP Rate-Limiter (max 3 SMS/hr)"]
    C --> C4["Add Security Headers (CSP, HSTS, X-Frame-Options)"]
```

### Action Items Summary:
1. **Frontend / API Sync:** Keep using `api.handoverInstallation(id, payload)` (JSON body) instead of legacy query string endpoint.
2. **Production Switch:** When going live, deploy the `odoofinal/backend` container which already includes Bcrypt password verification, PostgreSQL connection pooling, and Redis OTP caching.
3. **Environment Security:** Ensure `.env` is never checked into public version control; inject credentials via environment variables during CI/CD.
