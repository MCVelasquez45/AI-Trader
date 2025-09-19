from typing import Any, Dict, List

from pydantic import BaseModel


class RecommendationRequest(BaseModel):
    user_id: str
    market_data_url: str
    chain_snapshot: Dict[str, Any]
    signals: Dict[str, Any]
    request: Dict[str, Any]


class ContractRecommendation(BaseModel):
    symbol: str
    strike: float
    expiry: str
    delta: float
    gamma: float
    theta: float
    vega: float
    implied_vol: float
    mid: float
    liquidity_score: float


class RecommendationResponse(BaseModel):
    decision: Dict[str, Any]
    contracts: List[ContractRecommendation]
    position: Dict[str, Any]
    confidence: float
    rationale: Dict[str, Any]
    disclosure: str
