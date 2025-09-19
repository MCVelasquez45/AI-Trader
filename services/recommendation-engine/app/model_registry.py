from __future__ import annotations

import os
from typing import Any, Dict

import mlflow
import numpy as np


class ModelRegistry:
    def __init__(self, model_uri: str | None = None) -> None:
        self.model_uri = model_uri or os.getenv("MLFLOW_MODEL_URI")
        self._model = None
        if self.model_uri:
            try:
                self._model = mlflow.pyfunc.load_model(self.model_uri)
            except Exception:
                self._model = None

    def predict(self, features: np.ndarray) -> float:
        if not self._model:
            return float(features.mean())
        data: Dict[str, Any] = {"features": features.reshape(1, -1)}
        prediction = self._model.predict(data)
        if isinstance(prediction, (list, tuple, np.ndarray)):
            return float(prediction[0])
        return float(prediction)


def build_registry() -> ModelRegistry:
    return ModelRegistry()
