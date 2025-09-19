from __future__ import annotations

import json
from datetime import datetime, timedelta
from typing import Any, Dict, List

from redis.asyncio import Redis

from .config import get_settings
from .redis_client import get_redis, namespaced

settings = get_settings()


def _decode(value: bytes | None) -> Dict[str, Any] | None:
    if not value:
        return None
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return None


async def fetch_equity_quote(symbol: str) -> Dict[str, Any]:
    redis = get_redis()
    key = namespaced(f"equity:aggregate:{symbol.upper()}")
    payload = _decode(await redis.get(key))
    if payload:
        return payload
    return _synthetic_equity(symbol)


async def fetch_options_chain(symbol: str, limit: int | None = None) -> List[Dict[str, Any]]:
    redis = get_redis()
    limit = limit or settings.default_chain_contracts
    pattern = namespaced(f"options:quote:{symbol.upper()}*")

    candidates: List[Dict[str, Any]] = []
    cursor = 0
    redis_client: Redis = redis
    while True:
        cursor, keys = await redis_client.scan(cursor=cursor, match=pattern, count=limit)
        if not keys:
            if cursor == 0:
                break
            continue
        values = await redis_client.mget(keys)
        for value in values:
            decoded = _decode(value)
            if decoded:
                candidates.append(decoded)
        if cursor == 0 or len(candidates) >= limit:
            break

    if candidates:
        candidates.sort(key=lambda item: item.get("mid", 0), reverse=True)
        return candidates[:limit]

    return _synthetic_chain(symbol, limit)


def _synthetic_equity(symbol: str) -> Dict[str, Any]:
    now = datetime.utcnow().isoformat()
    return {
        "symbol": symbol.upper(),
        "close": 100.5,
        "high": 101.2,
        "low": 99.8,
        "volume": 1000000,
        "vwap": 100.7,
        "timestamp": now,
    }


def _synthetic_chain(symbol: str, limit: int) -> List[Dict[str, Any]]:
    now = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    contracts: List[Dict[str, Any]] = []
    for idx in range(limit):
        expiry = now + timedelta(days=30 + idx * 7)
        strike = 150 + idx * 5
        contracts.append(
            {
                "symbol": f"{symbol.upper()} {expiry.date()} {strike}C",
                "bid": 2.0 + idx * 0.25,
                "ask": 2.2 + idx * 0.25,
                "mid": 2.1 + idx * 0.25,
                "delta": 0.25 + idx * 0.05,
                "gamma": 0.04 + idx * 0.005,
                "theta": -0.03 - idx * 0.004,
                "vega": 0.1 + idx * 0.01,
                "open_interest": 1000 + idx * 400,
                "volume": 300 + idx * 100,
                "spread_pct": 0.01,
                "liquidity_score": 80 + idx * 4,
                "expiry": expiry.date().isoformat(),
                "strike": strike,
            }
        )
    return contracts
