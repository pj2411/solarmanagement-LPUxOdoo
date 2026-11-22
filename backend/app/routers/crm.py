from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.payloads import lead_payload, quotation_payload
from app.redis_client import cache_get, cache_set, invalidate_prefix
from app.schemas import LeadIn, QuotationIn, SurveyIn
from app.services.bom import calculate
from app.utils import apply_updates, ok, serialize

router = APIRouter(tags=["crm"])


def _lead(db: Session, lead_id: int) -> models.Lead:
    lead = db.query(models.Lead).filter(models.Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(404, "Lead not found")
    return lead


def _survey_payload(db: Session, survey: models.Survey) -> dict:
    data = serialize(survey)
    data["lead"] = lead_payload(db.get(models.Lead, survey.lead_id))
    tech = None
    if survey.technician_id:
        tech = (
            db.query(models.Employee)
            .filter(models.Employee.id == survey.technician_id)
            .first()
        )
    data["technician"] = (
        {
            "id": tech.id,
            "name": tech.name,
            "email": tech.email,
            "role": tech.role,
        }
        if tech
        else None
    )
    return data


# ---------------------------------------------------------------------------
# Leads
# ---------------------------------------------------------------------------


@router.get("/api/leads")
def get_leads(db: Session = Depends(get_db)):
    cached = cache_get("leads")
    if cached is not None:
        return ok(cached)
    rows = db.query(models.Lead).order_by(models.Lead.id.desc()).all()
    data = [lead_payload(row) for row in rows]
    cache_set("leads", data)
    return ok(data)


@router.post("/api/leads", status_code=201)
def create_lead(payload: LeadIn, db: Session = Depends(get_db)):
    lead = models.Lead(**payload.model_dump())
    db.add(lead)
    db.commit()
    db.refresh(lead)
    invalidate_prefix("leads")
    invalidate_prefix("analytics")
    return ok(lead_payload(lead), "Lead created")


@router.put("/api/leads/{lead_id}")
def update_lead(lead_id: int, payload: dict, db: Session = Depends(get_db)):
    lead = _lead(db, lead_id)
    apply_updates(lead, payload)
    if payload.get("follow_up_notes") is not None:
        lead.notes = payload["follow_up_notes"]
    db.commit()
    db.refresh(lead)
    invalidate_prefix("leads")
    return ok(lead_payload(lead), "Lead updated")


# ---------------------------------------------------------------------------
# Surveys
# ---------------------------------------------------------------------------


@router.get("/api/surveys")
def get_surveys(db: Session = Depends(get_db)):
    cached = cache_get("surveys")
    if cached is not None:
        return ok(cached)
    rows = db.query(models.Survey).order_by(models.Survey.id.desc()).all()
    data = [_survey_payload(db, row) for row in rows]
    cache_set("surveys", data)
    return ok(data)


@router.post("/api/surveys", status_code=201)
def create_survey(payload: SurveyIn, db: Session = Depends(get_db)):
    _lead(db, payload.lead_id)
    values = payload.model_dump()
    values.setdefault("scheduled_date", date.today())
    values.setdefault("survey_photo_url", "/photos/survey_roof_default.jpg")
    survey = models.Survey(**values)
    lead = db.query(models.Lead).filter(models.Lead.id == payload.lead_id).first()
    if lead and lead.pipeline_stage == "NEW":
        lead.pipeline_stage = "SURVEY_SCHEDULED"
    db.add(survey)
    db.commit()
    db.refresh(survey)
    invalidate_prefix("surveys")
    invalidate_prefix("leads")
    return ok(_survey_payload(db, survey), "Survey scheduled")


@router.put("/api/surveys/{survey_id}")
def update_survey(survey_id: int, payload: dict, db: Session = Depends(get_db)):
    survey = db.query(models.Survey).filter(models.Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(404, "Survey not found")
    apply_updates(survey, payload)
    db.commit()
    db.refresh(survey)
    invalidate_prefix("surveys")
    return ok(_survey_payload(db, survey), "Survey updated")


@router.post("/api/surveys/{survey_id}/approve")
def approve_survey(survey_id: int, db: Session = Depends(get_db)):
    survey = db.query(models.Survey).filter(models.Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(404, "Survey not found")
    survey.is_approved = True
    lead = db.query(models.Lead).filter(models.Lead.id == survey.lead_id).first()
    if lead and lead.pipeline_stage in {"NEW", "SURVEY_SCHEDULED"}:
        lead.pipeline_stage = "SURVEY_APPROVED"
    db.commit()
    invalidate_prefix("surveys")
    invalidate_prefix("leads")
    return ok(_survey_payload(db, survey), "Survey approved")


# ---------------------------------------------------------------------------
# Quotations (auto-BOM, approval gate, subsidy)
# ---------------------------------------------------------------------------


def _quotation_payload(db: Session, q: models.Quotation) -> dict:
    return quotation_payload(db, q)


@router.get("/api/quotations")
def get_quotations(db: Session = Depends(get_db)):
    cached = cache_get("quotations")
    if cached is not None:
        return ok(cached)
    rows = db.query(models.Quotation).order_by(models.Quotation.id.desc()).all()
    data = [_quotation_payload(db, q) for q in rows]
    cache_set("quotations", data)
    return ok(data)


@router.post("/api/quotations", status_code=201)
def create_quotation(payload: QuotationIn, db: Session = Depends(get_db)):
    lead = _lead(db, payload.lead_id)
    survey = None
    if payload.survey_id:
        survey = (
            db.query(models.Survey)
            .filter(models.Survey.id == payload.survey_id)
            .first()
        )
    else:
        survey = (
            db.query(models.Survey)
            .filter(models.Survey.lead_id == lead.id)
            .order_by(models.Survey.id.desc())
            .first()
        )
    # Gatekeeper: only an approved survey can be quoted.
    if not survey or not survey.is_approved:
        raise HTTPException(
            400, "An approved site survey is required before creating a quotation"
        )

    kw = payload.capacity_kw or lead.capacity_kw
    system_type = payload.system_type or lead.system_type
    computed = calculate(kw, system_type, db)
    line_items = payload.line_items or computed["items"]

    subtotal = sum(
        Decimal(str(item.get("line_total", 0))) for item in line_items
    ) if line_items else Decimal(str(computed["subtotal"]))
    installation = payload.installation_charge or Decimal(
        str(computed["installation_charge"])
    )
    subsidy = payload.subsidy_estimate or Decimal(str(computed["subsidy_estimate"]))
    discount = payload.discount or Decimal("0")
    # Subsidy is a customer discount, not revenue: subtract it from the total.
    total = subtotal + installation - subsidy - discount

    q = models.Quotation(
        lead_id=lead.id,
        survey_id=survey.id,
        quotation_number=f"QUO-{int(date.today().strftime('%Y%m%d'))}-{lead.id:04d}",
        capacity_kw=kw,
        system_type=system_type,
        bom=computed["bom"],
        line_items=line_items,
        subtotal=subtotal,
        installation_charge=installation,
        subsidy_estimate=subsidy,
        discount=discount,
        total=total,
        status="DRAFT",
        valid_until=date.today() + timedelta(days=30),
        notes=payload.notes,
    )
    db.add(q)
    lead.pipeline_stage = "QUOTED"
    db.commit()
    db.refresh(q)
    invalidate_prefix("quotations")
    invalidate_prefix("leads")
    return ok(_quotation_payload(db, q), "Quotation generated")


@router.post("/api/quotations/{quotation_id}/approve")
def approve_quotation(quotation_id: int, db: Session = Depends(get_db)):
    q = db.query(models.Quotation).filter(models.Quotation.id == quotation_id).first()
    if not q:
        raise HTTPException(404, "Quotation not found")
    q.status = "APPROVED_BY_CUSTOMER"
    lead = db.query(models.Lead).filter(models.Lead.id == q.lead_id).first()
    if lead:
        lead.pipeline_stage = "WON"
    db.commit()
    invalidate_prefix("quotations")
    invalidate_prefix("leads")
    invalidate_prefix("orders")
    invalidate_prefix("analytics")
    return ok(_quotation_payload(db, q), "Quotation approved")


# ---------------------------------------------------------------------------
# BOM
# ---------------------------------------------------------------------------


@router.get("/api/bom/templates")
def bom_templates(db: Session = Depends(get_db)):
    return ok(cache_get("bom_templates") or _templates(db))


def _templates(db: Session) -> list[dict]:
    from app.services.bom import template_list

    data = template_list(db)
    cache_set("bom_templates", data)
    return data


@router.get("/api/bom/calculate")
def bom_calculate(
    capacity_kw: float = Query(..., gt=0),
    system_type: str = Query("ON_GRID"),
    db: Session = Depends(get_db),
):
    return ok(calculate(Decimal(str(capacity_kw)), system_type, db))
