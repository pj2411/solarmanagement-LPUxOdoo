"""Site survey business rules (Module 04).

PS rule: a quotation may ONLY be generated after an approved (feasible) survey.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictException
from app.models.survey import FeasibilityStatus, SiteSurvey

APPROVED_STATUSES = (
    FeasibilityStatus.FEASIBLE,
    FeasibilityStatus.FEASIBLE_WITH_MODIFICATIONS,
)


async def assert_survey_approved(db: AsyncSession, lead_id) -> SiteSurvey:
    """Server-side gate. Never rely on the frontend to hide the quote button."""
    survey = await db.scalar(
        select(SiteSurvey)
        .where(SiteSurvey.lead_id == lead_id)
        .where(SiteSurvey.feasibility_status.in_(APPROVED_STATUSES))
        .order_by(SiteSurvey.completed_at.desc())
    )
    if not survey:
        raise ConflictException(
            "Cannot quote before an approved site survey. Schedule, submit and approve the survey first."
        )
    return survey
