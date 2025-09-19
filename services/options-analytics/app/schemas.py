from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class RiskProfile(str, Enum):
    conservative = "conservative"
    neutral = "neutral"
    aggressive = "aggressive"


class ContractCandidate(BaseModel):
    symbol: str
    delta: float
    gamma: float
    theta: float
    vega: float
    implied_vol: float
    open_interest: int
    volume: int
    bid: float
    ask: float
    mid: float
    spread_pct: float
    liquidity_score: int = Field(ge=0, le=100)
    expiry: str
    strike: float


class ScreeningRequest(BaseModel):
    symbol: str
    risk_profile: RiskProfile
    capital_usd: float = Field(gt=0)
    constraints: Optional[dict] = None


class ScreeningResponse(BaseModel):
    symbol: str
    timestamp: str
    candidates: List[ContractCandidate]
    diagnostics: dict
