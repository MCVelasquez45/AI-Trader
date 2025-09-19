import PanelShell from "@/components/panels/panel-shell"
import type { RecommendationPayload } from "@/types/options"

export default function OptionsChainPanel({ recommendation }: { recommendation: RecommendationPayload | null }) {
  if (!recommendation) {
    return (
      <PanelShell title="Options Shortlist">
        <p className="text-sm text-slate-400">Candidates will appear here once you run the engine.</p>
      </PanelShell>
    )
  }

  return (
    <PanelShell title="Options Shortlist">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs text-slate-300">
          <thead className="text-slate-500">
            <tr>
              <th className="px-2 py-2">Contract</th>
              <th className="px-2 py-2">Δ</th>
              <th className="px-2 py-2">Γ</th>
              <th className="px-2 py-2">Θ</th>
              <th className="px-2 py-2">Vega</th>
              <th className="px-2 py-2">IV</th>
              <th className="px-2 py-2">Mid</th>
              <th className="px-2 py-2">Liquidity</th>
            </tr>
          </thead>
          <tbody>
            {recommendation.contracts.map((contract) => (
              <tr key={contract.symbol} className="border-t border-slate-800">
                <td className="px-2 py-2 text-slate-100">{contract.symbol}</td>
                <td className="px-2 py-2">{format(contract.delta)}</td>
                <td className="px-2 py-2">{format(contract.gamma)}</td>
                <td className="px-2 py-2">{format(contract.theta)}</td>
                <td className="px-2 py-2">{format(contract.vega)}</td>
                <td className="px-2 py-2">{format(contract.impliedVol)}</td>
                <td className="px-2 py-2">{format(contract.mid)}</td>
                <td className="px-2 py-2">{format(contract.liquidityScore)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PanelShell>
  )
}

function format(value?: number | string | null) {
  if (value === null || value === undefined) return "—"
  if (typeof value === "number") return value.toFixed(2)
  return value
}
