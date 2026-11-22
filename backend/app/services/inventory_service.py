"""Inventory helpers (Module 07)."""
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.inventory import Product, StockItem


async def low_stock_count(db: AsyncSession) -> int:
    """Count products whose on-hand stock is at/below their reorder threshold."""
    result = await db.execute(
        select(func.count(func.distinct(StockItem.product_id))).where(
            StockItem.quantity_on_hand <= Product.min_threshold_alert,
            StockItem.product_id == Product.id,
        )
    )
    return int(result.scalar_one() or 0)


async def total_stock_value(db: AsyncSession) -> float:
    """Inventory valuation at unit cost — used by the finance dashboard."""
    result = await db.execute(
        select(func.coalesce(func.sum(StockItem.quantity_on_hand * Product.unit_cost), 0.0))
        .where(StockItem.product_id == Product.id)
    )
    return float(result.scalar_one() or 0.0)
