from dataclasses import dataclass, field
from typing import Optional

@dataclass
class AssetSnapshot:
    name: str
    symbol: str
    source: str
    chain: Optional[str] = None
    address: Optional[str] = None
    price_usd: Optional[float] = None
    market_cap: Optional[float] = None
    fdv: Optional[float] = None
    liquidity_usd: Optional[float] = None
    volume_24h: Optional[float] = None
    change_1h: Optional[float] = None
    change_6h: Optional[float] = None
    change_24h: Optional[float] = None
    change_7d: Optional[float] = None
    buys_24h: Optional[int] = None
    sells_24h: Optional[int] = None
    age_hours: Optional[float] = None
    url: Optional[str] = None
    metadata: dict = field(default_factory=dict)

@dataclass
class Assessment:
    asset: AssetSnapshot
    opportunity_score: float
    risk_score: float
    confidence: float
    label: str
    reasons: list[str]
    warnings: list[str]
