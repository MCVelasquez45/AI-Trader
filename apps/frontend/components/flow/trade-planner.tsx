"use client"

import { useEffect, useMemo, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { motion } from "framer-motion"

import { fetchRecommendation, RiskProfile } from "@/lib/api"
import type { RecommendationPayload } from "@/types/options"
import { useLiveData } from "@/hooks/use-live-data"
import CapitalInput from "@/components/flow/capital-input"
import RiskSelector from "@/components/flow/risk-selector"
import StockSelector from "@/components/flow/stock-selector"
import RecommendationPanels from "@/components/panels/recommendation-panels"

const constraintsTemplate = {
  earnings_window_ok: false,
  max_spread_pct: 1.0
}

const defaultCapital = 5000

const steps = [
  { id: 0, label: "Choose Stock" },
  { id: 1, label: "Risk Tolerance" },
  { id: 2, label: "Capital" },
  { id: 3, label: "AI Suggestion" }
] as const

type Step = (typeof steps)[number]

export default function TradePlanner() {
  const { subscribe, unsubscribe } = useLiveData()
  const [currentStep, setCurrentStep] = useState<Step>(steps[0])
  const [symbol, setSymbol] = useState<string>("")
  const [riskProfile, setRiskProfile] = useState<RiskProfile>("conservative")
  const [capital, setCapital] = useState<number>(defaultCapital)
  const [latestRecommendation, setLatestRecommendation] = useState<RecommendationPayload | null>(null)

  const recommendationMutation = useMutation({
    mutationFn: fetchRecommendation,
    onSuccess: (data) => {
      setLatestRecommendation(data)
      setCurrentStep(steps[3])
    }
  })

  useEffect(() => {
    if (!symbol) return
    subscribe(symbol)
    return () => unsubscribe(symbol)
  }, [symbol, subscribe, unsubscribe])

  const canRequest = useMemo(() => Boolean(symbol && capital > 0 && riskProfile), [symbol, capital, riskProfile])

  const handleSubmit = async () => {
    if (!canRequest) return
    await recommendationMutation.mutateAsync({
      symbol,
      risk_profile: riskProfile,
      capital_usd: capital,
      constraints: constraintsTemplate
    })
  }

  const nextStep = () => {
    const index = steps.findIndex((step) => step.id === currentStep.id)
    const next = steps[index + 1]
    if (next) setCurrentStep(next)
  }

  const previousStep = () => {
    const index = steps.findIndex((step) => step.id === currentStep.id)
    const prev = steps[index - 1]
    if (prev) setCurrentStep(prev)
  }

  useEffect(() => {
    if (symbol) setCurrentStep(steps[1])
  }, [symbol])

  useEffect(() => {
    if (capital !== defaultCapital) setCurrentStep(steps[3])
  }, [capital])

  const isLoading = recommendationMutation.isPending
  const error = recommendationMutation.error as Error | null

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 pb-16 pt-8">
      <header className="flex flex-col gap-2 text-slate-200">
        <h1 className="text-3xl font-semibold">AI Options Strategist</h1>
        <p className="text-sm text-slate-400">
          Guided flow to translate your market thesis into an options position, backed by live data and AI rationale.
        </p>
      </header>

      <nav className="grid grid-cols-2 gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 md:grid-cols-4">
        {steps.map((step) => {
          const active = currentStep.id === step.id
          return (
            <button
              key={step.id}
              className={`flex h-16 flex-col justify-center rounded-lg border px-3 text-left transition ${
                active ? "border-brand-500 bg-brand-500/10 text-brand-100" : "border-transparent bg-slate-900 text-slate-400"
              }`}
              onClick={() => setCurrentStep(step)}
              type="button"
            >
              <span className="text-xs uppercase tracking-wide text-slate-500">Step {step.id + 1}</span>
              <span className="text-sm font-semibold">{step.label}</span>
            </button>
          )
        })}
      </nav>

      <section className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <motion.aside
          key={currentStep.id}
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-5 rounded-xl border border-slate-800 bg-slate-900/40 p-5"
        >
          {currentStep.id === 0 && (
            <StockSelector
              value={symbol}
              onValueChange={(value) => {
                setSymbol(value)
                nextStep()
              }}
            />
          )}
          {currentStep.id === 1 && (
            <RiskSelector
              value={riskProfile}
              onChange={(value) => {
                setRiskProfile(value)
                nextStep()
              }}
            />
          )}
          {currentStep.id === 2 && (
            <CapitalInput
              value={capital}
              onChange={(value) => setCapital(value)}
              onPersist={() => nextStep()}
            />
          )}
          {currentStep.id === 3 && (
            <div className="flex flex-col gap-4">
              <h2 className="panel-title text-slate-300">Run Recommendation</h2>
              <p className="text-sm text-slate-400">
                Pulling live market data, analytics, and AI rationale tailored to your risk and capital settings.
              </p>
              <button
                className="w-full rounded-lg bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:bg-slate-700"
                onClick={handleSubmit}
                disabled={!canRequest || isLoading}
                type="button"
              >
                {isLoading ? "Generating..." : "Get AI Suggestion"}
              </button>
              {error && <p className="text-sm text-red-400">{error.message}</p>}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>Capital: ${capital.toLocaleString()}</span>
            <span>Risk: {riskProfile}</span>
            <span>Symbol: {symbol || "—"}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600">
            <button className="hover:text-slate-300" onClick={previousStep} type="button">
              Back
            </button>
            <button className="hover:text-slate-300" onClick={nextStep} type="button">
              Next
            </button>
          </div>
        </motion.aside>

        <motion.section
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 16 }}
          key={latestRecommendation?.decision.direction ?? "panels"}
          transition={{ duration: 0.25 }}
          className="flex flex-col gap-5"
        >
          <RecommendationPanels
            recommendation={latestRecommendation}
            isLoading={isLoading}
            symbol={symbol}
            onRetry={handleSubmit}
          />
        </motion.section>
      </section>
    </div>
  )
}
