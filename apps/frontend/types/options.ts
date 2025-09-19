export type OptionRight = "CALL" | "PUT"

export type OptionContract = {
  symbol: string
  underlyingSymbol: string
  expiry: string
  strike: number
  right: OptionRight
  delta?: number
  gamma?: number
  theta?: number
  vega?: number
  impliedVol?: number
  openInterest?: number
  volume?: number
  bid?: number
  ask?: number
  liquidityScore?: number
  spreadPct?: number
  updatedAt?: string
}

export type RecommendationDecision = {
  direction: OptionRight
  strategy: "LONG_CALL" | "LONG_PUT" | "BULL_CALL_SPREAD" | "BEAR_PUT_SPREAD" | "COVERED_CALL" | "SHORT_PUT" | "CUSTOM"
}

export type RecommendationContract = OptionContract & {
  mid?: number
  probability?: number
}

export type PositionSettings = {
  contracts: number
  notional: number
  estMaxLoss: number
  estMaxGain?: number
  holdingWindowDays: number
}

export type RecommendationRationaleLayer = {
  summary: string
  details: Record<string, unknown>
}

export type RecommendationPayload = {
  decision: RecommendationDecision
  contracts: RecommendationContract[]
  position: PositionSettings
  confidence: number
  rationale: {
    summary: string
    layers: {
      liquidity: Record<string, unknown>
      sentiment: Record<string, unknown>
      congress: Record<string, unknown>
      indicators: Record<string, unknown>
      macro: Record<string, unknown>
    }
  }
  disclosure: string
}
