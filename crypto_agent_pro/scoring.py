from __future__ import annotations

import math
from models import Assessment


def clamp(v, lo=0.0, hi=100.0):
    return max(lo, min(hi, v))


def log_score(value, low, high):
    if value is None or value <= 0:
        return 0.0
    return clamp((math.log10(value) - math.log10(low)) / (math.log10(high) - math.log10(low)) * 100)


def assess(a):
    reasons = []
    warnings = []
    momentum = 50.0
    if a.change_1h is not None:
        momentum += clamp(a.change_1h, -15, 15) * 1.3
    if a.change_24h is not None:
        momentum += clamp(a.change_24h, -40, 40) * 0.55
    if a.change_7d is not None:
        momentum += clamp(a.change_7d, -60, 60) * 0.18
    momentum = clamp(momentum)

    depth = log_score(a.liquidity_usd or a.market_cap, 10_000, 10_000_000_000)
    activity = log_score(a.volume_24h, 5_000, 5_000_000_000)
    pressure = 50.0
    if a.buys_24h is not None and a.sells_24h is not None:
        total = a.buys_24h + a.sells_24h
        if total > 0:
            pressure = 100 * a.buys_24h / total
            if pressure >= 58:
                reasons.append(f"Buy-side activity is stronger ({pressure:.0f}% of 24h trades).")

    opportunity = 0.36 * momentum + 0.24 * activity + 0.24 * depth + 0.16 * pressure
    risk = 45.0

    if a.liquidity_usd is not None:
        if a.liquidity_usd < 10_000:
            risk += 35; warnings.append("Very low liquidity.")
        elif a.liquidity_usd < 50_000:
            risk += 22; warnings.append("Low liquidity.")
        elif a.liquidity_usd < 250_000:
            risk += 10
        elif a.liquidity_usd > 5_000_000:
            risk -= 12

    if a.age_hours is not None:
        if a.age_hours < 6:
            risk += 30; warnings.append("Trading pair is under 6 hours old.")
        elif a.age_hours < 24:
            risk += 22; warnings.append("Trading pair is under 24 hours old.")
        elif a.age_hours < 168:
            risk += 12; warnings.append("Trading pair is under one week old.")

    c24 = a.change_24h or 0
    c1 = a.change_1h or 0
    if c24 > 150 or c1 > 40:
        risk += 25; warnings.append("Price is moving extremely quickly.")
        opportunity -= 12
    elif c24 > 70 or c1 > 20:
        risk += 12; warnings.append("Price is moving unusually quickly.")

    if a.volume_24h and a.liquidity_usd:
        ratio = a.volume_24h / max(a.liquidity_usd, 1)
        if ratio > 20:
            risk += 13; warnings.append("Volume is very high relative to liquidity.")
        elif ratio > 5:
            risk += 6

    if a.fdv and a.market_cap and a.market_cap > 0 and a.fdv / a.market_cap > 10:
        risk += 12; warnings.append("FDV is far above circulating market cap.")

    if a.source == "CoinGecko" and a.market_cap:
        if a.market_cap > 10_000_000_000:
            risk -= 15
        elif a.market_cap > 1_000_000_000:
            risk -= 8

    if a.volume_24h and a.volume_24h > 50_000_000:
        reasons.append("Strong 24-hour trading volume.")
    if a.liquidity_usd and a.liquidity_usd > 1_000_000:
        reasons.append("Relatively deep on-chain liquidity.")
    if a.change_24h is not None:
        reasons.append(f"24h price change: {a.change_24h:+.1f}%.")
    if a.change_7d is not None:
        reasons.append(f"7d price change: {a.change_7d:+.1f}%.")

    risk = clamp(risk)
    opportunity = clamp(opportunity - 0.18 * max(risk - 50, 0))
    fields = [a.price_usd, a.volume_24h, a.change_24h, a.market_cap or a.liquidity_usd]
    confidence = clamp(38 + 14 * sum(v is not None for v in fields), 20, 90)

    if risk >= 78:
        label = "VERY HIGH RISK"
    elif opportunity >= 70 and risk <= 55:
        label = "STRONG SETUP"
    elif opportunity >= 58 and risk <= 68:
        label = "POSITIVE SETUP"
    elif opportunity >= 45:
        label = "NEUTRAL"
    else:
        label = "WEAK SETUP"

    if not reasons:
        reasons.append("Limited positive evidence in the available market data.")
    if not warnings:
        warnings.append("Crypto remains volatile; this score is not a prediction.")

    return Assessment(a, round(opportunity, 1), round(risk, 1), round(confidence, 1), label, reasons, warnings)
