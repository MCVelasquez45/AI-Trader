from fastapi import FastAPI

from .schemas import RecommendationRequest
from .service import build_engine

app = FastAPI(title="Recommendation Engine", version="0.1.0")
engine = build_engine()


@app.get("/healthz")
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/score")
async def score(request: RecommendationRequest):
    return await engine.recommend(request)
