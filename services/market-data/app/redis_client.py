from __future__ import annotations

from typing import Optional

from redis.asyncio import Redis

from .config import get_settings

_settings = get_settings()
_redis: Optional[Redis] = None


def get_redis() -> Redis:
    global _redis
    if _redis is None:
        _redis = Redis.from_url(_settings.redis_url, decode_responses=False)
    return _redis


def namespaced(key: str) -> str:
    if not _settings.redis_namespace:
        return key
    return f"{_settings.redis_namespace}:{key}"
