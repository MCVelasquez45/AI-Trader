"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { fetchWatchlist, searchSymbols, SymbolSearchResponse } from "@/lib/api"

type StockSelectorProps = {
  value: string
  onValueChange: (value: string) => void
}

const minQueryLength = 2

export default function StockSelector({ value, onValueChange }: StockSelectorProps) {
  const [query, setQuery] = useState("")

  const { data: watchlist = [] } = useQuery({
    queryKey: ["watchlist"],
    queryFn: fetchWatchlist
  })

  const { data: searchResults = [], isFetching } = useQuery({
    queryKey: ["symbol-search", query],
    queryFn: () => searchSymbols(query),
    enabled: query.length >= minQueryLength,
    staleTime: 1000 * 60
  })

  const combinedList = useMemo(() => {
    if (query.length >= minQueryLength) return searchResults
    return watchlist.map((item) => ({
      symbol: item.symbol,
      name: item.note ?? "",
      type: "watchlist",
      exchange: ""
    }))
  }, [query, searchResults, watchlist])

  const handleSelect = (symbol: string) => {
    onValueChange(symbol)
    setQuery("")
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="panel-title">Step 1 · Choose stock</h2>
        <p className="mt-1 text-sm text-slate-400">
          Look up a ticker or pick from your watchlist to anchor the recommendation.
        </p>
      </div>
      <div className="relative">
        <input
          className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          value={query}
          onChange={(event) => setQuery(event.target.value.toUpperCase())}
          placeholder="Search by symbol or company"
        />
        {isFetching && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">···</span>}
      </div>
      <div className="flex flex-col gap-2">
        {value ? (
          <p className="text-xs text-brand-300">Selected: {value}</p>
        ) : (
          <p className="text-xs text-slate-600">{combinedList.length} suggestions</p>
        )}
        <ul className="max-h-60 space-y-1 overflow-y-auto pr-1">
          {combinedList.map((item: SymbolSearchResponse) => (
            <li key={`${item.symbol}-${item.exchange}`}>
              <button
                className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-3 text-left text-sm text-slate-200 transition hover:border-brand-500/40 hover:bg-brand-500/10"
                onClick={() => handleSelect(item.symbol)}
                type="button"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-100">{item.symbol}</span>
                  <span className="text-xs uppercase text-slate-500">{item.exchange}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{item.name}</p>
              </button>
            </li>
          ))}
          {!combinedList.length && (
            <li className="rounded-lg border border-dashed border-slate-800 px-3 py-6 text-center text-xs text-slate-600">
              {query.length < minQueryLength ? "Type at least two characters" : "No matches yet"}
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
