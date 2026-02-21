from __future__ import annotations

import json
import logging
import os
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
LOG_DIR = BASE_DIR / "logs"
CONFIG_PATH = BASE_DIR / "config.json"
EXAMPLE_CONFIG_PATH = BASE_DIR / "config.example.json"


def ensure_dirs() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    LOG_DIR.mkdir(parents=True, exist_ok=True)


def setup_logging() -> logging.Logger:
    ensure_dirs()
    logger = logging.getLogger("corn_sell_watcher")
    if logger.handlers:
        return logger

    logger.setLevel(logging.INFO)
    fh = logging.FileHandler(LOG_DIR / "app.log", encoding="utf-8")
    fmt = logging.Formatter("%(asctime)s | %(levelname)s | %(name)s | %(message)s")
    fh.setFormatter(fmt)
    logger.addHandler(fh)
    logger.addHandler(logging.StreamHandler())
    return logger


def load_config() -> dict:
    path = CONFIG_PATH if CONFIG_PATH.exists() else EXAMPLE_CONFIG_PATH
    with open(path, "r", encoding="utf-8") as f:
        config = json.load(f)

    # env overrides
    config["twilio"]["account_sid"] = os.getenv("TWILIO_ACCOUNT_SID", config["twilio"]["account_sid"])
    config["twilio"]["auth_token"] = os.getenv("TWILIO_AUTH_TOKEN", config["twilio"]["auth_token"])
    config["smtp"]["password"] = os.getenv("SMTP_PASSWORD", config["smtp"]["password"])
    return config


def now_local(tz_name: str) -> datetime:
    return datetime.now(ZoneInfo(tz_name))


def parse_currency(value: str) -> float:
    cleaned = value.replace("$", "").replace(",", "").strip()
    return float(cleaned)


def confidence_to_threshold(level: int) -> float:
    level = max(0, min(100, int(level)))
    if level <= 20:
        return 0.25
    if level >= 80:
        return 0.60
    # Linear interpolate between key points 20->0.25 and 80->0.60
    return 0.25 + (level - 20) * ((0.60 - 0.25) / 60)
