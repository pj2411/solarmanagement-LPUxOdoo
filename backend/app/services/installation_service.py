"""Field installation & commissioning rules (Module 09)."""
import math

from app.core.exceptions import ConflictException

MAX_EARTH_RESISTANCE_OHMS = 5.0
MIN_GRID_VOLTAGE = 180.0
MAX_GRID_VOLTAGE = 260.0


def validate_electrical_tests(
    voc_measured: float,
    isc_measured: float,
    earth_resistance_ohms: float,
    grid_synchronization_tested: bool,
) -> None:
    """Reject unsafe commissioning data before it can reach the sign-off stage."""
    if any(value is None or value <= 0 for value in (voc_measured, isc_measured)):
        raise ConflictException("Voc and Isc measurements must be positive.")
    if earth_resistance_ohms > MAX_EARTH_RESISTANCE_OHMS:
        raise ConflictException(
            f"Earthing resistance {earth_resistance_ohms}Ω exceeds the {MAX_EARTH_RESISTANCE_OHMS}Ω safety limit."
        )
    if not grid_synchronization_tested:
        raise ConflictException("Grid synchronisation test must pass before commissioning.")


def distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine distance — reused by geo-fenced attendance and survey photo checks."""
    radius = 6_371_000.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * radius * math.asin(math.sqrt(a))
