"use client"

import { useState } from "react"

import type { RiskProfile } from "@/lib/api"

type RiskSelectorProps = {
  value: RiskProfile
  onChange: (value: RiskProfile) => void
}

const riskLevels: Record<RiskProfile, { blurb: string; deltaRange: string; expiryWindow: string }> = {
  conservative: {
    blurb: "Defined-risk, slower expiry, 20–35 delta ideas.",
    deltaRange: "Δ 0.20 – 0.35",
    expiryWindow: "30 – 60 DTE"
  },
  neutral: {
    blurb: "Balanced setups, spreads allowed, 30–50 delta.",
    deltaRange: "Δ 0.30 – 0.50",
    expiryWindow: "21 – 45 DTE"
  },
  aggressive: {
    blurb: "High conviction, faster timeframe, may include shorts.",
    deltaRange: "Δ 0.45 – 0.65",
    expiryWindow: "7 – 30 DTE"
  }
}

const options: RiskProfile[] = ["conservative", "neutral", "aggressive"]

export default function RiskSelector({ value, onChange }: RiskSelectorProps) {
  const [internalValue, setInternalValue] = useState<RiskProfile>(value)

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const index = Number(event.target.value) as 0 | 1 | 2
    const selected = options[index]
    setInternalValue(selected)
    onChange(selected)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="panel-title">Step 2 · Risk tolerance</h2>
        <p className="mt-1 text-sm text-slate-400">
          Adjust the engine&apos;s suitability filters and strategy mix.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <div className="relative flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={2}
            step={1}
            value={options.indexOf(internalValue)}
            onChange={handleSliderChange}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-slate-800 accent-brand-500"
          />
          <span className="w-20 text-right text-xs uppercase tracking-wide text-slate-400">{internalValue}</span>
        </div>
        <div className="grid gap-3">
          {options.map((option) => {
            const selected = option === internalValue
            const config = riskLevels[option]
            return (
              <button
                key={option}
                className={`rounded-lg border px-3 py-3 text-left transition ${
                  selected ? "border-brand-500 bg-brand-500/10 text-brand-100" : "border-slate-800 bg-slate-900/60 text-slate-300"
                }`}
                onClick={() => {
                  setInternalValue(option)
                  onChange(option)
                }}
                type="button"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-wide">
                  <span>{option}</span>
                  <span>{config.expiryWindow}</span>
                </div>
                <p className="mt-1 text-sm text-slate-300">{config.blurb}</p>
                <p className="mt-1 text-xs text-slate-500">{config.deltaRange}</p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
