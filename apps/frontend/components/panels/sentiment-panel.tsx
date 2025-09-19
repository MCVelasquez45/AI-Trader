import PanelShell from "@/components/panels/panel-shell"
import type { RecommendationPayload } from "@/types/options"

export default function SentimentPanel({ recommendation }: { recommendation: RecommendationPayload | null }) {
  const layer = recommendation?.rationale.layers.sentiment ?? {}

  return (
    <PanelShell title="Sentiment Pulse">
      <p className="text-sm text-slate-300">
        Score {format(layer["score"])} · Momentum {layer["momentum"] ?? "—"} · Uncertainty {format(layer["uncertainty"])}
      </p>
      <div className="grid gap-2 text-xs text-slate-400">
        <p>News momentum: {format(layer["news_trend"])} · Social drift: {format(layer["social_trend"])} </p>
        <p>Last refresh: {layer["last_updated"] ?? "—"}</p>
      </div>
    </PanelShell>
  )
}

function format(value: unknown) {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "number") return value.toFixed(2)
  return String(value)
}
