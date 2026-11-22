"""Solar sizing + subsidy calculation tests."""
from app.schemas.lead import CalculatorInputSchema
from app.services.calculator_service import CalculatorService


def test_subsidy_tiers():
    assert CalculatorService.calculate_central_subsidy(0.5) == 0.0
    assert CalculatorService.calculate_central_subsidy(1.0) == 30000.0
    assert CalculatorService.calculate_central_subsidy(2.0) == 60000.0
    assert CalculatorService.calculate_central_subsidy(3.0) == 78000.0
    assert CalculatorService.calculate_central_subsidy(5.0) == 78000.0  # capped


def test_recommended_capacity_is_at_least_1kw():
    result = CalculatorService.evaluate(
        CalculatorInputSchema(monthly_bill=100.0, electricity_rate_per_kwh=8.0)
    )
    assert result.recommended_capacity_kw >= 1.0
