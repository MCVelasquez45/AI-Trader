from datetime import datetime
from typing import Dict, List

from pydantic import BaseModel


class SignalSnapshot(BaseModel):
    symbol: str
    rsi: float
    macd: str
    adx: float
    trend_regime: str
    iv: float
    iv_rank: float
    earnings_proximity: str
    sentiment_score: float
    sentiment_momentum: str
    sentiment_uncertainty: float
    congressional_recent_related: str
    congressional_events: List[Dict[str, str]]
    macro_events: List[str]
    macro_risk_flag: bool
    generated_at: datetime
