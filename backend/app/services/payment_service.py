"""Milestone payment helpers (Module 06)."""
from app.models.payment import MilestoneType, PaymentMilestone, PaymentStatus


MILESTONE_SHARE = {
    MilestoneType.ADVANCE_BOOKING: 0.20,
    MilestoneType.PRE_DISPATCH: 0.60,
    MilestoneType.COMMISSIONING: 0.20,
}


def amount_for_milestone(milestone_type: MilestoneType, order_total: float) -> float:
    """Suggested amount for a milestone, from the order contract value."""
    return round(float(order_total) * MILESTONE_SHARE.get(milestone_type, 0.0), 2)


def balance_after_payment(order_total: float, already_paid: float, amount: float) -> float:
    return round(max(0.0, float(order_total) - float(already_paid) - float(amount)), 2)


def is_fully_paid(milestone: PaymentMilestone) -> bool:
    return milestone.status in (PaymentStatus.PAID, PaymentStatus.WAIVED)
