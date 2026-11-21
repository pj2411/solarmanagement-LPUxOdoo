import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_sales, get_current_user
from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.models.quotation import Quotation, QuotationStatus
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.quotation import (
    QuotationApprovalSchema,
    QuotationGenerateRequest,
    QuotationResponse,
)
from app.services.quotation_service import QuotationService

router = APIRouter(prefix="/quotations", tags=["05 - Quotation & Dynamic BOM Management"])


@router.post("/generate", response_model=ApiResponse[QuotationResponse], status_code=status.HTTP_201_CREATED)
async def generate_quotation(
    request: QuotationGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_sales),
):
    """Generates an engineering quotation with dynamic BOM breakdown & subsidy calculation."""
    quotation = await QuotationService.create_quotation(db, request)
    return ApiResponse(
        data=QuotationResponse.model_validate(quotation),
        message="Quotation generated successfully with dynamic BOM explosion.",
    )


@router.get("/{id}", response_model=ApiResponse[QuotationResponse])
async def get_quotation_by_id(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Retrieves full quotation details and BOM line items."""
    query = select(Quotation).where(Quotation.id == id)
    result = await db.execute(query)
    quotation = result.scalar_one_or_none()
    if not quotation:
        raise NotFoundException("Quotation", id)

    return ApiResponse(data=QuotationResponse.model_validate(quotation))


@router.post("/{id}/approve", response_model=ApiResponse[QuotationResponse])
async def customer_approve_quotation(
    id: uuid.UUID,
    approval: QuotationApprovalSchema,
    db: AsyncSession = Depends(get_db),
):
    """Customer digital signature submission and quotation acceptance."""
    query = select(Quotation).where(Quotation.id == id)
    result = await db.execute(query)
    quotation = result.scalar_one_or_none()
    if not quotation:
        raise NotFoundException("Quotation", id)

    quotation.status = QuotationStatus.APPROVED
    quotation.approved_at = datetime.utcnow()
    # In production, upload base64 to S3; for now record as signed
    quotation.customer_signature_url = f"signatures/{quotation.quote_number}_signed.png"

    await db.commit()
    await db.refresh(quotation)

    return ApiResponse(
        data=QuotationResponse.model_validate(quotation),
        message="Quotation approved and accepted by customer.",
    )
