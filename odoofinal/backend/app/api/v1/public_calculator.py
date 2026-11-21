from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.customer import Customer
from app.models.lead import Lead, LeadStatus
from app.models.user import User, UserRole
from app.schemas.common import ApiResponse
from app.schemas.lead import CalculatorInputSchema, CalculatorResultSchema, LeadCreate, LeadResponse
from app.services.calculator_service import CalculatorService

router = APIRouter(prefix="/public", tags=["01 - Public Website & Calculator"])


@router.post("/calculator/evaluate", response_model=ApiResponse[CalculatorResultSchema])
async def evaluate_solar_savings(inputs: CalculatorInputSchema):
    """Calculates optimal system sizing, generation, cost, subsidy, and 25-yr financial savings."""
    result = CalculatorService.evaluate(inputs)
    return ApiResponse(
        data=result,
        message="Solar calculation evaluated successfully."
    )


@router.get("/subsidy-info", response_model=ApiResponse[dict])
async def get_subsidy_information():
    """Returns official central and state solar subsidy policy brackets (PM Surya Ghar scheme)."""
    subsidy_matrix = {
        "scheme_name": "PM Surya Ghar Muft Bijli Yojana",
        "central_subsidy_brackets": [
            {"capacity": "1 kW", "subsidy_amount_inr": 30000, "description": "Flat ₹30,000 for 1kW systems"},
            {"capacity": "2 kW", "subsidy_amount_inr": 60000, "description": "Flat ₹60,000 for 2kW systems"},
            {"capacity": "3 kW to 10 kW", "subsidy_amount_inr": 78000, "description": "Maximum ceiling of ₹78,000"},
        ],
        "eligibility": [
            "Indian citizen with residential rooftop ownership",
            "Valid grid-connected electricity connection in applicant's name",
            "Installation of DCR (Domestic Content Requirement) solar modules",
        ],
        "disbursal_mode": "Direct Benefit Transfer (DBT) to customer's linked bank account",
    }
    return ApiResponse(data=subsidy_matrix)


@router.post("/enquiry", response_model=ApiResponse[LeadResponse], status_code=status.HTTP_201_CREATED)
async def submit_public_enquiry(enquiry: LeadCreate, db: AsyncSession = Depends(get_db)):
    """Receives contact details & solar requirements from prospective customers on the public website."""
    # 1. Check or create customer
    customer = Customer(
        full_name=enquiry.full_name,
        phone=enquiry.phone,
        email=enquiry.email,
        address=enquiry.address,
        city=enquiry.city,
        state="Default",
        pincode=enquiry.pincode,
    )
    db.add(customer)
    await db.flush()

    # 2. Create lead in CRM pipeline
    lead = Lead(
        customer_id=customer.id,
        source="website_calculator",
        monthly_bill=enquiry.monthly_bill,
        roof_area_sqft=enquiry.roof_area_sqft,
        recommended_kw=enquiry.recommended_kw,
        status=LeadStatus.NEW,
    )
    db.add(lead)
    await db.commit()
    await db.refresh(lead)

    return ApiResponse(
        data=LeadResponse.model_validate(lead),
        message="Enquiry received. Our solar engineer will contact you shortly.",
    )


@router.get("/products-showcase", response_model=ApiResponse[list])
async def get_products_showcase():
    """Lists standard 1kW to 5kW solar package offerings for consumer education."""
    showcase = [
        {"capacity": "1 kW", "type": "On-Grid", "panels": "2 x 550W Mono PERC", "area_sqft": 90, "daily_units": "4-5 kWh"},
        {"capacity": "2 kW", "type": "On-Grid", "panels": "4 x 550W Mono PERC", "area_sqft": 180, "daily_units": "8-10 kWh"},
        {"capacity": "3 kW", "type": "On-Grid", "panels": "6 x 550W Mono PERC", "area_sqft": 270, "daily_units": "12-15 kWh"},
        {"capacity": "4 kW", "type": "On-Grid", "panels": "8 x 550W Mono PERC", "area_sqft": 360, "daily_units": "16-20 kWh"},
        {"capacity": "5 kW", "type": "On-Grid", "panels": "10 x 550W Mono PERC", "area_sqft": 450, "daily_units": "20-25 kWh"},
    ]
    return ApiResponse(data=showcase)
