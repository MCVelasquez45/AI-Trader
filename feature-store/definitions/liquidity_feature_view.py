from datetime import timedelta

from feast import Entity, FeatureView, Field
from feast.types import Float32, Int64, String

options_contract = Entity(name="options_contract", join_keys=["symbol", "expiry", "strike"])

liquidity_feature_view = FeatureView(
    name="options_liquidity_features",
    entities=[options_contract],
    ttl=timedelta(days=7),
    schema=[
        Field(name="avg_open_interest", dtype=Int64),
        Field(name="avg_volume", dtype=Int64),
        Field(name="avg_spread_pct", dtype=Float32),
        Field(name="liquidity_score", dtype=Float32),
    ],
    online=True,
    source=None,  # TODO: configure batch/stream sources
)
