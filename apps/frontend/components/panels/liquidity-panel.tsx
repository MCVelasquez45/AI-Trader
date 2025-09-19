import PanelShell from "@/components/panels/panel-shell"
import type { RecommendationPayload } from "@/types/options"

type Props = {
  recommendation: RecommendationPayload | null
}

export default function LiquidityPanel({ recommendation }: Props) {
  const layer = recommendation?.rationale.layers.liquidity ?? {}

  const fields: Array<{ label: string; value: unknown }> = [
    { label: "Open Interest", value: layer["oi"] },
    { label: "Volume", value: layer["volume"] },
    { label: "Spread %", value: layer["spread_pct"] },
    { label: "NBBO", value: layer["nbbo"] },
    { label: "Depth", value: layer["depth_snapshot"] }
  ]

  return (
    <PanelShell title="Liquidity Snapshot">
      <div className="grid gap-3 md:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label} className="rounded border border-slate-800 bg-slate-900/70 p-3 text-xs text-slate-400">
            <p className="uppercase tracking-wide text-slate-500">{field.label}</p>
            <p className="mt-1 text-sm text-slate-200">{formatValue(field.value)}</p>
          </div>
        ))}
      </div>
    </PanelShell>
  )
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "—"
  }

  if (typeof value === "number") {
    if (value > 1000) return value.toLocaleString()
    return value.toFixed(2)
  }

  return String(value)
}
