# AI Trader Architecture Overview

## Frontend
- **Framework:** Next.js 15, TypeScript, Tailwind, React Query, socket.io client
- **Flow:**
  1. Symbol lookup and watchlist selection
  2. Risk slider presets with delta/expiry targets
  3. Capital entry with persistence to profile
  4. Streaming recommendation payload rendered across layered panels
- **Realtime:** Websocket channel (via Market Data service) keeps quotes/options chain fresh

## Edge & API Gateway
- **NestJS** service performing Auth0/Cognito JWT verification, per-user and per-symbol rate limiting, and feature flag checks (LaunchDarkly).
- Routes recommendation requests through the downstream services in parallel, enforcing JSON schema payloads.

## Data Platform
- **Market Data API (FastAPI):** Surfaces `/quotes/{symbol}` and `/chains/{symbol}` from Redis caches populated by the ingestion service, with synthetic fallbacks for local development.
- **Ingestion (Go):** Polygon websockets + REST polling → Redis (hot path), Kafka (fan-out), S3 (raw archive). Synthetic mode toggled via `POLYGON_SYNTHETIC_ONLY` for local development.
- **Option Analytics (FastAPI):** Computes Greeks, liquidity score, and applies risk filters. Calls Market Data service when `MARKET_DATA_URL` supplied, otherwise generates synthetic chains.
- **Signals Service (FastAPI):** Aggregates TA indicators, sentiment, congressional trades, and macro calendars. Reads Postgres when `SIGNALS_DB_DSN` is configured, with graceful fallback to mocks.
- **Recommendation Engine (FastAPI):** Hybrid rule + ML scorer (LightGBM placeholder) returning contract + sizing guidance with explainable layers. Pulls Feast features (`FEAST_REPO_PATH`) and MLflow model predictions (`MLFLOW_MODEL_URI`) when available.
- **AI Orchestrator (FastAPI):** RAG gateway preparing prompt context bundles and returning layered rationale JSON (guard rails for compliance).

## Feature Engineering
- Airflow DAGs trigger hourly/nightly analytics jobs.
- dbt project materializes liquidity, IV rank, and realized volatility tables in TimescaleDB/Postgres.
- Feast feature view definitions align online Redis cache with offline parquet assets.

## Infrastructure
- Docker Compose for local orchestration; Kubernetes manifests + Terraform skeleton for cloud rollout.
- Supporting services: Redis, Kafka, TimescaleDB (Postgres), vector store placeholder.
- GitHub Actions CI pipeline (`.github/workflows/ci.yml`) runs builds + tests across stacks.

## Data Contracts
- JSON Schema documents for recommendation request/response shared across services + frontend TS types.

## Day-1 → Day-90
- MVP path focuses on single recommendation loop with synthetic data, leaving hooks to bolt on Timescale/Kafka/MLflow and richer strategies without rework.
