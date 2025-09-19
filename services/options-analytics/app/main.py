from fastapi import FastAPI

from .schemas import ScreeningRequest
from .service import build_service

app = FastAPI(title="Options Analytics Service", version="0.1.0")
service = build_service()


@app.get("/healthz")
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/screen")
async def screen(request: ScreeningRequest):
    return await service.screen(request)
