with base as (
    select
        symbol,
        expiry,
        strike,
        avg(open_interest) as avg_open_interest,
        avg(volume) as avg_volume,
        avg(spread_pct) as avg_spread_pct,
        max(observed_at) as last_seen
    from {{ source('market_data', 'options_quotes') }}
    where observed_at >= now() - interval '14 days'
    group by 1,2,3
),
scored as (
    select
        symbol,
        expiry,
        strike,
        avg_open_interest,
        avg_volume,
        avg_spread_pct,
        (least(1, avg_open_interest / 5000.0) * 0.5 + least(1, avg_volume / 2000.0) * 0.3 + (1 - avg_spread_pct) * 0.2) * 100 as liquidity_score,
        last_seen
    from base
)
select * from scored
