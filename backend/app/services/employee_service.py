"""Employee attendance & incentive helpers (Module 12)."""
from app.services.installation_service import distance_meters

GEO_FENCE_RADIUS_METERS = 100.0
DEFAULT_INCENTIVE_PER_KW = 1200.0


def is_within_site_geofence(
    emp_lat: float, emp_lon: float, site_lat: float, site_lon: float
) -> bool:
    return distance_meters(emp_lat, emp_lon, site_lat, site_lon) <= GEO_FENCE_RADIUS_METERS


def calculate_incentive(installed_kw: float, rate_per_kw: float = DEFAULT_INCENTIVE_PER_KW) -> float:
    return round(float(installed_kw) * float(rate_per_kw), 2)
