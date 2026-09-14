from dataclasses import dataclass
import os
from dotenv import load_dotenv

load_dotenv()

@dataclass(frozen=True)
class Settings:
    coingecko_api_key: str = os.getenv("COINGECKO_API_KEY", "").strip()
    coingecko_api_tier: str = os.getenv("COINGECKO_API_TIER", "demo").strip().lower()
    request_timeout: int = int(os.getenv("REQUEST_TIMEOUT", "15"))
    max_new_tokens: int = int(os.getenv("MAX_NEW_TOKENS", "30"))

SETTINGS = Settings()
