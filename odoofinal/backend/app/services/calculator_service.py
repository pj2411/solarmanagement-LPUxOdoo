import math
from app.schemas.lead import CalculatorInputSchema, CalculatorResultSchema


class CalculatorService:
    """Core Mathematical Engine for Solar System Sizing, Generation & Subsidy (Module 01)."""

    # Industry standard benchmarks (India / MNRE PM Surya Ghar guidelines)
    BENCHMARK_COST_PER_KW = 65000.0   # Average turnkey cost per kW for residential rooftop
    PEAK_SUN_HOURS_PER_DAY = 4.2      # Standard average irradiance
    ANNUAL_GENERATION_PER_KW = 1450.0 # kWh per kW per year
    ROOF_SQFT_PER_KW = 90.0           # Minimum shadow-free area per kW
    CO2_KG_PER_KWH = 0.82             # Average grid emission factor in India

    @classmethod
    def calculate_central_subsidy(cls, capacity_kw: float) -> float:
        """Computes Central Government Rooftop Solar Subsidy (PM Surya Ghar scheme).
        - 1 kW: ₹30,000
        - 2 kW: ₹60,000
        - 3 kW and above: ₹78,000 max
        """
        if capacity_kw < 1.0:
            return 0.0
        elif capacity_kw < 2.0:
            return 30000.0
        elif capacity_kw < 3.0:
            return 60000.0
        else:
            return 78000.0

    @classmethod
    def evaluate(cls, inputs: CalculatorInputSchema) -> CalculatorResultSchema:
        # 1. Compute monthly units (kWh) consumed
        monthly_kwh = inputs.monthly_bill / inputs.electricity_rate_per_kwh

        # 2. Sizing required: Units / (30 days * 4.2 sun hours)
        raw_capacity_kw = monthly_kwh / (30.0 * cls.PEAK_SUN_HOURS_PER_DAY)

        # Standardize capacity to nearest 0.5 or 1 kW, minimum 1 kW
        recommended_kw = max(1.0, round(raw_capacity_kw * 2) / 2)

        # 3. Roof area check
        required_roof_sqft = recommended_kw * cls.ROOF_SQFT_PER_KW

        # 4. Financial projections
        gross_cost = recommended_kw * cls.BENCHMARK_COST_PER_KW
        subsidy = cls.calculate_central_subsidy(recommended_kw)
        net_cost = max(0.0, gross_cost - subsidy)

        # 5. Annual generation & savings
        annual_generation_kwh = recommended_kw * cls.ANNUAL_GENERATION_PER_KW
        annual_savings = annual_generation_kwh * inputs.electricity_rate_per_kwh

        # 6. Payback period
        payback_years = round(net_cost / max(annual_savings, 1.0), 1)

        # 7. 25-year lifetime savings (assuming 0.5% panel degradation/year, conservative flat rate)
        lifetime_25yr_savings = round((annual_savings * 25.0) - net_cost, 2)

        # 8. Environmental offset
        co2_saved_tons = round((annual_generation_kwh * cls.CO2_KG_PER_KWH) / 1000.0, 2)

        return CalculatorResultSchema(
            monthly_consumption_kwh=round(monthly_kwh, 1),
            recommended_capacity_kw=recommended_kw,
            required_roof_area_sqft=round(required_roof_sqft, 1),
            estimated_annual_generation_kwh=round(annual_generation_kwh, 1),
            estimated_gross_system_cost=round(gross_cost, 2),
            estimated_central_subsidy=round(subsidy, 2),
            estimated_net_cost=round(net_cost, 2),
            estimated_annual_savings=round(annual_savings, 2),
            payback_period_years=payback_years,
            lifetime_25yr_savings=lifetime_25yr_savings,
            co2_saved_tons_per_year=co2_saved_tons,
        )
