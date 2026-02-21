from __future__ import annotations

from datetime import datetime, timezone

from . import db
from .fetcher import fetch_html, fetch_html_with_playwright
from .notify import send_email, send_sms
from .parser import parse_top_corn_price
from .signals import SignalResult, compute_probability, should_fire_best_time
from .utils import now_local
from .weather import fetch_nws_forecast, weather_risk_score


def poll_once(config: dict, logger) -> dict:
    source_url = config["source_url"]
    try:
        html = fetch_html(source_url)
    except Exception as e:
        logger.warning("Requests fetch failed, using Playwright fallback: %s", e)
        html = fetch_html_with_playwright(source_url)

    price = parse_top_corn_price(html)

    local_now = now_local(config["timezone"])
    utc_now = datetime.now(timezone.utc)

    db.insert_tick(
        timestamp_utc=utc_now.isoformat(),
        timestamp_local=local_now.isoformat(),
        date_local=local_now.date().isoformat(),
        location=config["location"],
        commodity="Corn",
        price=price,
        source_url=source_url,
    )

    daily = db.daily_df(limit_days=190)

    weather_bundle = fetch_nws_forecast(config["weather"]["lat"], config["weather"]["lon"])
    weather_risk, weather_periods = weather_risk_score(weather_bundle)
    signal = compute_probability(daily, weather_risk_7d=weather_risk, confidence_level=config["alerts"]["confidence_level"])

    _process_alerts(config, logger, price, signal)

    return {
        "price": price,
        "weather_risk": weather_risk,
        "weather_periods": weather_periods,
        "signal": signal,
        "local_now": local_now,
    }


def _maybe_send(config: dict, logger, alert_type: str, text: str, price: float) -> None:
    today = now_local(config["timezone"]).date().isoformat()
    last_price = db.last_alert(today, alert_type)
    cooldown_delta = float(config["alerts"].get("cooldown_delta", 0.02))
    if last_price is not None and price < (last_price + cooldown_delta):
        return

    if config["alerts"].get("email_enabled"):
        send_email(config["smtp"], f"Corn Alert: {alert_type}", text)
    if config["alerts"].get("sms_enabled"):
        send_sms(config["twilio"], text)

    db.record_alert(today, alert_type, price, text)
    logger.info("Alert sent: %s @ %.2f", alert_type, price)


def _process_alerts(config: dict, logger, price: float, signal: SignalResult) -> None:
    high_2026 = db.seasonal_high(2026)
    if high_2026 and price >= high_2026["price"]:
        _maybe_send(config, logger, "new_2026_high", f"New 2026 high: ${price:.2f}/bu", price)

    r30 = db.rolling_high(30)
    if r30 is not None and price >= r30:
        _maybe_send(config, logger, "rolling_30_high", f"New rolling 30-day high: ${price:.2f}/bu", price)

    r60 = db.rolling_high(60)
    if r60 is not None and price >= r60:
        _maybe_send(config, logger, "rolling_60_high", f"New rolling 60-day high: ${price:.2f}/bu", price)

    if should_fire_best_time(signal.prob_season_high_today, config["alerts"]["confidence_level"]):
        _maybe_send(
            config,
            logger,
            "best_time_to_sell",
            f"Best-time probability {signal.prob_season_high_today:.1%} exceeded threshold {signal.metrics['threshold']:.1%}.",
            price,
        )
