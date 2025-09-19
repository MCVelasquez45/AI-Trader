from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, List

import numpy as np

from .feature_store import FeatureStoreClient, build_feature_store_client
from .model_registry import ModelRegistry, build_registry
from .schemas import ContractRecommendation, RecommendationRequest, RecommendationResponse


@dataclass
class StrategyRule:
    name: str
    direction: str
    min_confidence: float


class RecommendationEngine:
    def __init__(
        self,
        feature_store: FeatureStoreClient | None = None,
        registry: ModelRegistry | None = None,
    ) -> None:
        self.feature_store = feature_store or build_feature_store_client()
        self.registry = registry or build_registry()
        self.rules = [
            StrategyRule(name="LONG_CALL", direction="CALL", min_confidence=0.55),
            StrategyRule(name="LONG_PUT", direction="PUT", min_confidence=0.55),
            StrategyRule(name="BULL_CALL_SPREAD", direction="CALL", min_confidence=0.5),
        ]

    async def recommend(self, payload: RecommendationRequest) -> RecommendationResponse:
        chain = payload.chain_snapshot.get("candidates", [])
        signals = payload.signals

        contracts = [self._build_contract(candidate) for candidate in chain]
        if not contracts:
            raise ValueError("empty contract universe")

        best_contract = max(contracts, key=lambda c: c.liquidity_score)
        features = self._assemble_features(best_contract, signals, payload.request)
        score = self.registry.predict(features)
        score = float(max(0.0, min(score, 0.99)))
        chosen_rule = self._select_rule(score)

        position = self._position_size(best_contract.mid, payload.request)

        rationale = {
            "summary": "Momentum supportive with contained event risk.",
            "layers": {
                "liquidity": {
                    "oi": payload.chain_snapshot.get("diagnostics", {}).get("universe", "n/a"),
                    "spread_pct": best_contract.mid * 0.01,
                },
                "sentiment": {
                    "score": signals.get("sentiment_score"),
                    "momentum": signals.get("sentiment_momentum"),
                },
                "congress": {
                    "recent_related": signals.get("congressional_recent_related"),
                    "events": signals.get("congressional_events", [])[:3],
                },
                "indicators": {
                    "rsi": signals.get("rsi"),
                    "macd": signals.get("macd"),
                    "ivr": signals.get("iv_rank"),
                    "trend_regime": signals.get("trend_regime"),
                },
                "macro": {
                    "next_events": signals.get("macro_events", [])[:3],
                    "risk_flag": signals.get("macro_risk_flag"),
                },
            },
        }

        decision = {"direction": chosen_rule.direction, "strategy": chosen_rule.name}

        return RecommendationResponse(
            decision=decision,
            contracts=[best_contract],
            position=position,
            confidence=score,
            rationale=rationale,
            disclosure="Educational information, not investment advice.",
        )

    def _build_contract(self, candidate: Dict[str, Any]) -> ContractRecommendation:
        return ContractRecommendation(
            symbol=candidate.get("symbol"),
            strike=float(candidate.get("strike", 0)),
            expiry=candidate.get("expiry", datetime.utcnow().date().isoformat()),
            delta=float(candidate.get("delta", 0)),
            gamma=float(candidate.get("gamma", 0)),
            theta=float(candidate.get("theta", 0)),
            vega=float(candidate.get("vega", 0)),
            implied_vol=float(candidate.get("implied_vol", 0)),
            mid=float(candidate.get("mid", 0)),
            liquidity_score=float(candidate.get("liquidity_score", 0)),
        )

    def _assemble_features(self, contract: ContractRecommendation, signals: Dict[str, Any], request: Dict[str, Any]) -> np.ndarray:
        liquidity = contract.liquidity_score / 100
        ivr = float(signals.get("iv_rank", 0))
        sentiment = float(signals.get("sentiment_score", 0))
        risk_bias = {"conservative": 0.4, "neutral": 0.5, "aggressive": 0.6}.get(request.get("risk_profile"), 0.5)

        feast_features = self.feature_store.get_online_features(
            {
                "symbol": contract.symbol,
                "expiry": contract.expiry,
                "strike": contract.strike,
            }
        )
        liquidity_score = float(feast_features.get("options_liquidity_features:liquidity_score", liquidity))
        avg_open_interest = float(feast_features.get("options_liquidity_features:avg_open_interest", contract.liquidity_score))

        return np.array([liquidity, ivr, sentiment, risk_bias, liquidity_score / 100, avg_open_interest / 1000])

    def _select_rule(self, score: float) -> StrategyRule:
        for rule in self.rules:
            if score >= rule.min_confidence:
                return rule
        return self.rules[0]

    def _position_size(self, mid: float, request: Dict[str, Any]) -> Dict[str, Any]:
        capital = float(request.get("capital_usd", 0))
        per_trade_cap = max(1, capital * 0.02)
        contracts = max(1, int(per_trade_cap / max(mid, 0.01)))
        return {
            "contracts": contracts,
            "notional": round(contracts * mid * 100, 2),
            "est_max_loss": round(contracts * mid * 100, 2),
            "holdingWindowDays": 21,
        }


def build_engine() -> RecommendationEngine:
    return RecommendationEngine()
