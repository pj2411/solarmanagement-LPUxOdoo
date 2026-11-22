"""Redis-backed cache / OTP store with a safe in-process fallback.

Redis is part of the Docker stack. If a developer runs the API without Redis,
the app keeps working (cache misses only) instead of crashing on startup.
"""

from __future__ import annotations

import json
import logging
import time
from typing import Any

import redis

from app.config import settings

logger = logging.getLogger(__name__)

try:
    client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
    client.ping()
    REDIS_AVAILABLE = True
except Exception as exc:  # pragma: no cover - depends on environment
    logger.warning("Redis unavailable (%s); using in-memory fallback", exc)
    client = None
    REDIS_AVAILABLE = False

_memory: dict[str, tuple[str, float | None]] = {}


def _serialize(value: Any) -> str:
    return json.dumps(value, default=str)


def set_value(key: str, value: Any, ttl: int | None = None) -> None:
    if REDIS_AVAILABLE and client is not None:
        client.set(key, _serialize(value), ex=ttl)
        return
    expires = time.time() + ttl if ttl else None
    _memory[key] = (_serialize(value), expires)


def get_value(key: str) -> Any | None:
    raw: str | None
    if REDIS_AVAILABLE and client is not None:
        raw = client.get(key)
    else:
        entry = _memory.get(key)
        if not entry:
            return None
        value, expires = entry
        if expires and expires < time.time():
            _memory.pop(key, None)
            return None
        raw = value
    if raw is None:
        return None
    try:
        return json.loads(raw)
    except (TypeError, json.JSONDecodeError):
        return raw


def delete_value(key: str) -> None:
    if REDIS_AVAILABLE and client is not None:
        client.delete(key)
    else:
        _memory.pop(key, None)


def increment(key: str, ttl: int) -> int:
    """Fixed-window counter used for OTP and login rate limiting."""
    if REDIS_AVAILABLE and client is not None:
        pipe = client.pipeline()
        pipe.incr(key)
        pipe.expire(key, ttl, nx=True)
        result = pipe.execute()[0]
        return int(result)
    current = get_value(key) or 0
    current = int(current) + 1
    set_value(key, current, ttl)
    return current


def cache_get(key: str) -> Any | None:
    return get_value(f"cache:{key}")


def cache_set(key: str, value: Any, ttl: int | None = None) -> None:
    set_value(f"cache:{key}", value, ttl or settings.CACHE_TTL_SECONDS)


def invalidate_prefix(prefix: str) -> None:
    if REDIS_AVAILABLE and client is not None:
        for key in client.scan_iter(match=f"cache:{prefix}*"):
            client.delete(key)
        return
    for key in list(_memory):
        if key.startswith(f"cache:{prefix}"):
            _memory.pop(key, None)
