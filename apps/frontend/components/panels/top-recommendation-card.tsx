import PanelShell from "@/components/panels/panel-shell"
import type { RecommendationPayload } from "@/types/options"

type Props = {
  recommendation: RecommendationPayload | null
  symbol: string
  isLoading: boolean
  onRetry: () => void
}

export default function TopRecommendationCard({ recommendation, symbol, isLoading, onRetry }: Props) {
  if (!recommendation) {
    return (
      <PanelShell
        title="Call or Put?"
        rightSlot={
          <button className="text-xs uppercase tracking-wide text-brand-200" onClick={onRetry} type="button">
            {isLoading ? "Loading" : "Generate"}
          </button>
        }
      >
        <p className="text-sm text-slate-400">
          Choose a ticker, risk profile, and capital to unlock live recommendations.
        </p>
      </PanelShell>
    )
  }

  const { decision, position, contracts, confidence, rationale } = recommendation
  const primary = contracts[0]

  return (
    <PanelShell
      title="Call or Put?"
      rightSlot={
        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
          <span>Confidence {Math.round(confidence * 100)}%</span>
          <button className="rounded border border-brand-500/20 px-2 py-1 text-brand-200" onClick={onRetry} type="button">
            Refresh
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-2 text-left">
        <h3 className="text-2xl font-semibold text-slate-100">
          {symbol} · {decision.direction} · {decision.strategy.replace(/_/g, " ")}
        </h3>
        {primary && (
          <p className="text-sm text-slate-300">
            {primary.symbol} · Strike {primary.strike} · Exp {primary.expiry} · Mid ${primary.mid?.toFixed(2) ?? "—"}
          </p>
        )}
        <p className="text-sm text-slate-400">Contracts: {position.contracts} · Notional ${position.notional.toFixed(2)}</p>
        <p className="text-xs text-slate-500">Holding window: {position.holdingWindowDays} days</p>
        <p className="text-sm text-slate-300">{rationale.summary}</p>
      </div>
    </PanelShell>
  )
}
