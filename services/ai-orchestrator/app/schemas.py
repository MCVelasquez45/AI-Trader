from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class RationaleRequest(BaseModel):
    user_id: str
    symbol: str
    recommendation: Dict[str, Any]
    signals: Optional[Dict[str, Any]] = None


class RationaleResponse(BaseModel):
    summary: str
    layers: Dict[str, Dict[str, Any]]
    compliance: Dict[str, Any] = Field(default_factory=dict)
