from __future__ import annotations

import os
from typing import Any, Dict, List

import asyncpg


class SignalsRepository:
    def __init__(self, dsn: str | None = None) -> None:
        self.dsn = dsn or os.getenv("SIGNALS_DB_DSN")

    async def fetch_congressional_trades(self, symbol: str) -> List[Dict[str, Any]]:
        if not self.dsn:
            return []
        query = """
            select person, party, committee, action, amount, trade_date
            from congressional_trades
            where symbol = $1
            order by trade_date desc
            limit 10
        """
        async with asyncpg.create_pool(self.dsn, max_size=2) as pool:
            async with pool.acquire() as connection:
                rows = await connection.fetch(query, symbol.upper())
        return [
            {
                "name": row["person"],
                "party": row["party"],
                "committee": row["committee"],
                "action": row["action"],
                "amount": row["amount"],
                "date": row["trade_date"].isoformat() if row["trade_date"] else None,
            }
            for row in rows
        ]

    async def fetch_macro_events(self) -> List[str]:
        if not self.dsn:
            return []
        query = """
            select event_name, event_time
            from macro_calendar
            where event_time >= now()
            order by event_time asc
            limit 5
        """
        async with asyncpg.create_pool(self.dsn, max_size=2) as pool:
            async with pool.acquire() as connection:
                rows = await connection.fetch(query)
        return [f"{row['event_name']} on {row['event_time'].date().isoformat()}" for row in rows]


def build_repository() -> SignalsRepository:
    return SignalsRepository()
