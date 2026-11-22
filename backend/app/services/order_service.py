"""Sales order business rules (Module 06)."""
from app.core.exceptions import ConflictException
from app.models.order import Order, OrderStatus


def pending_amount(order: Order) -> float:
    return round(max(0.0, float(order.total_amount) - float(order.amount_paid or 0.0)), 2)


def assert_dispatch_allowed(order: Order) -> None:
    """Do not let a cancelled or already-completed order go back through dispatch."""
    if order.status in (OrderStatus.CANCELLED, OrderStatus.COMMISSIONED, OrderStatus.CLOSED):
        raise ConflictException(
            f"Order in '{order.status.value}' state cannot be dispatched."
        )
