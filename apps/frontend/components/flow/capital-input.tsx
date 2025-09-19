"use client"

import { useMutation } from "@tanstack/react-query"
import { useState } from "react"

import { updateCapital } from "@/lib/api"

type CapitalInputProps = {
  value: number
  onChange: (value: number) => void
  onPersist?: () => void
}

export default function CapitalInput({ value, onChange, onPersist }: CapitalInputProps) {
  const [dirty, setDirty] = useState(false)

  const mutation = useMutation({
    mutationFn: updateCapital,
    onSuccess: () => {
      setDirty(false)
      onPersist?.()
    }
  })

  const formattedValue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="panel-title">Step 3 · Available capital</h2>
        <p className="mt-1 text-sm text-slate-400">
          Tell the engine how much buying power to allocate. Saved to your profile for future sessions.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <label className="text-xs uppercase tracking-wide text-slate-500" htmlFor="capital-input">
          Capital (USD)
        </label>
        <input
          id="capital-input"
          className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          type="number"
          min={1000}
          step={100}
          value={value}
          onChange={(event) => {
            onChange(Number(event.target.value))
            setDirty(true)
          }}
        />
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Preview: {formattedValue}</span>
          {mutation.isError && <span className="text-red-400">{(mutation.error as Error).message}</span>}
        </div>
        <button
          className="rounded-lg border border-brand-500/30 bg-brand-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-brand-200 transition hover:bg-brand-500/20 disabled:border-slate-800 disabled:text-slate-600"
          type="button"
          onClick={() => mutation.mutate(value)}
          disabled={!dirty || mutation.isPending}
        >
          {mutation.isPending ? "Saving" : "Persist Capital"}
        </button>
      </div>
    </div>
  )
}
