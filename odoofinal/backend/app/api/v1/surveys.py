import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_sales, get_current_technician, get_current_user
from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.models.lead import Lead, LeadStatus
from app.models.survey import FeasibilityStatus, SiteSurvey
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.survey import (
    SurveyApprovalRequest,
    SurveyResponse,
    SurveyScheduleRequest,
    SurveySubmitReport,
)

router = APIRouter(prefix="/surveys", tags=["04 - Site Survey & Feasibility Management"])


@router.post("/schedule", response_model=ApiResponse[SurveyResponse], status_code=status.HTTP_201_CREATED)
async def schedule_site_survey(
    request: SurveyScheduleRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_sales),
):
    """Schedules a site survey and assigns a field technician."""
    lead_query = select(Lead).where(Lead.id == request.lead_id)
    lead_res = await db.execute(lead_query)
    lead = lead_res.scalar_one_or_none()
    if not lead:
        raise NotFoundException("Lead", request.lead_id)

    survey = SiteSurvey(
        lead_id=request.lead_id,
        technician_id=request.technician_id,
        scheduled_date=request.scheduled_date,
        feasibility_status=FeasibilityStatus.PENDING,
    )
    db.add(survey)
    lead.status = LeadStatus.SURVEY_SCHEDULED
    await db.commit()
    await db.refresh(survey)

    return ApiResponse(
        data=SurveyResponse.model_validate(survey),
        message="Site survey scheduled successfully.",
    )


@router.get("/assigned", response_model=ApiResponse[list[SurveyResponse]])
async def get_technician_assigned_surveys(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_technician),
):
    """Fetches all site surveys assigned to the logged-in field technician."""
    query = select(SiteSurvey).where(SiteSurvey.technician_id == current_user.id)
    result = await db.execute(query)
    surveys = result.scalars().all()
    return ApiResponse(
        data=[SurveyResponse.model_validate(s) for s in surveys]
    )


@router.post("/{id}/submit-report", response_model=ApiResponse[SurveyResponse])
async def submit_survey_report(
    id: uuid.UUID,
    report: SurveySubmitReport,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_technician),
):
    """Technician submits tilt, azimuth, shadow-free area, cable runs, and geo-photos."""
    query = select(SiteSurvey).where(SiteSurvey.id == id)
    result = await db.execute(query)
    survey = result.scalar_one_or_none()
    if not survey:
        raise NotFoundException("SiteSurvey", id)

    survey.roof_type = report.roof_type
    survey.tilt_angle_deg = report.tilt_angle_deg
    survey.azimuth_angle_deg = report.azimuth_angle_deg
    survey.shadow_free_area_sqft = report.shadow_free_area_sqft
    survey.dc_cable_distance_m = report.dc_cable_distance_m
    survey.ac_cable_distance_m = report.ac_cable_distance_m
    survey.earthing_pit_count = report.earthing_pit_count
    survey.photos = [p.model_dump() for p in report.photos]
    survey.engineering_notes = report.engineering_notes
    survey.feasibility_status = report.feasibility_status
    survey.completed_at = datetime.utcnow()

    # Update lead status
    lead_query = select(Lead).where(Lead.id == survey.lead_id)
    lead_res = await db.execute(lead_query)
    lead = lead_res.scalar_one_or_none()
    if lead:
        lead.status = LeadStatus.SURVEY_COMPLETED

    await db.commit()
    await db.refresh(survey)
    return ApiResponse(
        data=SurveyResponse.model_validate(survey),
        message="Survey report submitted successfully.",
    )


@router.put("/{id}/approve", response_model=ApiResponse[SurveyResponse])
async def approve_survey_feasibility(
    id: uuid.UUID,
    approval: SurveyApprovalRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_sales),
):
    """Design engineer / Sales review and signs off on engineering feasibility."""
    query = select(SiteSurvey).where(SiteSurvey.id == id)
    result = await db.execute(query)
    survey = result.scalar_one_or_none()
    if not survey:
        raise NotFoundException("SiteSurvey", id)

    survey.feasibility_status = approval.feasibility_status
    if approval.engineering_notes:
        survey.engineering_notes = approval.engineering_notes
    survey.approved_by_id = current_user.id

    await db.commit()
    await db.refresh(survey)
    return ApiResponse(
        data=SurveyResponse.model_validate(survey),
        message=f"Survey feasibility marked as {survey.feasibility_status.value}.",
    )
