import pathlib
import sys

import pytest

ROOT = pathlib.Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.repository import SignalsRepository
from app.schemas import SignalSnapshot
from app.service import SignalsService


class StubRepository(SignalsRepository):
    def __init__(self) -> None:
        super().__init__(dsn=None)

    async def fetch_congressional_trades(self, symbol: str):
        return []

    async def fetch_macro_events(self):
        return []


@pytest.mark.asyncio
async def test_snapshot_includes_macro_and_congress_layers():
    service = SignalsService(repository=StubRepository())
    snapshot = await service.get_snapshot("AAPL")

    assert isinstance(snapshot, SignalSnapshot)
    assert snapshot.macro_events
    assert snapshot.congressional_events
