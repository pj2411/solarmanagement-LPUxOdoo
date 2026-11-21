from typing import Optional
import redis.asyncio as aioredis
from app.core.config import settings

redis_pool: Optional[aioredis.Redis] = None


async def get_redis_client() -> aioredis.Redis:
    """Provides an active async Redis client instance."""
    global redis_pool
    if redis_pool is None:
        redis_pool = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            max_connections=20,
        )
    return redis_pool


async def close_redis_connection() -> None:
    """Closes the active Redis connection pool gracefully on shutdown."""
    global redis_pool
    if redis_pool:
        await redis_pool.close()
        redis_pool = None
