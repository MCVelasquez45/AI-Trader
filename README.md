# AI Trader Platform

Comprehensive scaffold for an AI-assisted options recommendation platform, covering frontend, gateway, analytics microservices, ingestion, feature engineering, and infrastructure.

## Monorepo Layout

- `apps/frontend` – Next.js UI with layered rationale panels and guided trade flow
- `services/api-gateway` – NestJS edge service handling auth, rate limiting, feature flags, and routing
- `services/market-data` – FastAPI service serving live/synthetic quotes and option chains from Redis
- `services/data-ingestion` – Go-based Polygon adapter streaming into Redis, Kafka, and S3
- `services/options-analytics` – FastAPI service scoring liquidity and suitability for option chains
- `services/signals-service` – FastAPI analytics for TA, sentiment, congressional, and macro signals
- `services/recommendation-engine` – FastAPI hybrid rule/ML scorer producing contract picks + sizing
- `services/ai-orchestrator` – FastAPI RAG layer crafting layered rationales via LLM gateway
- `pipelines/airflow` – ETL orchestration for IV rank, liquidity, feature-store builds
- `pipelines/dbt` – Timescale/Postgres models for analytics features
- `feature-store` – Feast feature view definitions + configuration
- `schemas` – JSON schemas for request/response contracts
- `infrastructure` – Docker, Kubernetes, and Terraform bootstrap assets
- `docs` – Architecture notes, roadmap, and onboarding material

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
   Individual Python/Go services manage dependencies via `pyproject.toml` and `go.mod`.

2. **Run locally with Docker Compose**
   ```bash
   docker compose -f infrastructure/docker/docker-compose.yml up --build
   ```

3. **Frontend development**
   ```bash
   npm run dev:frontend
   ```

4. **API gateway**
   ```bash
   npm run dev:api
   ```

5. **Python services**
   ```bash
   uvicorn app.main:app --reload --port 7001  # market-data
   ```

## Env Configuration

| Service | Key env vars |
| --- | --- |
| API Gateway | `AUTH_JWKS_URI`, `AUTH_AUDIENCE`, `AUTH_ISSUER`, downstream URLs |
| Market Data | `REDIS_URI`, `REDIS_NAMESPACE`, `DEFAULT_CHAIN_CONTRACTS` |
| Data Ingestion | `POLYGON_API_KEY`, `POLYGON_SYMBOLS`, `POLYGON_SYNTHETIC_ONLY`, `REDIS_URI`, `KAFKA_BROKERS`, `S3_BUCKET` |
| Options Analytics | `MARKET_DATA_URL` (optional live chain fetch) |
| Signals Service | `SIGNALS_DB_DSN` for Postgres-backed signals |
| Recommendation Engine | `FEAST_REPO_PATH`, `MLFLOW_MODEL_URI` to enable feature store + model registry |

## Continuous Integration

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs linting, builds, and unit tests across Node, Python, and Go stacks.

## Roadmap & Next Steps

- Polygon websocket adapter automatically flips to live data when credentials are supplied.
- Market Data API exposes Redis-backed quotes/chains for downstream services.
- Recommendation engine consumes Feast features and MLflow-served models when configured.
- Signals service hydrates congressional and macro context from Postgres if DSN provided.
- See `docs/roadmap.md` for the expanded backlog (vector DB, orchestrator upgrades, backtesting APIs).
