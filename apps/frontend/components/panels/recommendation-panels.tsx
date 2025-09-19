import TopRecommendationCard from "@/components/panels/top-recommendation-card"
import LiquidityPanel from "@/components/panels/liquidity-panel"
import SentimentPanel from "@/components/panels/sentiment-panel"
import CongressPanel from "@/components/panels/congress-panel"
import IndicatorsPanel from "@/components/panels/indicators-panel"
import OptionsChainPanel from "@/components/panels/options-chain-panel"
import MacroPanel from "@/components/panels/macro-panel"
import type { RecommendationPayload } from "@/types/options"

const skeletonRows = new Array(4).fill(null)

export default function RecommendationPanels({
  recommendation,
  isLoading,
  symbol,
  onRetry
}: {
  recommendation: RecommendationPayload | null
  isLoading: boolean
  symbol: string
  onRetry: () => void
}) {
  if (isLoading) {
    return (
      <div className="grid gap-5">
        {skeletonRows.map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-xl bg-slate-900/60" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <TopRecommendationCard recommendation={recommendation} symbol={symbol} isLoading={isLoading} onRetry={onRetry} />
      <div className="grid gap-5 2xl:grid-cols-3">
        <LiquidityPanel recommendation={recommendation} />
        <SentimentPanel recommendation={recommendation} />
        <MacroPanel recommendation={recommendation} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <IndicatorsPanel recommendation={recommendation} />
        <CongressPanel recommendation={recommendation} />
      </div>
      <OptionsChainPanel recommendation={recommendation} />
      <footer className="rounded-xl border border-slate-800 bg-slate-950/70 px-5 py-4 text-xs text-slate-500">
        <p>Educational information. Not investment advice. Data may be delayed. Review liquidity and event risk before trading.</p>
      </footer>
    </div>
  )
}
