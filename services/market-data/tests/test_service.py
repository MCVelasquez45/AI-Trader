import asyncio
import pathlib
import sys

import pytest

ROOT = pathlib.Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.service import _synthetic_chain, fetch_equity_quote, fetch_options_chain


@pytest.mark.asyncio
async def test_equity_quote_fallback(monkeypatch):
    class DummyRedis:
        async def get(self, *_):
            return None

    from app import service
    monkeypatch.setattr(service, "get_redis", lambda: DummyRedis())

    quote = await fetch_equity_quote("aapl")
    assert quote["symbol"] == "AAPL"
    assert "timestamp" in quote


@pytest.mark.asyncio
async def test_chain_fallback(monkeypatch):
    class DummyRedis:
        async def scan(self, *_, **__):
            return 0, []

        async def mget(self, keys):  # pragma: no cover - not used
            return []

    from app import service
    monkeypatch.setattr(service, "get_redis", lambda: DummyRedis())

    chain = await fetch_options_chain("msft", limit=3)
    assert len(chain) == 3
    assert all(contract["symbol"].startswith("MSFT") for contract in chain)
