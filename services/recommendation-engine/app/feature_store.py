from __future__ import annotations

import os
from typing import Any, Dict

try:
    from feast import FeatureStore
except ImportError:  # pragma: no cover - optional dependency during scaffolding
    FeatureStore = None  # type: ignore


class FeatureStoreClient:
    def __init__(self, repo_path: str | None = None) -> None:
        self.repo_path = repo_path or os.getenv("FEAST_REPO_PATH")
        self._store = FeatureStore(repo_path=self.repo_path) if FeatureStore and self.repo_path else None

    def get_online_features(self, entity_rows: Dict[str, Any]) -> Dict[str, Any]:
        if not self._store:
            return {}
        features = [
            "options_liquidity_features:avg_open_interest",
            "options_liquidity_features:avg_volume",
            "options_liquidity_features:liquidity_score",
        ]
        result = self._store.get_online_features(features=features, entity_rows=[entity_rows]).to_dict()
        return {key: values[0] for key, values in result.items()}


def build_feature_store_client() -> FeatureStoreClient:
    return FeatureStoreClient()
