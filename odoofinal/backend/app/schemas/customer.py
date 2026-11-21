import uuid
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class CustomerCreate(BaseModel):
    full_name: str = Field(..., min_length=2)
    phone: str = Field(..., min_length=10)
    email: Optional[EmailStr] = None
    address: str
    city: str
    state: str
    pincode: str
    discom_provider: Optional[str] = None
    consumer_number: Optional[str] = None
    sanctioned_load_kw: Optional[float] = None


class CustomerUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    discom_provider: Optional[str] = None
    consumer_number: Optional[str] = None
    sanctioned_load_kw: Optional[float] = None
    electricity_bill_url: Optional[str] = None
    roof_ownership_proof_url: Optional[str] = None


class CustomerResponse(BaseModel):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    full_name: str
    phone: str
    email: Optional[str] = None
    address: str
    city: str
    state: str
    pincode: str
    discom_provider: Optional[str] = None
    consumer_number: Optional[str] = None
    sanctioned_load_kw: Optional[float] = None
    electricity_bill_url: Optional[str] = None
    roof_ownership_proof_url: Optional[str] = None

    class Config:
        from_attributes = True
