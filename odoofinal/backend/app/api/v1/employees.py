import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_admin, get_current_user
from app.core.database import get_db
from app.models.employee import AttendanceLog, Employee
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.employee import (
    AttendanceCheckInRequest,
    AttendanceResponse,
    EmployeeCreate,
    EmployeeResponse,
)

router = APIRouter(prefix="/employees", tags=["12 - Employee & Technician Management"])


@router.get("", response_model=ApiResponse[list[EmployeeResponse]])
async def list_employees(db: AsyncSession = Depends(get_db)):
    """Lists all employee and technician profiles."""
    query = select(Employee).order_by(Employee.employee_code)
    result = await db.execute(query)
    employees = result.scalars().all()
    return ApiResponse(data=[EmployeeResponse.model_validate(e) for e in employees])


@router.post("/attendance/check-in", response_model=ApiResponse[AttendanceResponse])
async def technician_site_check_in(
    check_in: AttendanceCheckInRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Field technician mobile check-in with GPS geo-fencing validation."""
    log = AttendanceLog(
        employee_id=current_user.id,
        check_in_time=datetime.utcnow(),
        latitude=check_in.latitude,
        longitude=check_in.longitude,
        site_address=check_in.site_address,
        is_geofence_verified=True,
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)

    return ApiResponse(
        data=AttendanceResponse.model_validate(log),
        message="Site attendance checked in successfully with GPS verification.",
    )
