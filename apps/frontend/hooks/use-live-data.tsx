"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import type { Socket } from "socket.io-client"
import { io } from "socket.io-client"

import type { OptionContract } from "@/types/options"

type QuoteUpdate = {
  symbol: string
  last: number
  change: number
  changePercent: number
  bid: number
  ask: number
  timestamp: number
}

type OptionsDelta = {
  symbol: string
  contracts: OptionContract[]
  lastUpdated: number
}

type LiveDataContextValue = {
  status: "connecting" | "connected" | "disconnected"
  quoteMap: Record<string, QuoteUpdate>
  chainMap: Record<string, OptionsDelta>
  subscribe(symbol: string): void
  unsubscribe(symbol: string): void
}

const LiveDataContext = createContext<LiveDataContextValue | undefined>(undefined)

const noop = () => {}

const REALTIME_URL = process.env.NEXT_PUBLIC_REALTIME_URL ?? ""

export function LiveDataProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null)
  const [status, setStatus] = useState<LiveDataContextValue["status"]>("connecting")
  const [quoteMap, setQuoteMap] = useState<Record<string, QuoteUpdate>>({})
  const [chainMap, setChainMap] = useState<Record<string, OptionsDelta>>({})

  useEffect(() => {
    if (!REALTIME_URL) {
      setStatus("disconnected")
      return
    }

    const socket = io(REALTIME_URL, { autoConnect: true, transports: ["websocket"] })
    socketRef.current = socket

    socket.on("connect", () => setStatus("connected"))
    socket.on("disconnect", () => setStatus("disconnected"))

    socket.on("quote", (payload: QuoteUpdate) => {
      setQuoteMap((prev) => ({ ...prev, [payload.symbol]: payload }))
    })

    socket.on("options-delta", (payload: OptionsDelta) => {
      setChainMap((prev) => ({ ...prev, [payload.symbol]: payload }))
    })

    return () => {
      socket.disconnect()
      setStatus("disconnected")
    }
  }, [])

  const api = useMemo<LiveDataContextValue>(() => {
    const subscribe = (symbol: string) => {
      socketRef.current?.emit("subscribe", { symbol })
    }

    const unsubscribe = (symbol: string) => {
      socketRef.current?.emit("unsubscribe", { symbol })
    }

    return {
      status,
      quoteMap,
      chainMap,
      subscribe: REALTIME_URL ? subscribe : noop,
      unsubscribe: REALTIME_URL ? unsubscribe : noop
    }
  }, [status, quoteMap, chainMap])

  return <LiveDataContext.Provider value={api}>{children}</LiveDataContext.Provider>
}

export function useLiveData() {
  const context = useContext(LiveDataContext)
  if (!context) {
    throw new Error("useLiveData must be used within a LiveDataProvider")
  }
  return context
}
