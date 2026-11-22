"""CRM lead qualification & follow-up helpers (Modules 01 & 03)."""
from datetime import timedelta

from app.models.lead import Lead


FOLLOW_UP_DAYS = {
    "new": 1,
    "contacted": 3,
    "site_visit_scheduled": 2,
    "quoted": 5,
    "negotiation": 2,
}


def next_follow_up_date(lead: Lead):
    """Suggested follow-up date based on the current pipeline stage."""
    stage = getattr(lead.status, "value", str(lead.status)).lower()
    days = FOLLOW_UP_DAYS.get(stage, 7)
    base = lead.updated_at or lead.created_at
    return base + timedelta(days=days)


def is_high_value_lead(lead: Lead, threshold_kw: float = 5.0) -> bool:
    return float(getattr(lead, "recommended_kw", 0) or 0) >= threshold_kw
