import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.models.installation import InstallationStatus


class InstallationStepProgressUpdate(BaseModel):
    structure_mounting_completed: Optional[bool] = None
    panel_clamping_completed: Optional[bool] = None
    inverter_wiring_completed: Optional[bool] = None
    earthing_pits_completed: Optional[bool] = None
    step_name: Optional[str] = None
    photo_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ElectricalTestingData(BaseModel):
    voc_measured: float = Field(..., gt=0, description="Measured Open Circuit Voltage (Voc)")
    isc_measured: float = Field(..., gt=0, description="Measured Short Circuit Current (Isc)")
    earth_resistance_ohms: float = Field(..., gt=0, le=5.0, description="Earth Resistance must be <= 5.0 Ohms")
    grid_synchronization_tested: bool = True


class HandoverSignatureSchema(BaseModel):
    customer_signature_base64: str = Field(..., description="Canvas digital signature")
    customer_sign_name: str


class InstallationJobResponse(BaseModel):
    id: uuid.UUID
    order_id: uuid.UUID
    lead_technician_id: Optional[uuid.UUID] = None
    scheduled_date: Optional[datetime] = None
    start_time: Optional[datetime] = None
    finish_time: Optional[datetime] = None
    status: InstallationStatus
    structure_mounting_completed: bool
    panel_clamping_completed: bool
    inverter_wiring_completed: bool
    earthing_pits_completed: bool
    voc_measured: Optional[float] = None
    isc_measured: Optional[float] = None
    earth_resistance_ohms: Optional[float] = None
    grid_synchronization_tested: bool
    step_photos: List[Dict[str, Any]]
    customer_signature_url: Optional[str] = None
    customer_sign_name: Optional[str] = None
    commissioning_certificate_url: Optional[str] = None

    class Config:
        from_attributes = True
