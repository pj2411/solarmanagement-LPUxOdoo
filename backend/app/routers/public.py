"""Content endpoints that make the marketing site fully database-driven."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.redis_client import cache_get, cache_set
from app.utils import ok, serialize

router = APIRouter(tags=["public website"])


def _rows(db, model):
    return [
        serialize(row)
        for row in db.query(model)
        .filter(model.is_active.is_(True))
        .order_by(model.sort_order, model.id)
        .all()
    ]


@router.get("/api/public/site")
def site_content(db: Session = Depends(get_db)):
    cached = cache_get("public_site")
    if cached is not None:
        return ok(cached)
    settings = {
        row.key: row.value for row in db.query(models.SiteSetting).all()
    }
    data = {
        "settings": settings,
        "packages": _rows(db, models.Package),
        "products": _rows(db, models.Product),
        "testimonials": _rows(db, models.Testimonial),
        "faqs": _rows(db, models.Faq),
    }
    cache_set("public_site", data, ttl=300)
    return ok(data)


@router.get("/api/public/packages")
def packages(db: Session = Depends(get_db)):
    return ok(_rows(db, models.Package))


@router.get("/api/public/products")
def products(db: Session = Depends(get_db)):
    return ok(_rows(db, models.Product))


@router.get("/api/public/testimonials")
def testimonials(db: Session = Depends(get_db)):
    return ok(_rows(db, models.Testimonial))


@router.get("/api/public/faqs")
def faqs(db: Session = Depends(get_db)):
    return ok(_rows(db, models.Faq))
