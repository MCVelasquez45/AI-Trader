# Roadmap

## Near-Term
- **Polygon integration**: Websocket adapter toggles between synthetic and live feeds via `POLYGON_API_KEY` and `POLYGON_SYMBOLS` env vars.
- **Market data API**: Redis-backed `/quotes` + `/chains` service feeds downstream analytics (`MARKET_DATA_URL`).
- **Feature store**: Recommendation engine reads Feast features when `FEAST_REPO_PATH` is configured.
- **Model registry**: MLflow model URI (`MLFLOW_MODEL_URI`) powers scoring when available.
- **Signals persistence**: Signals service pulls congressional & macro signals from Postgres when `SIGNALS_DB_DSN` is set.

## Engineering Enablement
- GitHub Actions workflow `.github/workflows/ci.yml` runs lint/build/tests for Node, Python, and Go surfaces.
- Python services ship with pytest suites under each `services/*/tests` directory.

## Upcoming Enhancements
- Expand websocket channel subscriptions to include options quotes and NBBO depth once higher-tier Polygon subscription is configured.
- Publish Feast materializations via Airflow + dbt daily cadence.
- Integrate vector database + LLM provider in AI orchestrator (pgvector/vLLM).
- Add contract backtesting endpoints to recommendation engine with MLflow model comparisons.
