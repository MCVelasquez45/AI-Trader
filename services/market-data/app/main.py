from fastapi import FastAPI

from .service import fetch_equity_quote, fetch_options_chain

app = FastAPI(title="Market Data Service", version="0.1.0")


@app.get("/healthz")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/quotes/{symbol}")
async def get_quote(symbol: str):
    return await fetch_equity_quote(symbol)


@app.get("/chains/{symbol}")
async def get_chain(symbol: str, limit: int | None = None):
    return {"symbol": symbol.upper(), "contracts": await fetch_options_chain(symbol, limit)}
