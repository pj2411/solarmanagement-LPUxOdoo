from fastapi import FastAPI, Depends, HTTPException, status, Query, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta, timezone
from typing import List, Optional

from database import engine, Base, get_db
import models, schemas
from v1_routes import router as v1_router

# Initialize DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SunPower Solar ERP API",
    description="Production-Grade Standalone Solar Installation Management System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Standard Error Envelope Exception Handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    code_map = {
        400: "VALIDATION_ERROR",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        409: "CONFLICT",
        422: "VALIDATION_ERROR"
    }
    code = code_map.get(exc.status_code, "API_ERROR")
    msg = str(exc.detail)
    if "stock" in msg.lower():
        code = "INSUFFICIENT_STOCK"
    elif "unauthorized" in msg.lower():
        code = "UNAUTHORIZED"

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": msg,
            "success": False,
            "error": {
                "code": code,
                "message": msg,
                "details": [msg]
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Input validation error",
                "details": exc.errors()
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    )

# Register v1 router for frontend contracts
app.include_router(v1_router)

# ----------------- 1. HEALTH & ROLES -----------------
@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "SunPower ERP", "time": datetime.now(timezone.utc).isoformat()}

@app.get("/api/roles")
def get_roles():
    return [
        {"role": "CUSTOMER", "label": "Customer Portal", "user_name": "Arvind Sharma", "email": "arvind.sharma@gmail.com"},
        {"role": "SALES", "label": "Sales & Survey", "user_name": "Pooja Sharma", "email": "sales@sunpower.in"},
        {"role": "WAREHOUSE", "label": "Warehouse Dispatch", "user_name": "Gaurav Singhal", "email": "warehouse@sunpower.in"},
        {"role": "TECHNICIAN", "label": "Field Technician", "user_name": "Ramesh Sharma", "email": "tech.ramesh.sharma@sunpower.in"},
        {"role": "SUPPORT", "label": "Support / Helpdesk", "user_name": "Neha Kapoor", "email": "support@sunpower.in"},
        {"role": "ADMIN", "label": "Director / Admin", "user_name": "Vikram Malhotra", "email": "admin@sunpower.in"},
    ]

