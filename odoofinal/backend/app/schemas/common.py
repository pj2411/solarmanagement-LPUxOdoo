from datetime import datetime, timezone
from typing import Any, Generic, List, Optional, TypeVar
from pydantic import BaseModel, Field

DataT = TypeVar("DataT")


class ApiResponse(BaseModel, Generic[DataT]):
    """Standard unified response wrapper for all API endpoints."""
    success: bool = True
    data: Optional[DataT] = None
    message: Optional[str] = "Operation successful"
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class PaginatedData(BaseModel, Generic[DataT]):
    """Standard pagination wrapper for collection endpoints."""
    items: List[DataT] = Field(default_factory=list)
    total: int = 0
    page: int = 1
    limit: int = 20
    total_pages: int = 0


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[List[Any]] = None


class ApiErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
