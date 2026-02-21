from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np
import pandas as pd

from .utils import confidence_to_threshold


@dataclass
class SignalResult:
    prob_season_high_today: float
    explanation: str
    metrics: dict


def _seasonality_factor(day_index: int) -> float:
    # Window Jan1-Jun1 ~=152 days; favor later dates in the window.
    return max(0.0, min(1.0, day_index / 152.0))


def compute_probability(daily: pd.DataFrame, weather_risk_7d: float, confidence_level: int) -> SignalResult:
    if daily.empty:
        return SignalResult(0.0, "Not enough data yet.", {})

    prices = daily["last_price"].astype(float)
    today_price = float(prices.iloc[-1])
    price_rank_ytd = float((prices <= today_price).mean())

    max_30 = float(daily.tail(30)["max_price"].max()) if len(daily) else today_price
    max_60 = float(daily.tail(60)["max_price"].max()) if len(daily) else today_price
    breakout_30 = 1.0 if today_price >= max_30 else 0.0
    breakout_60 = 1.0 if today_price >= max_60 else 0.0

    avg_7 = float(prices.tail(7).mean()) if len(prices) >= 1 else today_price
    momentum_7d = today_price - avg_7

    returns = prices.pct_change().dropna()
    volatility_14d = float(returns.tail(14).std()) if len(returns) >= 2 else 0.0

    latest_date = pd.to_datetime(daily.iloc[-1]["date_local"])
    season_start = pd.Timestamp(year=latest_date.year, month=1, day=1)
    day_index = int((latest_date - season_start).days) + 1
    seasonality = _seasonality_factor(day_index)

    momentum_scaled = float(np.tanh(momentum_7d * 8))
    vol_scaled = float(np.tanh(volatility_14d * 15))

    # Conservative starter weights
    w = {
        "w0": -1.2,
        "price_rank_ytd": 2.1,
        "breakout_30": 0.75,
        "breakout_60": 0.85,
        "momentum": 0.8,
        "volatility": -0.35,
        "weather_risk": 0.55,
        "seasonality": 0.6,
    }

    score = (
        w["w0"]
        + w["price_rank_ytd"] * price_rank_ytd
        + w["breakout_30"] * breakout_30
        + w["breakout_60"] * breakout_60
        + w["momentum"] * momentum_scaled
        + w["volatility"] * vol_scaled
        + w["weather_risk"] * weather_risk_7d
        + w["seasonality"] * seasonality
    )

    prob = 1.0 / (1.0 + math.exp(-score))

    contrib = {
        "Price rank": w["price_rank_ytd"] * price_rank_ytd,
        "Breakout 60d": w["breakout_60"] * breakout_60,
        "Breakout 30d": w["breakout_30"] * breakout_30,
        "Momentum": w["momentum"] * momentum_scaled,
        "Volatility": w["volatility"] * vol_scaled,
        "Weather risk": w["weather_risk"] * weather_risk_7d,
        "Seasonality": w["seasonality"] * seasonality,
    }
    top3 = sorted(contrib.items(), key=lambda kv: abs(kv[1]), reverse=True)[:3]
    explanation = ", ".join([f"{k} ({v:+.2f})" for k, v in top3])

    threshold = confidence_to_threshold(confidence_level)
    metrics = {
        "price_rank_ytd": price_rank_ytd,
        "breakout_30": breakout_30,
        "breakout_60": breakout_60,
        "momentum_7d": momentum_7d,
        "volatility_14d": volatility_14d,
        "weather_risk_7d": weather_risk_7d,
        "season_day_index": day_index,
        "threshold": threshold,
    }
    return SignalResult(prob, explanation, metrics)


def should_fire_best_time(prob: float, confidence_level: int) -> bool:
    return prob >= confidence_to_threshold(confidence_level)
