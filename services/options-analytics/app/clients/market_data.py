from __future__ import annotations

import os
from typing import Any, Dict

import httpx


class MarketDataClient:
    def __init__(self, base_url: str | None = None, timeout: float = 1.0) -> None:
        self.base_url = base_url or os.getenv("MARKET_DATA_URL", "")
        self.timeout = timeout

    async def fetch_chain(self, symbol: str) -> Dict[str, Any] | None:
        if not self.base_url:
            return None
        url = f"{self.base_url.rstrip('/')}/chains/{symbol.upper()}"
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()

    async def fetch_quote(self, symbol: str) -> Dict[str, Any] | None:
        if not self.base_url:
            return None
        url = f"{self.base_url.rstrip('/')}/quotes/{symbol.upper()}"
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()


def build_market_data_client() -> MarketDataClient:
    return MarketDataClient()
