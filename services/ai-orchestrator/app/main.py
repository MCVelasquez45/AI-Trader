from fastapi import FastAPI

from .schemas import RationaleRequest
from .service import build_orchestrator

app = FastAPI(title="AI Orchestrator", version="0.1.0")
engine = build_orchestrator()


@app.get("/healthz")
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/rationale")
async def rationale(request: RationaleRequest):
    return await engine.build_rationale(request.model_dump())
