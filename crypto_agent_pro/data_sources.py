from __future__ import annotations

from datetime import datetime, timezone
import requests
from config import SETTINGS
from models import AssetSnapshot

CG_DEMO = "https://api.coingecko.com/api/v3"
CG_PRO = "https://pro-api.coingecko.com/api/v3"
DEX = "https://api.dexscreener.com"

class DataError(RuntimeError):
    pass

def _get(url: str, *, params=None, headers=None):
    try:
        r = requests.get(url, params=params, headers=headers, timeout=SETTINGS.request_timeout)
        r.raise_for_status()
        return r.json()
    except requests.RequestException as exc:
        raise DataError(f"Request failed: {exc}") from exc


def _cg_auth():
    if not SETTINGS.coingecko_api_key:
        return {}, CG_DEMO
    if SETTINGS.coingecko_api_tier == "pro":
        return {"x-cg-pro-api-key": SETTINGS.coingecko_api_key}, CG_PRO
    return {"x-cg-demo-api-key": SETTINGS.coingecko_api_key}, CG_DEMO


def coingecko_markets(limit: int = 100) -> list[AssetSnapshot]:
    headers, base = _cg_auth()
    params = {
        "vs_currency": "usd",
        "order": "market_cap_desc",
        "per_page": min(max(limit, 1), 250),
        "page": 1,
        "sparkline": "false",
        "price_change_percentage": "1h,24h,7d",
    }
    rows = _get(f"{base}/coins/markets", params=params, headers=headers)
    assets = []
    for x in rows:
        assets.append(AssetSnapshot(
            name=x.get("name") or "Unknown",
            symbol=(x.get("symbol") or "?").upper(),
            source="CoinGecko",
            price_usd=x.get("current_price"),
            market_cap=x.get("market_cap"),
            volume_24h=x.get("total_volume"),
            change_1h=x.get("price_change_percentage_1h_in_currency"),
            change_24h=x.get("price_change_percentage_24h_in_currency"),
            change_7d=x.get("price_change_percentage_7d_in_currency"),
            url=f"https://www.coingecko.com/en/coins/{x.get('id')}" if x.get("id") else None,
            metadata={"rank": x.get("market_cap_rank"), "ath_change_pct": x.get("ath_change_percentage")},
        ))
    return assets


def coingecko_trending() -> list[dict]:
    headers, base = _cg_auth()
    return _get(f"{base}/search/trending", headers=headers).get("coins", [])


def dexscreener_latest_profiles(limit: int | None = None) -> list[dict]:
    rows = _get(f"{DEX}/token-profiles/latest/v1")
    if not isinstance(rows, list):
        return []
    return rows[: limit or SETTINGS.max_new_tokens]


def dexscreener_token_pairs(chain_id: str, token_address: str) -> list[dict]:
    rows = _get(f"{DEX}/token-pairs/v1/{chain_id}/{token_address}")
    return rows if isinstance(rows, list) else []


def _safe_float(value):
    try:
        return float(value) if value is not None else None
    except (TypeError, ValueError):
        return None


def _age_hours(pair_created_at_ms):
    if not pair_created_at_ms:
        return None
    created = datetime.fromtimestamp(pair_created_at_ms / 1000, tz=timezone.utc)
    return max(0.0, (datetime.now(timezone.utc) - created).total_seconds() / 3600)


def dexscreener_new_assets(limit: int = 20) -> list[AssetSnapshot]:
    profiles = dexscreener_latest_profiles(limit)
    out: list[AssetSnapshot] = []
    seen = set()
    for p in profiles:
        chain = p.get("chainId")
        address = p.get("tokenAddress")
        if not chain or not address:
            continue
        key = (chain, address)
        if key in seen:
            continue
        seen.add(key)
        try:
            pairs = dexscreener_token_pairs(chain, address)
        except DataError:
            continue
        if not pairs:
            continue
        pair = max(pairs, key=lambda z: ((z.get("liquidity") or {}).get("usd") or 0))
        base = pair.get("baseToken") or {}
        tx = (pair.get("txns") or {}).get("h24") or {}
        change = pair.get("priceChange") or {}
        vol = pair.get("volume") or {}
        liq = pair.get("liquidity") or {}
        out.append(AssetSnapshot(
            name=base.get("name") or "Unknown",
            symbol=(base.get("symbol") or "?").upper(),
            source="DEX Screener",
            chain=pair.get("chainId") or chain,
            address=base.get("address") or address,
            price_usd=_safe_float(pair.get("priceUsd")),
            market_cap=_safe_float(pair.get("marketCap")),
            fdv=_safe_float(pair.get("fdv")),
            liquidity_usd=_safe_float(liq.get("usd")),
            volume_24h=_safe_float(vol.get("h24")),
            change_1h=_safe_float(change.get("h1")),
            change_6h=_safe_float(change.get("h6")),
            change_24h=_safe_float(change.get("h24")),
            buys_24h=tx.get("buys"),
            sells_24h=tx.get("sells"),
            age_hours=_age_hours(pair.get("pairCreatedAt")),
            url=pair.get("url") or p.get("url"),
            metadata={
                "dex": pair.get("dexId"),
                "boosts_active": (pair.get("boosts") or {}).get("active", 0),
                "profile_description": p.get("description"),
            },
        ))
    return out
