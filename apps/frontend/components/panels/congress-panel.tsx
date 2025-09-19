import PanelShell from "@/components/panels/panel-shell"
import type { RecommendationPayload } from "@/types/options"

export default function CongressPanel({ recommendation }: { recommendation: RecommendationPayload | null }) {
  const layer = recommendation?.rationale.layers.congress ?? {}
  const trades: Array<Record<string, unknown>> = (layer["recent_trades"] as Array<Record<string, unknown>>) ?? []

  return (
    <PanelShell title="Congressional Activity">
      <p className="text-sm text-slate-300">
        Recent related: {layer["recent_related"] ?? "none"} · Overlap score: {format(layer["overlap_score"])}
      </p>
      {trades.length ? (
        <ul className="space-y-2 text-xs text-slate-400">
          {trades.slice(0, 3).map((trade, index) => (
            <li key={index} className="rounded border border-slate-800 bg-slate-900/60 p-3">
              <p>{trade["name"] ?? "Legislator"} · {trade["party"] ?? "—"} · {trade["committee"] ?? "—"}</p>
              <p>Action: {trade["action"] ?? "—"} · Amount: {trade["amount"] ?? "—"}</p>
              <p>Date: {trade["date"] ?? "—"}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-500">No notable congressional trades in scope.</p>
      )}
    </PanelShell>
  )
}

function format(value: unknown) {
  if (value === null || value === undefined) return "—"
  if (typeof value === "number") return value.toFixed(2)
  return String(value)
}
