import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.models.survey import FeasibilityStatus, RoofType


class SurveyScheduleRequest(BaseModel):
    lead_id: uuid.UUID
    technician_id: uuid.UUID
    scheduled_date: datetime


class SurveyPhotoMetadata(BaseModel):
    url: str
    caption: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    captured_at: Optional[str] = None


class SurveySubmitReport(BaseModel):
    roof_type: RoofType
    tilt_angle_deg: float = Field(..., ge=0, le=90)
    azimuth_angle_deg: float = Field(..., ge=0, le=360)
    shadow_free_area_sqft: float = Field(..., gt=0)
    dc_cable_distance_m: float = Field(..., ge=0)
    ac_cable_distance_m: float = Field(..., ge=0)
    earthing_pit_count: int = Field(default=2, ge=1)
    photos: List[SurveyPhotoMetadata] = Field(default_factory=list)
    engineering_notes: Optional[str] = None
    feasibility_status: FeasibilityStatus


class SurveyApprovalRequest(BaseModel):
    feasibility_status: FeasibilityStatus
    engineering_notes: Optional[str] = None


class SurveyResponse(BaseModel):
    id: uuid.UUID
    lead_id: uuid.UUID
    technician_id: Optional[uuid.UUID] = None
    scheduled_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    roof_type: RoofType
    tilt_angle_deg: float
    azimuth_angle_deg: float
    shadow_free_area_sqft: float
    dc_cable_distance_m: float
    ac_cable_distance_m: float
    earthing_pit_count: int
    photos: List[Dict[str, Any]]
    feasibility_status: FeasibilityStatus
    engineering_notes: Optional[str] = None
    approved_by_id: Optional[uuid.UUID] = None

    class Config:
        from_attributes = True
