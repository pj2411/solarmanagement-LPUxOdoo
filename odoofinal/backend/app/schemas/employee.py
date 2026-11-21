import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class EmployeeCreate(BaseModel):
    user_id: uuid.UUID
    employee_code: str
    designation: str
    department: str
    skill_tags: List[str] = Field(default_factory=list)
    is_field_tech: bool = False
    base_salary: float = Field(default=0.0, ge=0)
    per_kw_incentive_rate: float = Field(default=500.0, ge=0)


class EmployeeUpdate(BaseModel):
    designation: Optional[str] = None
    department: Optional[str] = None
    skill_tags: Optional[List[str]] = None
    is_field_tech: Optional[bool] = None
    base_salary: Optional[float] = None
    per_kw_incentive_rate: Optional[float] = None


class EmployeeResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    employee_code: str
    designation: str
    department: str
    skill_tags: List[str]
    is_field_tech: bool
    base_salary: float
    per_kw_incentive_rate: float
    joining_date: datetime

    class Config:
        from_attributes = True


class AttendanceCheckInRequest(BaseModel):
    latitude: float
    longitude: float
    site_address: Optional[str] = None


class AttendanceResponse(BaseModel):
    id: uuid.UUID
    employee_id: uuid.UUID
    check_in_time: datetime
    check_out_time: Optional[datetime] = None
    latitude: float
    longitude: float
    site_address: Optional[str] = None
    is_geofence_verified: bool

    class Config:
        from_attributes = True
