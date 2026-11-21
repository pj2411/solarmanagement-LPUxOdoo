import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_sales, get_current_user
from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.models.customer import Customer
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.customer import CustomerCreate, CustomerResponse, CustomerUpdate

router = APIRouter(prefix="/customers", tags=["03 - Customer Management & CRM"])


@router.get("", response_model=ApiResponse[list[CustomerResponse]])
async def list_customers(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_sales),
):
    """Lists all customer accounts and KYC status."""
    query = select(Customer).order_by(Customer.created_at.desc())
    result = await db.execute(query)
    customers = result.scalars().all()
    return ApiResponse(data=[CustomerResponse.model_validate(c) for c in customers])


@router.get("/{id}", response_model=ApiResponse[CustomerResponse])
async def get_customer(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Retrieves single customer profile and utility information."""
    query = select(Customer).where(Customer.id == id)
    result = await db.execute(query)
    customer = result.scalar_one_or_none()
    if not customer:
        raise NotFoundException("Customer", id)

    return ApiResponse(data=CustomerResponse.model_validate(customer))


@router.post("", response_model=ApiResponse[CustomerResponse], status_code=status.HTTP_201_CREATED)
async def create_customer(customer_in: CustomerCreate, db: AsyncSession = Depends(get_db)):
    """Creates a new customer record."""
    customer = Customer(**customer_in.model_dump())
    db.add(customer)
    await db.commit()
    await db.refresh(customer)
    return ApiResponse(data=CustomerResponse.model_validate(customer), message="Customer profile created.")


@router.put("/{id}", response_model=ApiResponse[CustomerResponse])
async def update_customer(id: uuid.UUID, customer_update: CustomerUpdate, db: AsyncSession = Depends(get_db)):
    """Updates customer KYC, DISCOM consumer number, or electricity bill proof."""
    query = select(Customer).where(Customer.id == id)
    result = await db.execute(query)
    customer = result.scalar_one_or_none()
    if not customer:
        raise NotFoundException("Customer", id)

    for field, value in customer_update.model_dump(exclude_unset=True).items():
        setattr(customer, field, value)

    await db.commit()
    await db.refresh(customer)
    return ApiResponse(data=CustomerResponse.model_validate(customer), message="Customer updated.")
