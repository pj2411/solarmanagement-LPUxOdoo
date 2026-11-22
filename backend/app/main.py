from __future__ import annotations

import logging
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import SQLAlchemyError

from app import models  # noqa: F401 - register all tables before create_all
from app.config import settings
from app.database import Base, engine
from app.migrations import ensure_schema
from app.routers import analytics, auth, crm, meta, operations, public, support

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)
ensure_schema(engine)

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Dynamic Solar Installation ERP API — FastAPI + PostgreSQL + Redis + OAuth2",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(SQLAlchemyError)
async def database_error_handler(request: Request, exc: SQLAlchemyError):
    logger.exception("Database error on %s", request.url.path)
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": {"message": "Database error"}},
    )


@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")


@app.get("/health", include_in_schema=False)
def bare_health():
    return {"status": "ok"}


for router in (
    meta.router,
    auth.router,
    crm.router,
    operations.router,
    support.router,
    analytics.router,
    public.router,
):
    app.include_router(router)


uploads = Path(__file__).resolve().parents[2] / "uploads"
uploads.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads)), name="uploads")
