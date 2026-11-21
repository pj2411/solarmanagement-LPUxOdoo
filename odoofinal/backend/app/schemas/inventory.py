import uuid
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field
from app.models.inventory import ProductCategory


class ProductCreate(BaseModel):
    sku: str = Field(..., min_length=3)
    name: str = Field(..., min_length=2)
    category: ProductCategory
    manufacturer: str
    model_number: str
    wattage_or_rating: Optional[str] = None
    unit_of_measure: str = "nos"
    unit_cost: float = Field(..., ge=0)
    selling_price: float = Field(..., ge=0)
    min_threshold_alert: int = Field(default=10, ge=1)
    is_serialized: bool = False
    specifications: Dict[str, Any] = Field(default_factory=dict)


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    unit_cost: Optional[float] = None
    selling_price: Optional[float] = None
    min_threshold_alert: Optional[int] = None
    specifications: Optional[Dict[str, Any]] = None


class ProductResponse(BaseModel):
    id: uuid.UUID
    sku: str
    name: str
    category: ProductCategory
    manufacturer: str
    model_number: str
    wattage_or_rating: Optional[str] = None
    unit_of_measure: str
    unit_cost: float
    selling_price: float
    min_threshold_alert: int
    is_serialized: bool
    specifications: Dict[str, Any]

    class Config:
        from_attributes = True


class StockAdjustmentRequest(BaseModel):
    product_id: uuid.UUID
    warehouse_id: uuid.UUID
    quantity_change: int
    reason: str


class LowStockAlertResponse(BaseModel):
    product_id: uuid.UUID
    sku: str
    name: str
    category: ProductCategory
    quantity_on_hand: int
    min_threshold_alert: int
