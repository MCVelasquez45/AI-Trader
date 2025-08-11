 # Decisions (Mini ADRs)

 Record non-obvious choices here with a short template so future contributors understand the why.

 Template
 - Date: YYYY-MM-DD
 - Decision: short title
 - Context: what problem or trade-off?
 - Options considered: A / B / C
 - Outcome: chosen option and rationale
 - Follow-ups: any tasks or reminders

Log
- Date: 2025-08-10
- Decision: Add `.codex` assistant docs
- Context: Keep AI + human collaborators aligned on process and conventions.
- Options: Ad-hoc notes vs. structured folder
- Outcome: Create `.codex` with guide, guidelines, runbook, TODO, decisions
- Follow-ups: Keep TODO updated; add ADRs for auth/data model changes

- Date: 2025-08-10
- Decision: Auth provider alignment (PENDING)
- Context: Server code uses Google OAuth; ProjectBrief states GitHub OAuth.
- Options considered: (A) Switch to GitHub in code (passport-github2) (B) Keep Google and update docs (C) Support both behind a common interface
- Outcome: Pending — add to `.codex/TODO.md` and decide before expanding auth flows
- Follow-ups: Choose option; update docs and routes accordingly
