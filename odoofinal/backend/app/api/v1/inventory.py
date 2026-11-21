import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user, get_current_warehouse
from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.models.inventory import Product, StockItem
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.inventory import (
    LowStockAlertResponse,
    ProductCreate,
    ProductResponse,
    ProductUpdate,
    StockAdjustmentRequest,
)

router = APIRouter(prefix="/inventory", tags=["07 - Inventory & Warehouse Management"])


@router.get("/products", response_model=ApiResponse[list[ProductResponse]])
async def list_products(db: AsyncSession = Depends(get_db)):
    """Lists all product SKUs in catalog (Panels, Inverters, Batteries, Structures, Cables, BOS)."""
    query = select(Product).order_by(Product.name)
    result = await db.execute(query)
    products = result.scalars().all()
    return ApiResponse(data=[ProductResponse.model_validate(p) for p in products])


@router.post("/products", response_model=ApiResponse[ProductResponse], status_code=status.HTTP_201_CREATED)
async def create_product(
    product_in: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_warehouse),
):
    """Creates a new product SKU in the master catalog."""
    product = Product(**product_in.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return ApiResponse(
        data=ProductResponse.model_validate(product),
        message="Product SKU created successfully.",
    )


@router.get("/low-stock-alerts", response_model=ApiResponse[list[LowStockAlertResponse]])
async def get_low_stock_alerts(db: AsyncSession = Depends(get_db)):
    """Surfaces items where available stock is below minimum alert thresholds."""
    query = (
        select(Product, StockItem)
        .join(StockItem, Product.id == StockItem.product_id)
        .where(StockItem.quantity_on_hand <= Product.min_threshold_alert)
    )
    result = await db.execute(query)
    rows = result.all()

    alerts = [
        LowStockAlertResponse(
            product_id=p.id,
            sku=p.sku,
            name=p.name,
            category=p.category,
            quantity_on_hand=s.quantity_on_hand,
            min_threshold_alert=p.min_threshold_alert,
        )
        for p, s in rows
    ]
    return ApiResponse(data=alerts)
