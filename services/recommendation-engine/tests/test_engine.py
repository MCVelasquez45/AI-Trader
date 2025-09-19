import pathlib
import sys

import numpy as np
import pytest

ROOT = pathlib.Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.feature_store import FeatureStoreClient
from app.model_registry import ModelRegistry
from app.schemas import RecommendationRequest
from app.service import RecommendationEngine


class StubFeatureStore(FeatureStoreClient):
    def __init__(self):
        pass

    def get_online_features(self, entity_rows):
        return {
            "options_liquidity_features:liquidity_score": 85,
            "options_liquidity_features:avg_open_interest": 2200,
        }


class StubRegistry(ModelRegistry):
    def __init__(self):
        pass

    def predict(self, features: np.ndarray) -> float:
        return float(min(0.9, features.mean()))


@pytest.mark.asyncio
async def test_recommendation_engine_returns_payload():
    engine = RecommendationEngine(feature_store=StubFeatureStore(), registry=StubRegistry())

    request = RecommendationRequest(
        user_id="user123",
        market_data_url="http://localhost",
        chain_snapshot={
            "candidates": [
                {
                    "symbol": "AAPL 2025-01-17 180C",
                    "strike": 180,
                    "expiry": "2025-01-17",
                    "delta": 0.35,
                    "gamma": 0.05,
                    "theta": -0.03,
                    "vega": 0.11,
                    "implied_vol": 0.28,
                    "mid": 2.45,
                    "liquidity_score": 90,
                }
            ]
        },
        signals={
            "iv_rank": 0.3,
            "sentiment_score": 0.2,
            "sentiment_momentum": "up",
            "congressional_events": [],
            "macro_events": [],
        },
        request={"capital_usd": 5000, "risk_profile": "conservative"},
    )

    response = await engine.recommend(request)

    assert response.decision["direction"] in {"CALL", "PUT"}
    assert response.contracts
    assert 0 <= response.confidence <= 1
