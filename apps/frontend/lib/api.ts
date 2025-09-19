import { RecommendationPayload } from "@/types/options"

type SymbolSearchResponse = {
  symbol: string
  name: string
  type: string
  exchange: string
}

type WatchlistItem = {
  symbol: string
  note?: string
}

type RiskProfile = "conservative" | "neutral" | "aggressive"

type RecommendationRequest = {
  symbol: string
  risk_profile: RiskProfile
  capital_usd: number
  constraints?: Record<string, unknown>
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api"

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text()
    throw new Error(body || response.statusText)
  }
  return (await response.json()) as T
}

export async function searchSymbols(query: string): Promise<SymbolSearchResponse[]> {
  if (!query) return []

  const response = await fetch(`${API_BASE_URL}/symbols?query=${encodeURIComponent(query)}`, {
    cache: "no-store"
  })

  return handleResponse<SymbolSearchResponse[]>(response)
}

export async function fetchWatchlist(): Promise<WatchlistItem[]> {
  const response = await fetch(`${API_BASE_URL}/watchlist`, { cache: "no-store" })
  return handleResponse<WatchlistItem[]>(response)
}

export async function updateCapital(capital: number): Promise<{ capital: number }> {
  const response = await fetch(`${API_BASE_URL}/profile/capital`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ capital_usd: capital })
  })

  return handleResponse<{ capital: number }>(response)
}

export async function fetchRecommendation(payload: RecommendationRequest): Promise<RecommendationPayload> {
  const response = await fetch(`${API_BASE_URL}/recommendations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })

  return handleResponse<RecommendationPayload>(response)
}

export type { SymbolSearchResponse, WatchlistItem, RiskProfile, RecommendationRequest }
