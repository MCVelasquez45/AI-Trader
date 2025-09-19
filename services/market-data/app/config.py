from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    redis_url: str = os.getenv("REDIS_URI", "redis://localhost:6379/0")
    redis_namespace: str = os.getenv("REDIS_NAMESPACE", "")
    default_chain_contracts: int = int(os.getenv("DEFAULT_CHAIN_CONTRACTS", "5"))


def get_settings() -> Settings:
    return Settings()
