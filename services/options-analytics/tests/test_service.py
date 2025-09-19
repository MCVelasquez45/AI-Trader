import pathlib
import sys

import pytest

ROOT = pathlib.Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.schemas import RiskProfile, ScreeningRequest
from app.service import OptionAnalyticsService


@pytest.mark.asyncio
async def test_screen_returns_ranked_candidates():
    service = OptionAnalyticsService()

    request = ScreeningRequest(symbol="AAPL", risk_profile=RiskProfile.conservative, capital_usd=5000)
    response = await service.screen(request)

    assert response.symbol == "AAPL"
    assert response.candidates
    assert response.diagnostics["filtered"] <= response.diagnostics["universe"]
    assert response.candidates[0].liquidity_score >= response.candidates[-1].liquidity_score
