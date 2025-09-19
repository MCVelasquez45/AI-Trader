import PanelShell from "@/components/panels/panel-shell"
import type { RecommendationPayload } from "@/types/options"

export default function IndicatorsPanel({ recommendation }: { recommendation: RecommendationPayload | null }) {
  const layer = recommendation?.rationale.layers.indicators ?? {}

  const rows: Array<{ label: string; value: unknown }> = [
    { label: "RSI", value: layer["rsi"] },
    { label: "MACD", value: layer["macd"] },
    { label: "Trend Regime", value: layer["trend_regime"] },
    { label: "IV", value: layer["iv"] },
    { label: "IVR", value: layer["ivr"] }
  ]

  return (
    <PanelShell title="Market Indicators">
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="rounded border border-slate-800 bg-slate-900/70 p-3 text-xs text-slate-400">
            <p className="uppercase tracking-wide text-slate-500">{row.label}</p>
            <p className="mt-1 text-sm text-slate-200">{format(row.value)}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500">Earnings proximity: {layer["earnings_proximity"] ?? "—"}</p>
    </PanelShell>
  )
}

function format(value: unknown) {
  if (value === null || value === undefined) return "—"
  if (typeof value === "number") return value.toFixed(2)
  return String(value)
}