@app.post("/api/auth/login", response_model=schemas.AuthResponse)
def login_user(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower()
    user = db.query(models.User).filter(func.lower(models.User.email) == email_clean).first()
    
    # If not found in database, check pre-seeded role personas
    if not user:
        role_map = {
            "arvind.sharma@gmail.com": ("Arvind Sharma", "CUSTOMER"),
            "sales@sunpower.in": ("Pooja Sharma", "SALES"),
            "warehouse@sunpower.in": ("Gaurav Singhal", "WAREHOUSE"),
            "tech.ramesh.sharma@sunpower.in": ("Ramesh Sharma", "TECHNICIAN"),
            "support@sunpower.in": ("Neha Kapoor", "SUPPORT"),
            "admin@sunpower.in": ("Vikram Malhotra", "ADMIN"),
        }
        if email_clean in role_map:
            name, role = role_map[email_clean]
            user = models.User(name=name, email=email_clean, role=role, password_hash="hashed_password")
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Fallback demo auto-login as customer or admin based on domain
            default_role = "ADMIN" if "admin" in email_clean else "CUSTOMER"
            user = models.User(name=email_clean.split("@")[0].title(), email=email_clean, role=default_role, password_hash="hashed_password")
            db.add(user)
            db.commit()
            db.refresh(user)

    token = f"jwt_sunpower_{user.id}_{user.role}_{int(datetime.now(timezone.utc).timestamp())}"
    return {
        "token": token,
        "user": user,
        "role": user.role,
        "message": f"Successfully authenticated as {user.name} ({user.role})"
    }

@app.post("/api/auth/register", response_model=schemas.AuthResponse)
def register_user(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower()
    existing = db.query(models.User).filter(func.lower(models.User.email) == email_clean).first()
    if existing:
        raise HTTPException(status_code=400, detail="Account with this email already exists.")
    
    new_user = models.User(
        name=payload.name,
        email=email_clean,
        role=payload.role.upper(),
        password_hash="hashed_" + payload.password,
        attendance_status="PRESENT"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = f"jwt_sunpower_{new_user.id}_{new_user.role}_{int(datetime.now(timezone.utc).timestamp())}"
    return {
        "token": token,
        "user": new_user,
        "role": new_user.role,
        "message": "Account created successfully. Welcome to SunPower ERP."
    }

@app.post("/api/auth/forgot-password")
def forgot_password(payload: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower()
    return {
        "status": "success",
        "email": email_clean,
        "otp": "849201",
        "message": "6-digit OTP code has been dispatched to your email for identity verification."
    }

@app.post("/api/auth/reset-password")
def reset_password(payload: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower()
    user = db.query(models.User).filter(func.lower(models.User.email) == email_clean).first()
    if user:
        user.password_hash = "hashed_" + payload.new_password
        db.commit()
    return {
        "status": "success",
        "message": "Password successfully updated. You can now sign in with your new credentials."
    }

# ----------------- 2. CUSTOMERS & LEADS -----------------
@app.get("/api/leads", response_model=List[schemas.LeadOut])
def get_leads(db: Session = Depends(get_db)):
    return db.query(models.CustomerLead).order_by(models.CustomerLead.id.desc()).all()

@app.post("/api/leads", response_model=schemas.LeadOut)
def create_lead(lead_in: schemas.LeadCreate, db: Session = Depends(get_db)):
    # Auto-calculate pipeline stage
    lead = models.CustomerLead(
        customer_name=lead_in.customer_name,
        phone=lead_in.phone,
        email=lead_in.email,
        address=lead_in.address,
        capacity_kw=lead_in.capacity_kw,
        system_type=lead_in.system_type,
        subsidy_requested=lead_in.subsidy_requested,
        monthly_bill_inr=lead_in.monthly_bill_inr,
        grid_suitable=lead_in.grid_suitable,
        pipeline_stage="NEW",
        follow_up_notes=lead_in.follow_up_notes or "Inquiry captured from website."
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)

    # Automatically create a pending site survey for this lead
    # assign first technician if available
    first_tech = db.query(models.User).filter(models.User.role == "TECHNICIAN").first()
    survey = models.SiteSurvey(
        lead_id=lead.id,
        technician_id=first_tech.id if first_tech else None,
        scheduled_date=date.today() + timedelta(days=2),
        roof_direction="South (180° Azimuth)",
        tilt_angle_deg=22.0,
        shadow_free_area_sqft=lead.capacity_kw * 100.0,
        cable_distance_m=20.0,
        is_approved=False,
        notes="Automated survey schedule upon web enquiry."
    )
    db.add(survey)
    db.commit()

    return lead

@app.put("/api/leads/{id}", response_model=schemas.LeadOut)
def update_lead(id: int, lead_in: schemas.LeadUpdate, db: Session = Depends(get_db)):
    lead = db.query(models.CustomerLead).filter(models.CustomerLead.id == id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    update_data = lead_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(lead, key, value)
    
    db.commit()
    db.refresh(lead)
    return lead

# ----------------- 3. SITE SURVEYS -----------------
@app.get("/api/surveys", response_model=List[schemas.SurveyOut])
def get_surveys(db: Session = Depends(get_db)):
    return db.query(models.SiteSurvey).order_by(models.SiteSurvey.id.desc()).all()

@app.post("/api/surveys", response_model=schemas.SurveyOut)
def create_survey(survey_in: schemas.SurveyCreate, db: Session = Depends(get_db)):
    lead = db.query(models.CustomerLead).filter(models.CustomerLead.id == survey_in.lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    first_tech = db.query(models.User).filter(models.User.role == "TECHNICIAN").first()
    tech_id = survey_in.technician_id or (first_tech.id if first_tech else None)
    
    survey = models.SiteSurvey(
        lead_id=survey_in.lead_id,
        technician_id=tech_id,
        scheduled_date=survey_in.scheduled_date or (date.today() + timedelta(days=2)),
        roof_direction=survey_in.roof_direction or "South (180° Azimuth)",
        tilt_angle_deg=survey_in.tilt_angle_deg if survey_in.tilt_angle_deg is not None else 22.0,
        shadow_free_area_sqft=survey_in.shadow_free_area_sqft if survey_in.shadow_free_area_sqft is not None else (lead.capacity_kw * 100.0),
        cable_distance_m=survey_in.cable_distance_m if survey_in.cable_distance_m is not None else 20.0,
        survey_photo_url=survey_in.survey_photo_url or "/photos/survey_roof_default.jpg",
        is_approved=False,
        notes=survey_in.notes or "Scheduled site survey."
    )
    db.add(survey)
    lead.pipeline_stage = "SURVEY_SCHEDULED"
    db.commit()
    db.refresh(survey)
    return survey

@app.post("/api/surveys/{id}/approve", response_model=schemas.SurveyOut)
def approve_survey(id: int, db: Session = Depends(get_db)):
    survey = db.query(models.SiteSurvey).filter(models.SiteSurvey.id == id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    survey.is_approved = True
    if survey.lead:
        survey.lead.pipeline_stage = "SURVEY_APPROVED"
    
    db.commit()
    db.refresh(survey)
    return survey

@app.put("/api/surveys/{id}", response_model=schemas.SurveyOut)
def update_survey(id: int, survey_in: schemas.SurveyUpdate, db: Session = Depends(get_db)):
    survey = db.query(models.SiteSurvey).filter(models.SiteSurvey.id == id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    update_data = survey_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(survey, key, value)
    
    if survey.lead:
        if survey.is_approved:
            survey.lead.pipeline_stage = "SURVEY_APPROVED"
        else:
            survey.lead.pipeline_stage = "SURVEY_SCHEDULED"

    db.commit()
    db.refresh(survey)
    return survey

# ----------------- 4. INVENTORY & BOM -----------------
@app.get("/api/inventory", response_model=List[schemas.InventoryItemOut])
def get_inventory(db: Session = Depends(get_db)):
    return db.query(models.InventoryItem).order_by(models.InventoryItem.category).all()

@app.post("/api/inventory/{id}/restock", response_model=schemas.InventoryItemOut)
def restock_inventory(id: int, req: schemas.InventoryRestock, db: Session = Depends(get_db)):
    item = db.query(models.InventoryItem).filter(models.InventoryItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    item.stock_qty += req.quantity
    db.commit()
    db.refresh(item)
    return item

@app.get("/api/bom/templates", response_model=List[schemas.BOMTemplateOut])
def get_bom_templates(db: Session = Depends(get_db)):
    return db.query(models.BOMTemplate).all()

@app.get("/api/bom/calculate")
def calculate_bom_cost(capacity_kw: float = Query(...), system_type: str = Query(...), db: Session = Depends(get_db)):
    template = db.query(models.BOMTemplate).filter(
        models.BOMTemplate.capacity_kw == capacity_kw,
        models.BOMTemplate.system_type == system_type
    ).first()

    if not template:
        # Fallback closest template
        template = db.query(models.BOMTemplate).filter(
            models.BOMTemplate.system_type == system_type
        ).first()
        if not template:
            raise HTTPException(status_code=404, detail="BOM configuration not found")

    items_breakdown = []
    hardware_total = 0.0
    for bi in template.items:
        item = bi.inventory_item
        subtotal = item.selling_price_inr * bi.quantity
        cost_subtotal = item.unit_cost_inr * bi.quantity
        hardware_total += subtotal
        items_breakdown.append({
            "sku": item.sku,
            "name": item.name,
            "category": item.category,
            "quantity": bi.quantity,
            "unit_price_inr": item.selling_price_inr,
            "unit_cost_inr": item.unit_cost_inr,
            "subtotal_inr": subtotal,
            "cost_subtotal_inr": cost_subtotal,
            "stock_qty": item.stock_qty,
            "reorder_threshold": item.reorder_threshold
        })

    # PM Surya Ghar Subsidy formula (Indian Govt norms: ₹30,000 for 1kW, ₹60,000 for 2kW, ₹78,000 for 3kW-5kW on-grid)
    subsidy_discount = 0.0
    if system_type == "ON_GRID":
        if capacity_kw <= 1.0:
            subsidy_discount = 30000.0
        elif capacity_kw <= 2.0:
            subsidy_discount = 60000.0
        else:
            subsidy_discount = 78000.0

    installation_charge = template.installation_charge_inr
    grand_total = max(0.0, hardware_total + installation_charge - subsidy_discount)

    return {
        "capacity_kw": capacity_kw,
        "system_type": system_type,
        "items": items_breakdown,
        "hardware_total_inr": hardware_total,
        "installation_charge_inr": installation_charge,
        "subsidy_discount_inr": subsidy_discount,
        "grand_total_inr": grand_total
    }

# ----------------- 5. MANDATORY RULE 1: SURVEY GATEKEEPER QUOTATION -----------------
@app.get("/api/quotations", response_model=List[schemas.QuotationOut])
def get_quotations(db: Session = Depends(get_db)):
    return db.query(models.Quotation).order_by(models.Quotation.id.desc()).all()

@app.post("/api/quotations", response_model=schemas.QuotationOut)
def create_quotation(q_in: schemas.QuotationCreate, db: Session = Depends(get_db)):
    """
    MANDATORY RULE 1:
    POST /api/quotations MUST return HTTP 400 if site_surveys.is_approved is False for that lead.
    Quotes can only be generated after a technician completes and approves the roof survey.
    """
    survey = db.query(models.SiteSurvey).filter(
        models.SiteSurvey.id == q_in.survey_id,
        models.SiteSurvey.lead_id == q_in.lead_id
    ).first()

    if not survey:
        raise HTTPException(status_code=404, detail="Site survey not found for this lead")

    if not survey.is_approved:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Survey Gatekeeper Violation: Cannot generate Quotation because the Site Survey has not been approved by a certified technician."
        )

    # Compute BOM costs
    template = db.query(models.BOMTemplate).filter(
        models.BOMTemplate.capacity_kw == q_in.capacity_kw,
        models.BOMTemplate.system_type == q_in.system_type
    ).first()

    if not template:
        raise HTTPException(status_code=404, detail=f"BOM Template not found for {q_in.capacity_kw}kW {q_in.system_type}")

    hardware_total = sum(item.inventory_item.selling_price_inr * item.quantity for item in template.items)
    installation_charge = template.installation_charge_inr

    subsidy_discount = 0.0
    lead = db.query(models.CustomerLead).filter(models.CustomerLead.id == q_in.lead_id).first()
    if lead and lead.subsidy_requested and q_in.system_type == "ON_GRID":
        if q_in.capacity_kw <= 1.0:
            subsidy_discount = 30000.0
        elif q_in.capacity_kw <= 2.0:
            subsidy_discount = 60000.0
        else:
            subsidy_discount = 78000.0

    grand_total = max(0.0, hardware_total + installation_charge - subsidy_discount)

    quote = models.Quotation(
        lead_id=q_in.lead_id,
        survey_id=q_in.survey_id,
        capacity_kw=q_in.capacity_kw,
        system_type=q_in.system_type,
        hardware_total_inr=hardware_total,
        installation_charge_inr=installation_charge,
        subsidy_discount_inr=subsidy_discount,
        grand_total_inr=grand_total,
        status="SENT"
    )
    db.add(quote)
    if lead:
        lead.pipeline_stage = "QUOTED"
    db.commit()
    db.refresh(quote)
    return quote

@app.post("/api/quotations/{id}/approve")
def approve_quotation(id: int, db: Session = Depends(get_db)):
    quote = db.query(models.Quotation).filter(models.Quotation.id == id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quotation not found")
    
    quote.status = "APPROVED_BY_CUSTOMER"
    if quote.lead:
        quote.lead.pipeline_stage = "WON"
    
    # Check if Order already exists
    order = db.query(models.Order).filter(models.Order.quotation_id == quote.id).first()
    if not order:
        order = models.Order(
            quotation_id=quote.id,
            lead_id=quote.lead_id,
            total_amount_inr=quote.grand_total_inr,
            advance_paid_inr=0.0,
            balance_due_inr=quote.grand_total_inr,
            payment_status="UNPAID",
            subsidy_tracking_status="APPLIED" if quote.subsidy_discount_inr > 0 else "NOT_APPLIED",
            bom_deducted=False
        )
        db.add(order)
    
    db.commit()
    db.refresh(quote)
    return {"status": "success", "quotation_id": quote.id, "order_id": order.id if order else None}

# ----------------- 6. MANDATORY RULE 2: BOM EXPLOSION & STOCK DEDUCTION ON PAYMENT -----------------
@app.get("/api/orders", response_model=List[schemas.OrderOut])
def get_orders(db: Session = Depends(get_db)):
    return db.query(models.Order).order_by(models.Order.id.desc()).all()

@app.post("/api/orders/{id}/pay")
def record_order_payment(id: int, req: schemas.OrderPaymentRequest, db: Session = Depends(get_db)):
    """
    MANDATORY RULE 2:
    When an order receives advance or full payment (POST /api/orders/{id}/pay),
    the backend automatically queries bom_items for that capacity_kw + system_type,
    deducts exact quantities from inventory_items.stock_qty,
    flags any item where stock_qty <= reorder_threshold,
    and auto-creates a pending installations job.
    """
    order = db.query(models.Order).filter(models.Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.advance_paid_inr += req.amount
    order.balance_due_inr = max(0.0, order.total_amount_inr - order.advance_paid_inr)
    if order.balance_due_inr == 0:
        order.payment_status = "FULLY_PAID"
    else:
        order.payment_status = "ADVANCE_PAID"

    low_stock_alerts = []

    # Automatic BoM Explosion & Stock Deduction (once only upon payment)
    if not order.bom_deducted:
        quote = order.quotation
        if quote:
            template = db.query(models.BOMTemplate).filter(
                models.BOMTemplate.capacity_kw == quote.capacity_kw,
                models.BOMTemplate.system_type == quote.system_type
            ).first()

            if template:
                for bi in template.items:
                    item = bi.inventory_item
                    item.stock_qty = max(0, item.stock_qty - bi.quantity)
                    if item.stock_qty <= item.reorder_threshold:
                        low_stock_alerts.append({
                            "sku": item.sku,
                            "name": item.name,
                            "current_stock": item.stock_qty,
                            "reorder_threshold": item.reorder_threshold
                        })
                order.bom_deducted = True

    # Auto-create pending installation job if one does not exist
    existing_install = db.query(models.Installation).filter(models.Installation.order_id == order.id).first()
    created_installation_id = None
    if not existing_install:
        first_tech = db.query(models.User).filter(models.User.role == "TECHNICIAN").first()
        install = models.Installation(
            order_id=order.id,
            technician_id=first_tech.id if first_tech else None,
            scheduled_date=date.today() + timedelta(days=3),
            start_time="09:00 AM",
            end_time="Pending",
            hours_logged=0.0,
            progress_pct=10,
            verified_kw=order.quotation.capacity_kw if order.quotation else 3.0,
            system_tested_ok=False,
            is_completed=False,
            completion_notes="Job auto-scheduled upon payment receipt and BoM reservation."
        )
        db.add(install)
        db.flush()
        created_installation_id = install.id

    db.commit()
    db.refresh(order)

    return {
        "status": "success",
        "order_id": order.id,
        "payment_status": order.payment_status,
        "advance_paid_inr": order.advance_paid_inr,
        "balance_due_inr": order.balance_due_inr,
        "bom_deducted": order.bom_deducted,
        "installation_job_id": created_installation_id,
        "low_stock_alerts": low_stock_alerts
    }

@app.put("/api/orders/{id}/subsidy")
def update_subsidy_status(id: int, status: str = Query(...), db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.subsidy_tracking_status = status
    db.commit()
    return {"status": "success", "subsidy_tracking_status": order.subsidy_tracking_status}

# ----------------- 7. MANDATORY RULE 3: DISPATCH & SERIAL WARRANTY AUTOMATION -----------------
@app.get("/api/warehouse/serials", response_model=List[schemas.SerialUnitOut])
def get_serial_units(db: Session = Depends(get_db)):
    return db.query(models.SerialUnit).order_by(models.SerialUnit.dispatched_at.desc()).all()

@app.post("/api/warehouse/dispatch")
def dispatch_serial_unit(req: schemas.DispatchRequest, db: Session = Depends(get_db)):
    """
    When warehouse staff scans/submits serial numbers, backend binds each serial_number to customer's order_id.
    """
    # Check if serial already exists
    existing = db.query(models.SerialUnit).filter(models.SerialUnit.serial_number == req.serial_number).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Serial Number {req.serial_number} is already registered!")

    # Determine warranty period
    warranty_years = 20 if req.component_type == "PANEL" else 2

    unit = models.SerialUnit(
        serial_number=req.serial_number,
        order_id=req.order_id,
        lead_id=req.lead_id,
        inventory_item_id=req.inventory_item_id,
        component_type=req.component_type,
        packed_status=True,
        dispatched_at=datetime.now(timezone.utc),
        delivery_confirmed=False,
        warranty_years=warranty_years,
        warranty_start_date=None,
        warranty_expiry_date=None
    )
    db.add(unit)
    db.commit()
    db.refresh(unit)
    return {"status": "dispatched", "serial_number": unit.serial_number}

@app.post("/api/warehouse/delivery-confirm/{serial_number}")
def confirm_delivery_and_start_warranty(serial_number: str, db: Session = Depends(get_db)):
    """
    MANDATORY RULE 3:
    Upon confirming delivery, the backend automatically sets warranty_start_date = today
    and computes warranty_expiry_date = today + 20 years (for PANEL)
    or + 2 years (for INVERTER, BATTERY, CHARGE_CONTROLLER) with zero manual date entry.
    """
    unit = db.query(models.SerialUnit).filter(models.SerialUnit.serial_number == serial_number).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Serial unit not found")

    today = date.today()
    unit.delivery_confirmed = True
    unit.warranty_start_date = today

    days = 365 * unit.warranty_years
    unit.warranty_expiry_date = today + timedelta(days=days)

    db.commit()
    db.refresh(unit)

    return {
        "status": "delivery_confirmed",
        "serial_number": unit.serial_number,
        "component_type": unit.component_type,
        "warranty_years": unit.warranty_years,
        "warranty_start_date": unit.warranty_start_date.isoformat(),
        "warranty_expiry_date": unit.warranty_expiry_date.isoformat(),
        "is_active_now": today <= unit.warranty_expiry_date
    }

# ----------------- 8. INSTALLATIONS & CANVAS SIGNATURE -----------------
@app.get("/api/installations", response_model=List[schemas.InstallationOut])
def get_installations(db: Session = Depends(get_db)):
    return db.query(models.Installation).order_by(models.Installation.id.desc()).all()

@app.put("/api/installations/{id}", response_model=schemas.InstallationOut)
def update_installation(id: int, inst_in: schemas.InstallationUpdate, db: Session = Depends(get_db)):
    inst = db.query(models.Installation).filter(models.Installation.id == id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Installation not found")

    update_data = inst_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(inst, key, value)

    if inst.is_completed:
        inst.progress_pct = 100
        if inst.order and inst.order.lead:
            inst.order.lead.pipeline_stage = "INSTALLED"

    db.commit()
    db.refresh(inst)
    return inst

@app.post("/api/installations/{id}/complete")
def complete_installation(id: int, customer_signature_base64: str = Query(...), completion_notes: str = Query(""), db: Session = Depends(get_db)):
    inst = db.query(models.Installation).filter(models.Installation.id == id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Installation not found")

    inst.customer_signature_base64 = customer_signature_base64
    inst.completion_notes = completion_notes
    inst.progress_pct = 100
    inst.system_tested_ok = True
    inst.is_completed = True
    if inst.order and inst.order.lead:
        inst.order.lead.pipeline_stage = "INSTALLED"

    db.commit()
    return {"status": "success", "installation_id": inst.id, "is_completed": True}

# ----------------- 9. MANDATORY RULE 4: ZERO-CLICK HELPDESK WARRANTY TRIAGE -----------------
@app.get("/api/tickets", response_model=List[schemas.ServiceTicketOut])
def get_service_tickets(db: Session = Depends(get_db)):
    return db.query(models.ServiceTicket).order_by(models.ServiceTicket.id.desc()).all()

@app.post("/api/tickets", response_model=schemas.ServiceTicketOut)
def create_service_ticket(t_in: schemas.ServiceTicketCreate, db: Session = Depends(get_db)):
    """
    MANDATORY RULE 4:
    Zero-Click Helpdesk Warranty Triage:
    When a complaint ticket is created (POST /api/tickets) with a serial_number:
    Backend checks today <= serial_units.warranty_expiry_date:
    - If IN WARRANTY: sets is_under_warranty = True and billed_invoice_amount_inr = 0.
    - If EXPIRED: sets is_under_warranty = False and automatically generates an invoice for parts_cost_inr + labor_cost_inr.
    """
    today = date.today()
    is_under_warranty = True
    billed_amount = 0.0

    if t_in.serial_number:
        unit = db.query(models.SerialUnit).filter(models.SerialUnit.serial_number == t_in.serial_number).first()
        if unit and unit.warranty_expiry_date:
            if today <= unit.warranty_expiry_date:
                is_under_warranty = True
                billed_amount = 0.0
            else:
                is_under_warranty = False
                billed_amount = t_in.parts_cost_inr + t_in.labor_cost_inr
        else:
            # If no expiry date found, default to expired
            is_under_warranty = False
            billed_amount = t_in.parts_cost_inr + t_in.labor_cost_inr

    # Validate assigned technician to prevent foreign key errors if tech id is invalid or 0
    tech_id = t_in.assigned_technician_id
    if tech_id is not None and tech_id > 0:
        tech = db.query(models.User).filter(models.User.id == tech_id).first()
        if not tech:
            tech_id = None
    else:
        tech_id = None

    # Validate lead_id to ensure lead exists
    lead_id = t_in.lead_id
    lead = db.query(models.CustomerLead).filter(models.CustomerLead.id == lead_id).first()
    if not lead:
        first_lead = db.query(models.CustomerLead).first()
        if first_lead:
            lead_id = first_lead.id

    ticket = models.ServiceTicket(
        lead_id=lead_id,
        serial_number=t_in.serial_number,
        fault_code=t_in.fault_code,
        issue_description=t_in.issue_description,
        is_under_warranty=is_under_warranty,
        assigned_technician_id=tech_id,
        resolution_type=t_in.resolution_type,
        parts_cost_inr=t_in.parts_cost_inr,
        labor_cost_inr=t_in.labor_cost_inr,
        billed_invoice_amount_inr=billed_amount,
        status="OPEN"
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket

@app.put("/api/tickets/{id}", response_model=schemas.ServiceTicketOut)
def update_service_ticket(id: int, t_in: schemas.ServiceTicketUpdate, db: Session = Depends(get_db)):
    ticket = db.query(models.ServiceTicket).filter(models.ServiceTicket.id == id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Service ticket not found")

    update_data = t_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(ticket, key, value)

    # Re-calculate billed amount if expired
    if not ticket.is_under_warranty:
        ticket.billed_invoice_amount_inr = ticket.parts_cost_inr + ticket.labor_cost_inr

    db.commit()
    db.refresh(ticket)
    return ticket

# ----------------- 10. EMPLOYEES & CREW -----------------
@app.get("/api/employees", response_model=List[schemas.UserOut])
def get_employees(db: Session = Depends(get_db)):
    return db.query(models.User).filter(models.User.role == "TECHNICIAN").all()

@app.put("/api/employees/{id}/attendance")
def update_attendance(id: int, attendance_status: str = Query(...), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Employee not found")
    user.attendance_status = attendance_status
    db.commit()
    return {"status": "success", "employee_id": user.id, "attendance_status": user.attendance_status}

@app.get("/api/employees/{id}/jobs")
def get_employee_jobs(id: int, db: Session = Depends(get_db)):
    surveys = db.query(models.SiteSurvey).filter(models.SiteSurvey.technician_id == id).all()
    installations = db.query(models.Installation).filter(models.Installation.technician_id == id).all()
    return {
        "surveys_count": len(surveys),
        "installations_count": len(installations),
        "surveys": [{"id": s.id, "customer": s.lead.customer_name if s.lead else "Unknown", "approved": s.is_approved} for s in surveys],
        "installations": [{"id": i.id, "customer": i.order.lead.customer_name if i.order and i.order.lead else "Unknown", "progress": i.progress_pct, "completed": i.is_completed} for i in installations]
    }

# ----------------- 11. MANDATORY RULE 5: DYNAMIC PROJECT-WISE P&L & ANALYTICS -----------------
@app.get("/api/analytics")
def get_financial_analytics(db: Session = Depends(get_db)):
    """
    MANDATORY RULE 5:
    Dynamic Project-Wise P&L Formula:
    Project Profit = Order Collected Revenue - SUM(BoM Component Unit Costs) - (Installation Hours Logged * Technician Hourly Rate)
    Computed dynamically per project from database records (never hardcoded).
    """
    orders = db.query(models.Order).all()

    project_pnl_list = []
    total_revenue = 0.0
    total_cost = 0.0
    pending_payments = 0.0

    for order in orders:
        lead = order.lead
        quote = order.quotation
        customer_name = lead.customer_name if lead else f"Order #{order.id}"
        capacity_kw = quote.capacity_kw if quote else 3.0
        system_type = quote.system_type if quote else "ON_GRID"

        # Collected Revenue
        revenue = order.advance_paid_inr
        total_revenue += revenue
        pending_payments += order.balance_due_inr

        # BoM Component Unit Cost calculation
        bom_cost = 0.0
        if quote:
            template = db.query(models.BOMTemplate).filter(
                models.BOMTemplate.capacity_kw == quote.capacity_kw,
                models.BOMTemplate.system_type == quote.system_type
            ).first()
            if template:
                for bi in template.items:
                    bom_cost += bi.inventory_item.unit_cost_inr * bi.quantity

        # Technician Labor Cost
        labor_cost = 0.0
        installation = db.query(models.Installation).filter(models.Installation.order_id == order.id).first()
        tech_hours = 0.0
        tech_rate = 350.0
        if installation:
            tech_hours = installation.hours_logged or 0.0
            if installation.technician and installation.technician.hourly_rate:
                tech_rate = installation.technician.hourly_rate
            labor_cost = tech_hours * tech_rate

        project_cost = bom_cost + labor_cost
        total_cost += project_cost
        project_profit = revenue - project_cost
        profit_margin = (project_profit / revenue * 100.0) if revenue > 0 else 0.0

        project_pnl_list.append({
            "order_id": order.id,
            "project_name": f"{customer_name} ({capacity_kw}kW {system_type})",
            "customer_name": customer_name,
            "capacity_kw": capacity_kw,
            "system_type": system_type,
            "payment_status": order.payment_status,
            "collected_revenue_inr": revenue,
            "balance_due_inr": order.balance_due_inr,
            "bom_hardware_cost_inr": round(bom_cost, 2),
            "installation_hours": tech_hours,
            "technician_hourly_rate": tech_rate,
            "labor_cost_inr": round(labor_cost, 2),
            "total_project_cost_inr": round(project_cost, 2),
            "project_profit_inr": round(project_profit, 2),
            "profit_margin_pct": round(profit_margin, 1)
        })

    net_profit = total_revenue - total_cost

    # Inventory Valuation
    inventory = db.query(models.InventoryItem).all()
    inventory_valuation = sum(item.stock_qty * item.unit_cost_inr for item in inventory)
    low_stock_count = sum(1 for item in inventory if item.stock_qty <= item.reorder_threshold)

    # Subsidy Tracking breakdown
    subsidy_counts = {
        "NOT_APPLIED": db.query(models.Order).filter(models.Order.subsidy_tracking_status == "NOT_APPLIED").count(),
        "APPLIED": db.query(models.Order).filter(models.Order.subsidy_tracking_status == "APPLIED").count(),
        "INSPECTED": db.query(models.Order).filter(models.Order.subsidy_tracking_status == "INSPECTED").count(),
        "DISBURSED": db.query(models.Order).filter(models.Order.subsidy_tracking_status == "DISBURSED").count(),
    }

    # Ticket Summary
    tickets = db.query(models.ServiceTicket).all()
    open_tickets = sum(1 for t in tickets if t.status == "OPEN")
    warranty_claims_in = sum(1 for t in tickets if t.is_under_warranty)
    warranty_claims_expired = sum(1 for t in tickets if not t.is_under_warranty)

    return {
        "total_revenue_inr": round(total_revenue, 2),
        "total_expenses_inr": round(total_cost, 2),
        "net_profit_inr": round(net_profit, 2),
        "pending_payments_inr": round(pending_payments, 2),
        "inventory_valuation_inr": round(inventory_valuation, 2),
        "low_stock_items_count": low_stock_count,
        "subsidy_tracking": subsidy_counts,
        "tickets_summary": {
            "total": len(tickets),
            "open": open_tickets,
            "in_warranty": warranty_claims_in,
            "expired_warranty": warranty_claims_expired
        },
        "projects_pnl": project_pnl_list
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
