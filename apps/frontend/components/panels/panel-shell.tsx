import type { ReactNode } from "react"

export default function PanelShell({ title, rightSlot, children }: { title: string; rightSlot?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 shadow-inner shadow-slate-950/40">
      <header className="mb-3 flex items-center justify-between">
        <span className="panel-title text-slate-400">{title}</span>
        {rightSlot}
      </header>
      <div className="space-y-3 text-sm text-slate-200">{children}</div>
    </section>
  )
}
