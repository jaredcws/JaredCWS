from __future__ import annotations

import streamlit as st

from . import db
from .core import poll_once
from .signals import compute_probability
from .utils import confidence_to_threshold
from .weather import fetch_nws_forecast, weather_risk_score


def run_ui(config: dict, logger) -> None:
    st.set_page_config(page_title="Corn Sell Watcher", layout="wide")
    st.title("Whittemore, IA Corn Sell Watcher")

    with st.sidebar:
        st.header("Settings")
        interval = st.selectbox("Polling interval", ["15m", "hourly", "daily", "weekly"], index=["15m", "hourly", "daily", "weekly"].index(config["polling"].get("interval", "hourly")))
        daily_time = st.text_input("Daily/Weekly time (HH:MM)", value=config["polling"].get("daily_time", "09:05"))
        confidence = st.slider("Confidence / Aggressiveness", 0, 100, int(config["alerts"].get("confidence_level", 50)))
        email_on = st.toggle("Email alerts", value=config["alerts"].get("email_enabled", False))
        sms_on = st.toggle("SMS alerts", value=config["alerts"].get("sms_enabled", False))

        config["polling"]["interval"] = interval
        config["polling"]["daily_time"] = daily_time
        config["alerts"]["confidence_level"] = confidence
        config["alerts"]["email_enabled"] = email_on
        config["alerts"]["sms_enabled"] = sms_on

        st.caption(f"Best-time threshold: {confidence_to_threshold(confidence):.1%}")

    if st.button("Poll now"):
        try:
            result = poll_once(config, logger)
            st.success(f"Fetched and logged tick: ${result['price']:.2f}")
        except Exception as e:
            st.error(f"Polling failed: {e}")

    daily = db.daily_df(180)
    ticks = db.ticks_df(100)

    weather_risk = 0.0
    weather_periods = []
    try:
        bundle = fetch_nws_forecast(config["weather"]["lat"], config["weather"]["lon"])
        weather_risk, weather_periods = weather_risk_score(bundle)
    except Exception as e:
        st.warning(f"Weather fetch failed: {e}")

    signal = compute_probability(daily, weather_risk, confidence)

    c1, c2, c3, c4 = st.columns(4)
    current_price = float(ticks.iloc[0]["price"]) if not ticks.empty else 0.0
    c1.metric("Current price", f"${current_price:.2f}")

    high_2026 = db.seasonal_high(2026)
    if high_2026:
        c2.metric("2026 high", f"${high_2026['price']:.2f}", help=f"Date: {high_2026['date_local']}")
    else:
        c2.metric("2026 high", "n/a")

    r30 = db.rolling_high(30)
    r60 = db.rolling_high(60)
    c3.metric("Rolling 30d / 60d", f"${(r30 or 0):.2f} / ${(r60 or 0):.2f}")
    c4.metric("P(today is season high)", f"{signal.prob_season_high_today:.1%}")

    st.write(f"**Drivers:** {signal.explanation}")
    st.write(f"**Weather risk (7d):** {weather_risk:.2f}")

    if not daily.empty:
        chart_df = daily.tail(90).set_index("date_local")[["max_price", "last_price"]]
        st.line_chart(chart_df)

    st.subheader("Recent ticks")
    st.dataframe(ticks)

    st.subheader("NWS outlook (sample)")
    st.dataframe(weather_periods[:7])
