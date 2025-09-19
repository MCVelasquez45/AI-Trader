from fastapi import FastAPI

from .service import build_service

app = FastAPI(title="Signals Service", version="0.1.0")
service = build_service()


@app.get("/healthz")
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/snapshot/{symbol}")
async def snapshot(symbol: str):
    return await service.get_snapshot(symbol.upper())
