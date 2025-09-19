from __future__ import annotations

from datetime import datetime, timedelta
from typing import Dict, List

import numpy as np

from .clients.market_data import MarketDataClient, build_market_data_client
from .schemas import ContractCandidate, RiskProfile, ScreeningRequest, ScreeningResponse


class OptionAnalyticsService:
    def __init__(self, market_data_client: MarketDataClient | None = None) -> None:
        self.market_data = market_data_client or build_market_data_client()

    async def screen(self, request: ScreeningRequest) -> ScreeningResponse:
        chain = await self._load_chain(request.symbol)
        filtered = [c for c in chain if self._passes_risk_filters(c, request.risk_profile)]
        ranked = sorted(filtered, key=self._score_contract, reverse=True)[:5]

        diagnostics = {
            "universe": len(chain),
            "filtered": len(filtered),
            "risk_profile": request.risk_profile,
        }

        return ScreeningResponse(
            symbol=request.symbol,
            timestamp=datetime.utcnow().isoformat(),
            candidates=ranked,
            diagnostics=diagnostics,
        )

    async def _load_chain(self, symbol: str) -> List[ContractCandidate]:
        snapshot = await self._fetch_live_chain(symbol)
        if snapshot:
            return snapshot
        return self._mock_chain(symbol)

    async def _fetch_live_chain(self, symbol: str) -> List[ContractCandidate]:
        if not self.market_data:
            return []
        try:
            payload = await self.market_data.fetch_chain(symbol)
        except Exception:
            return []
        if not payload:
            return []
        contracts_payload = payload.get("contracts") or payload.get("candidates")
        if not contracts_payload:
            return []
        contracts: List[ContractCandidate] = []
        for raw in contracts_payload:
            normalized = self._normalize_contract(raw)
            if normalized is None:
                continue
            contracts.append(ContractCandidate(**normalized))
        return contracts

    def _normalize_contract(self, raw: Dict[str, object]) -> Dict[str, object] | None:
        try:
            return {
                "symbol": str(raw.get("symbol")),
                "delta": float(raw.get("delta", 0.0)),
                "gamma": float(raw.get("gamma", 0.0)),
                "theta": float(raw.get("theta", 0.0)),
                "vega": float(raw.get("vega", 0.0)),
                "implied_vol": float(raw.get("implied_vol", raw.get("iv", 0.0))),
                "open_interest": int(raw.get("open_interest", raw.get("oi", 0))),
                "volume": int(raw.get("volume", 0)),
                "bid": float(raw.get("bid", 0.0)),
                "ask": float(raw.get("ask", 0.0)),
                "mid": float(raw.get("mid", (float(raw.get("bid", 0.0)) + float(raw.get("ask", 0.0))) / 2 or 0)),
                "spread_pct": float(raw.get("spread_pct", raw.get("spread_percent", 0.0))),
                "liquidity_score": int(raw.get("liquidity_score", 0)),
                "expiry": str(raw.get("expiry")),
                "strike": float(raw.get("strike", 0.0)),
            }
        except (TypeError, ValueError):
            return None

    def _passes_risk_filters(self, contract: ContractCandidate, risk: RiskProfile) -> bool:
        dte = self._dte(contract)
        if risk is RiskProfile.conservative:
            return 0.2 <= contract.delta <= 0.4 and 30 <= dte <= 60 and contract.open_interest >= 1000 and contract.spread_pct <= 0.005
        if risk is RiskProfile.neutral:
            return 0.3 <= contract.delta <= 0.5 and 21 <= dte <= 45 and contract.open_interest >= 500
        return 0.45 <= contract.delta <= 0.65 and 7 <= dte <= 30 and contract.spread_pct <= 0.015

    def _score_contract(self, contract: ContractCandidate) -> float:
        liquidity = contract.liquidity_score / 100
        iv_penalty = max(0.2, min(1.0, 1 - (contract.implied_vol - 0.3)))
        time_factor = 1 - abs(self._dte(contract) - 30) / 100
        greeks_vector = np.array([contract.delta, contract.gamma, abs(contract.theta), contract.vega])
        greek_score = float(np.linalg.norm(greeks_vector) / 4)
        return liquidity * 0.4 + iv_penalty * 0.2 + time_factor * 0.2 + greek_score * 0.2

    def _dte(self, contract: ContractCandidate) -> int:
        expiry = datetime.fromisoformat(contract.expiry)
        return max(0, (expiry - datetime.utcnow()).days)

    def _mock_chain(self, symbol: str) -> List[ContractCandidate]:
        base = 150
        now = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        contracts: List[ContractCandidate] = []
        for idx in range(6):
            strike = base + idx * 5
            expiry = now + timedelta(days=30 + idx * 7)
            contracts.append(
                ContractCandidate(
                    symbol=f"{symbol} {expiry.date()} {int(strike)}C",
                    delta=0.2 + idx * 0.07,
                    gamma=0.05 + idx * 0.01,
                    theta=-0.03 - idx * 0.005,
                    vega=0.10 + idx * 0.01,
                    implied_vol=0.28 + idx * 0.02,
                    open_interest=1000 + idx * 500,
                    volume=500 + idx * 200,
                    bid=2.1 + idx * 0.2,
                    ask=2.3 + idx * 0.2,
                    mid=2.2 + idx * 0.2,
                    spread_pct=max(0.001, 0.008 - idx * 0.001),
                    liquidity_score=min(100, 80 + idx * 4),
                    expiry=expiry.isoformat(),
                    strike=strike,
                )
            )
        return contracts


def build_service() -> OptionAnalyticsService:
    return OptionAnalyticsService()
