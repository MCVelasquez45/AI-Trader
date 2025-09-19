from __future__ import annotations

from datetime import datetime, timedelta
from random import randint
from typing import List

from .repository import SignalsRepository, build_repository
from .schemas import SignalSnapshot


class SignalsService:
    def __init__(self, repository: SignalsRepository | None = None) -> None:
        self.repository = repository or build_repository()

    async def get_snapshot(self, symbol: str) -> SignalSnapshot:
        now = datetime.utcnow()

        congress_events = await self.repository.fetch_congressional_trades(symbol)
        macro_events = await self.repository.fetch_macro_events()

        if not macro_events:
            macro_events = self._mock_macro_events(now)
        if not congress_events:
            congress_events = self._mock_congressional_events(now)

        return SignalSnapshot(
            symbol=symbol,
            rsi=54.2,
            macd="bullish-crossover",
            adx=22.3,
            trend_regime="uptrend",
            iv=0.29,
            iv_rank=0.32,
            earnings_proximity="11 days",
            sentiment_score=0.24,
            sentiment_momentum="improving",
            sentiment_uncertainty=0.18,
            congressional_recent_related="none" if randint(0, 1) else "mild",
            congressional_events=congress_events,
            macro_events=macro_events,
            macro_risk_flag="FOMC" in " ".join(macro_events),
            generated_at=now,
        )

    def _mock_macro_events(self, now: datetime) -> List[str]:
        events = [
            {"event": "CPI", "date": (now + timedelta(days=5)).date().isoformat()},
            {"event": "FOMC", "date": (now + timedelta(days=12)).date().isoformat()},
        ]
        return [f"{event['event']} on {event['date']}" for event in events]

    def _mock_congressional_events(self, now: datetime) -> List[dict]:
        return [
            {
                "name": "Doe, Jane",
                "action": "buy",
                "amount": "$15k",
                "date": (now - timedelta(days=22)).date().isoformat(),
            }
        ]


def build_service() -> SignalsService:
    return SignalsService()
