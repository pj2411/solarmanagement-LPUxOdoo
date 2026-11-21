import enum
import uuid
from typing import Any, Dict, List, Optional
from sqlalchemy import Boolean, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class ProductCategory(str, enum.Enum):
    PANEL = "panel"
    INVERTER = "inverter"
    BATTERY = "battery"
    STRUCTURE = "structure"
    CABLE = "cable"
    BOS = "bos"
    SAFETY = "safety"


class Product(BaseModel):
    """Product SKU Master Catalog (Module 07)."""
    __tablename__ = "products"

    sku: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    category: Mapped[ProductCategory] = mapped_column(
        Enum(ProductCategory, native_enum=False, length=50),
        nullable=False,
        index=True,
    )
    manufacturer: Mapped[str] = mapped_column(String(100), nullable=False)
    model_number: Mapped[str] = mapped_column(String(100), nullable=False)
    wattage_or_rating: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # e.g. "550W", "3kW"
    unit_of_measure: Mapped[str] = mapped_column(String(20), default="nos", nullable=False)  # nos, meters, sets

    unit_cost: Mapped[float] = mapped_column(Float, nullable=False)
    selling_price: Mapped[float] = mapped_column(Float, nullable=False)
    min_threshold_alert: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    is_serialized: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)  # True for panels & inverters
    specifications: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)

    # Relationships
    stock_items = relationship("StockItem", back_populates="product")
    serial_items = relationship("SerialItem", back_populates="product")


class Warehouse(BaseModel):
    """Warehouse Location Master."""
    __tablename__ = "warehouses"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    stock_items = relationship("StockItem", back_populates="warehouse")
    serial_items = relationship("SerialItem", back_populates="warehouse")


class StockItem(BaseModel):
    """Inventory Stock Levels per Warehouse (Module 07)."""
    __tablename__ = "stock_items"

    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    warehouse_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("warehouses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    quantity_on_hand: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    quantity_reserved: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    product = relationship("Product", back_populates="stock_items")
    warehouse = relationship("Warehouse", back_populates="stock_items")
