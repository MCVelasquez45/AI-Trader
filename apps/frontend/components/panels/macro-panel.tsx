import PanelShell from "@/components/panels/panel-shell"
import type { RecommendationPayload } from "@/types/options"

export default function MacroPanel({ recommendation }: { recommendation: RecommendationPayload | null }) {
  const layer = recommendation?.rationale.layers.macro ?? {}
  const events: string[] = Array.isArray(layer["next_events"]) ? (layer["next_events"] as string[]) : []

  return (
    <PanelShell title="Macro Countdown">
      <p className="text-sm text-slate-300">
        Risk flag: {String(layer["risk_flag"] ?? "unknown").toUpperCase()} · Next FOMC/CPI window {layer["window"] ?? "—"}
      </p>
      <ul className="space-y-2 text-xs text-slate-400">
        {events.length ? (
          events.map((event) => (
            <li key={event} className="rounded border border-slate-800 bg-slate-900/60 p-3">
              {event}
            </li>
          ))
        ) : (
          <li className="rounded border border-dashed border-slate-800 p-3 text-slate-600">Upcoming macro events will surface here.</li>
        )}
      </ul>
    </PanelShell>
  )
}
