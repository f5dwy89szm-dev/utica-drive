from __future__ import annotations

from data_sources import coingecko_markets, dexscreener_new_assets, DataError
from scoring import assess


def scan(established_limit: int = 100, new_limit: int = 20):
    assets = []
    errors = []
    try:
        assets.extend(coingecko_markets(established_limit))
    except DataError as exc:
        errors.append(f"CoinGecko: {exc}")
    try:
        assets.extend(dexscreener_new_assets(new_limit))
    except DataError as exc:
        errors.append(f"DEX Screener: {exc}")

    assessments = [assess(a) for a in assets]
    assessments.sort(key=lambda x: (x.opportunity_score - 0.45 * x.risk_score, x.confidence), reverse=True)
    return assessments, errors
