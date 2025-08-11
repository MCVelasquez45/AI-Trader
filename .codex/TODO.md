 # TODO — Near-term Backlog

 Use this as a living list of actionable work. Keep items small and specific. The assistant will pick from here unless directed otherwise.

 Format
 - [ ] Title — 1 sentence goal
   - Context: why this matters (1–2 lines)
   - Acceptance: concrete check(s) to verify done

 Items
 - [ ] Align auth provider with brief
   - Context: Server uses Google OAuth; ProjectBrief says GitHub OAuth.
   - Acceptance: Either update code to GitHub or update docs to Google, consistently across README/ProjectBrief and routes.

 - [ ] Add `.env.example` files
   - Context: ProjectBrief references copying `.env.example` for both server and client, but examples are missing.
   - Acceptance: Provide minimal `.env.example` in `server/` and `client/` matching required vars.

 - [ ] RAG integration spike for GPT transparency
   - Context: Roadmap calls for RAG to ground recommendations and show sources.
   - Acceptance: Draft design doc (sources, indexing, retrieval), with a small prototype that augments prompts with retrieved context.

 - [ ] SMS alerts via AWS (design + POC)
   - Context: Roadmap item to alert users on new or updated recommendations.
   - Acceptance: Choose service (SNS/Pinpoint/Twilio), add interface in server with feature-flag, and document env/usage.

 - [ ] Multi-account support + analytics dashboard
   - Context: Roadmap item to support multiple portfolios and a dashboard.
   - Acceptance: Define data model changes, minimal UI to switch accounts, and an initial analytics view (win rate, avg return).

 - [ ] Normalize error response shape
   - Context: Ensure consistent `{ error, message }` or `{ data, error }` across `/api/*`.
   - Acceptance: All controllers return the chosen shape; update GUIDELINES accordingly.

 - [ ] Improve scraper resilience
   - Context: Add retries, backoff, and HTML change detection for CapitolTrades.
   - Acceptance: Scraper handles transient failures with logged reasons; unit-test key parsers.

 - [ ] Document cron jobs and schedules
   - Context: Evaluate-expired-trades runs every 15 minutes.
   - Acceptance: RUNBOOK has a section for jobs; cron schedules and manual run instructions included.
