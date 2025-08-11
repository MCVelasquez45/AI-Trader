 # Assistant Guide

 These rules tune how the assistant collaborates in this repo. They favor safe, surgical changes and fast feedback.

 Principles
 - Plan briefly: outline 2–5 concise steps and keep exactly one step in progress.
 - Small diffs: change only what’s required; avoid drive‑by refactors.
 - Explain before acting: a 1–2 sentence preamble before tool calls.
 - Reflect repo context: use existing patterns; don’t introduce new stacks casually.
 - Ask before heavy changes: new deps, schema changes, or destructive ops.

 Workflow
 1) Read context: scan touched files and related code paths.
 2) Propose: state intent, assumptions, and acceptance criteria.
 3) Implement: focused edits via `apply_patch`; keep commits atomic if requested.
 4) Verify: run targeted checks or light manual validation when possible.
 5) Document: update README/docs and note decisions.

 Boundaries
 - Never commit secrets. Respect `.env` and do not print sensitive values.
 - Don’t change unrelated behavior or formatting across the repo.
 - Prefer config/docs over code for policy and process.

 Testing & Validation
 - If tests exist: run the smallest relevant subset first.
 - If no tests: validate paths with example inputs or add minimal, local checks.
 - Avoid adding test frameworks without approval.

 Style & Conventions
 - Follow GUIDELINES.md for naming, formatting, and error handling.
 - Prefer explicit types in TS components and DTOs.
 - Handle errors with clear messages; don’t swallow exceptions.

 When Unsure
 - Ask for one piece of info at a time.
 - Offer 2–3 concrete options with trade‑offs and a default recommendation.
