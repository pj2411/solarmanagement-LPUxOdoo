from typing import Any, List, Optional
from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from fastapi.exceptions import RequestValidationError
from datetime import datetime, timezone


class SIMSException(Exception):
    """Base exception for all domain-specific SIMS errors."""
    def __init__(self, message: str, code: str = "BUSINESS_RULE_VIOLATION", status_code: int = 400):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(self.message)


class NotFoundException(SIMSException):
    def __init__(self, resource: str, identifier: Any):
        super().__init__(
            message=f"{resource} with identifier '{identifier}' was not found.",
            code="NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND,
        )


class UnauthorizedException(SIMSException):
    def __init__(self, message: str = "Invalid authentication credentials."):
        super().__init__(
            message=message,
            code="UNAUTHORIZED",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


class ForbiddenException(SIMSException):
    def __init__(self, message: str = "You do not have permission to perform this action."):
        super().__init__(
            message=message,
            code="FORBIDDEN",
            status_code=status.HTTP_403_FORBIDDEN,
        )


class InsufficientStockException(SIMSException):
    def __init__(self, sku: str, requested: int, available: int):
        super().__init__(
            message=f"Insufficient stock for SKU '{sku}'. Requested: {requested}, Available: {available}.",
            code="INSUFFICIENT_STOCK",
            status_code=status.HTTP_400_BAD_REQUEST,
        )


async def sims_exception_handler(request: Request, exc: SIMSException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message,
            },
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = []
    for error in exc.errors():
        field = " -> ".join([str(x) for x in error.get("loc", [])])
        errors.append({
            "field": field,
            "message": error.get("msg"),
            "type": error.get("type"),
        })

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Input validation failed. Please check the supplied parameters.",
                "details": errors,
            },
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )
