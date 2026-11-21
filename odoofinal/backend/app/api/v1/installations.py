import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_technician, get_current_user
from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.models.installation import InstallationJob, InstallationStatus
from app.models.order import Order, OrderStatus
from app.models.serial_tracking import SerialItem, SerialStatus
from app.models.user import User
from app.models.warranty import WarrantyComponent, WarrantyRecord, WarrantyStatus
from app.schemas.common import ApiResponse
from app.schemas.installation import (
    ElectricalTestingData,
    HandoverSignatureSchema,
    InstallationJobResponse,
    InstallationStepProgressUpdate,
)

router = APIRouter(prefix="/installations", tags=["09 - Field Installation & Commissioning"])


@router.get("/assigned", response_model=ApiResponse[list[InstallationJobResponse]])
async def get_assigned_installations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_technician),
):
    """Retrieves all installation jobs assigned to the logged-in technician."""
    query = select(InstallationJob).where(InstallationJob.lead_technician_id == current_user.id)
    result = await db.execute(query)
    jobs = result.scalars().all()
    return ApiResponse(data=[InstallationJobResponse.model_validate(j) for j in jobs])


@router.post("/{id}/progress-step", response_model=ApiResponse[InstallationJobResponse])
async def update_installation_step(
    id: uuid.UUID,
    update: InstallationStepProgressUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_technician),
):
    """Updates physical mounting milestone and records step proof photo."""
    query = select(InstallationJob).where(InstallationJob.id == id)
    result = await db.execute(query)
    job = result.scalar_one_or_none()
    if not job:
        raise NotFoundException("InstallationJob", id)

    if update.structure_mounting_completed is not None:
        job.structure_mounting_completed = update.structure_mounting_completed
    if update.panel_clamping_completed is not None:
        job.panel_clamping_completed = update.panel_clamping_completed
    if update.inverter_wiring_completed is not None:
        job.inverter_wiring_completed = update.inverter_wiring_completed
    if update.earthing_pits_completed is not None:
        job.earthing_pits_completed = update.earthing_pits_completed

    if update.photo_url:
        photos = list(job.step_photos)
        photos.append({
            "step": update.step_name or "milestone",
            "url": update.photo_url,
            "lat": update.latitude,
            "lng": update.longitude,
            "timestamp": datetime.utcnow().isoformat(),
        })
        job.step_photos = photos

    job.status = InstallationStatus.IN_PROGRESS
    await db.commit()
    await db.refresh(job)

    return ApiResponse(
        data=InstallationJobResponse.model_validate(job),
        message="Installation progress step recorded.",
    )


@router.post("/{id}/test-results", response_model=ApiResponse[InstallationJobResponse])
async def submit_electrical_test_results(
    id: uuid.UUID,
    test_data: ElectricalTestingData,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_technician),
):
    """Records mandatory electrical safety measurements (Voc, Isc, Earth Resistance <= 5.0 Ohms)."""
    query = select(InstallationJob).where(InstallationJob.id == id)
    result = await db.execute(query)
    job = result.scalar_one_or_none()
    if not job:
        raise NotFoundException("InstallationJob", id)

    job.voc_measured = test_data.voc_measured
    job.isc_measured = test_data.isc_measured
    job.earth_resistance_ohms = test_data.earth_resistance_ohms
    job.grid_synchronization_tested = test_data.grid_synchronization_tested
    job.status = InstallationStatus.TESTING_QA

    await db.commit()
    await db.refresh(job)

    return ApiResponse(
        data=InstallationJobResponse.model_validate(job),
        message="Electrical testing QA verified successfully.",
    )


@router.post("/{id}/handover", response_model=ApiResponse[InstallationJobResponse])
async def customer_handover_signature(
    id: uuid.UUID,
    handover: HandoverSignatureSchema,
    db: AsyncSession = Depends(get_db),
):
    """Captures customer on-screen digital signature, completes installation, and auto-registers warranties."""
    query = select(InstallationJob).where(InstallationJob.id == id)
    result = await db.execute(query)
    job = result.scalar_one_or_none()
    if not job:
        raise NotFoundException("InstallationJob", id)

    job.customer_sign_name = handover.customer_sign_name
    job.customer_signature_url = f"signatures/handover_{id}.png"
    job.finish_time = datetime.utcnow()
    job.status = InstallationStatus.COMPLETED

    # Update Order
    order_query = select(Order).where(Order.id == job.order_id)
    order_res = await db.execute(order_query)
    order = order_res.scalar_one_or_none()
    if order:
        order.status = OrderStatus.COMMISSIONED

    # Auto-register Warranty for all installed serial items
    serials_query = select(SerialItem).where(SerialItem.order_id == job.order_id)
    serials_res = await db.execute(serials_query)
    serials = serials_res.scalars().all()

    now = datetime.utcnow()
    for s in serials:
        s.current_status = SerialStatus.INSTALLED
        s.installed_at = now

        # Determine warranty duration (25 yrs for panels, 8 yrs for inverter)
        is_panel = "PNL" in s.serial_number or "panel" in s.serial_number.lower()
        comp_type = WarrantyComponent.SOLAR_PANEL if is_panel else WarrantyComponent.INVERTER
        years = 25 if is_panel else 8

        warranty = WarrantyRecord(
            customer_id=order.customer_id if order else s.id,
            serial_item_id=s.id,
            order_id=job.order_id,
            component_type=comp_type,
            warranty_years=years,
            start_date=now,
            expiry_date=now + timedelta(days=365 * years),
            status=WarrantyStatus.ACTIVE,
        )
        db.add(warranty)

    await db.commit()
    await db.refresh(job)

    return ApiResponse(
        data=InstallationJobResponse.model_validate(job),
        message="Installation commissioned. Warranties automatically registered.",
    )
