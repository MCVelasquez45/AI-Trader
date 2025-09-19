from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, List


@dataclass
class ContextDocument:
    id: str
    content: str
    score: float


class AiOrchestrator:
    def __init__(self) -> None:
        # TODO: inject vector store + LLM clients
        pass

    async def build_rationale(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        symbol = payload["symbol"]
        recommendation = payload.get("recommendation", {})
        signals = payload.get("signals", {})
        documents = await self._retrieve(symbol)
        narrative = self._synthesize(symbol, recommendation, signals, documents)
        return narrative

    async def _retrieve(self, symbol: str) -> List[ContextDocument]:
        # TODO: query pgvector with freshness filters
        return [
            ContextDocument(id="primer", content=f"{symbol} operates in consumer electronics.", score=0.92),
            ContextDocument(id="news", content=f"{symbol} reported steady demand last week.", score=0.88),
        ]

    def _synthesize(self, symbol: str, recommendation: Dict[str, Any], signals: Dict[str, Any], documents: List[ContextDocument]) -> Dict[str, Any]:
        summary = f"{symbol} shows constructive momentum with manageable macro risk."
        top_contract = recommendation.get("contracts", [{}])[0]
        layers = {
            "liquidity": {
                "oi": top_contract.get("open_interest", "n/a"),
                "spread_pct": top_contract.get("spread_pct", "n/a"),
            },
            "sentiment": {
                "sources": [doc.content for doc in documents if doc.id == "news"],
                "score": signals.get("sentiment_score", 0.0),
                "momentum": signals.get("sentiment_momentum", "flat"),
            },
            "congress": {
                "notes": signals.get("congressional_events", [])[:2],
                "recent_related": signals.get("congressional_recent_related", "none"),
            },
            "indicators": {
                "rsi": signals.get("rsi"),
                "macd": signals.get("macd"),
                "ivr": signals.get("iv_rank"),
                "trend_regime": signals.get("trend_regime"),
            },
            "macro": {
                "next_events": signals.get("macro_events", [])[:3],
                "risk_flag": signals.get("macro_risk_flag", False),
                "as_of": datetime.utcnow().isoformat(),
            },
        }
        return {
            "summary": summary,
            "layers": layers,
            "compliance": {
                "disclaimer": "Educational information, not investment advice."
            }
        }


def build_orchestrator() -> AiOrchestrator:
    return AiOrchestrator()
