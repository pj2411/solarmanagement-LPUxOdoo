from fastapi import APIRouter

from app.redis_client import REDIS_AVAILABLE
from app.security import ROLES
from app.utils import ok

router = APIRouter(tags=["meta"])


@router.get("/api/roles")
def get_roles():
    return ok(sorted(ROLES))


@router.get("/api/health")
def health():
    return ok(
        {
            "status": "ok",
            "database": "connected",
            "redis": "connected" if REDIS_AVAILABLE else "fallback",
        }
    )
