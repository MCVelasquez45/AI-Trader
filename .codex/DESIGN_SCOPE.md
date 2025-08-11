 # Design Scope & Guardrails

 Purpose: keep development focused and prevent scope creep. Use this file to check proposals and PRs against goals/non-goals.

 Goals
 - Deliver trustworthy options recommendations with transparent inputs (price, ITM affordability, indicators, sentiment, Congress trades).
 - Keep the system explainable: show why a recommendation was made.
 - Prioritize stability and data integrity over breadth of features.

 Non-Goals
 - Real-time HFT execution or broker integration (for now).
 - Full technical analysis suite beyond key indicators (RSI, MACD, VWAP).
 - Portfolio optimization/auto-trading.

 Constraints
 - Node 20.x, Express (ESM), React + Vite + TS.
 - MongoDB Atlas as the source of truth.
 - External data via Polygon, Yahoo fallback, CapitolTrades scraping.

 Decision Triggers (open an ADR in `DECISIONS.md`)
 - Auth provider changes or flows (e.g., Google ↔ GitHub).
 - Data model/schema changes affecting persisted records.
 - New third-party dependencies or services (SMS, vector DB).
 - API contract changes (request/response shapes).

 PR Checklist (paste into PR description)
 - Problem statement is clear and in-scope per this file
 - Out-of-scope concerns explicitly listed as non-goals
 - No unrelated refactors; diffs are minimal and focused
 - Docs updated: `.codex/*` and/or README/ProjectBrief
 - Error responses match chosen standard
 - Security: no secrets committed; PII and tokens masked in logs
 - Observability: logs or metrics added for new code paths where appropriate

 Scope Guard Tips
 - If an idea is good but out-of-scope, add it to `.codex/TODO.md` with context and acceptance.
 - Prefer experiments as isolated spikes guarded by flags.
