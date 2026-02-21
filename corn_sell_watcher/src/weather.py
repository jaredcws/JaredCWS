from __future__ import annotations

from statistics import mean

import requests

HEADERS = {
    "User-Agent": "corn-sell-watcher/1.0 (Whittemore IA desktop app)",
    "Accept": "application/geo+json",
}


def fetch_nws_forecast(lat: float, lon: float) -> dict:
    points = requests.get(f"https://api.weather.gov/points/{lat},{lon}", headers=HEADERS, timeout=20)
    points.raise_for_status()
    points_json = points.json()
    forecast_url = points_json["properties"]["forecast"]
    hourly_url = points_json["properties"].get("forecastHourly")

    forecast = requests.get(forecast_url, headers=HEADERS, timeout=20)
    forecast.raise_for_status()
    forecast_json = forecast.json()

    hourly_json = None
    if hourly_url:
        hourly = requests.get(hourly_url, headers=HEADERS, timeout=20)
        hourly.raise_for_status()
        hourly_json = hourly.json()

    return {"forecast": forecast_json, "hourly": hourly_json}


def weather_risk_score(forecast_bundle: dict) -> tuple[float, list[dict]]:
    periods = forecast_bundle["forecast"]["properties"]["periods"][:14]
    parsed = []
    precip_values = []
    temps = []

    for p in periods:
        pop = p.get("probabilityOfPrecipitation", {}).get("value") or 0
        temp = p.get("temperature") or 50
        parsed.append({"name": p.get("name"), "temp": temp, "precip": pop, "short": p.get("shortForecast", "")})
        precip_values.append(pop / 100.0)
        temps.append(temp)

    precip_component = mean(precip_values) if precip_values else 0
    cold_component = max(0.0, (45 - mean(temps)) / 45) if temps else 0
    score = max(0.0, min(1.0, 0.65 * precip_component + 0.35 * cold_component))
    return score, parsed
