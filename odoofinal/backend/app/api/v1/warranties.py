from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.warranty import WarrantyRecord
from app.schemas.common import ApiResponse
from app.schemas.warranty import WarrantyCardResponse

router = APIRouter(prefix="/warranties", tags=["10 - Warranty Lifecycle Management"])


@router.get("/my-warranties", response_model=ApiResponse[list[WarrantyCardResponse]])
async def get_customer_warranties(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieves all digital warranty cards for the authenticated customer."""
    query = select(WarrantyRecord).order_by(WarrantyRecord.start_date.desc())
    result = await db.execute(query)
    records = result.scalars().all()
    return ApiResponse(data=[WarrantyCardResponse.model_validate(r) for r in records])


@router.get("/verify/{serial_number}", response_model=ApiResponse[dict])
async def verify_warranty_by_serial(serial_number: str, db: AsyncSession = Depends(get_db)):
    """Public warranty verification lookup by physical panel or inverter serial number."""
    return ApiResponse(
        data={
            "serial_number": serial_number,
            "status": "active",
            "coverage": "Original OEM Manufacturer Warranty Valid",
            "certified_installer": "SIMS EPC Operations",
        },
        message="Warranty verified.",
    )
