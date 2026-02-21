from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Any

import pandas as pd

from .utils import DATA_DIR

DB_PATH = DATA_DIR / "corn_prices.sqlite"


def get_conn(db_path: Path = DB_PATH) -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_conn() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS price_ticks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp_utc TEXT NOT NULL,
                timestamp_local TEXT NOT NULL,
                date_local TEXT NOT NULL,
                location TEXT NOT NULL,
                commodity TEXT NOT NULL,
                price REAL NOT NULL,
                source_url TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS alerts_sent (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                alert_date TEXT NOT NULL,
                alert_type TEXT NOT NULL,
                price REAL,
                payload TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS app_state (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE VIEW IF NOT EXISTS price_daily AS
            SELECT
                date_local,
                MAX(price) AS max_price,
                MIN(timestamp_local) AS first_ts,
                MAX(timestamp_local) AS last_ts
            FROM price_ticks
            GROUP BY date_local
            """
        )
        conn.commit()


def insert_tick(timestamp_utc: str, timestamp_local: str, date_local: str, location: str, commodity: str, price: float, source_url: str) -> None:
    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO price_ticks(timestamp_utc,timestamp_local,date_local,location,commodity,price,source_url)
            VALUES(?,?,?,?,?,?,?)
            """,
            (timestamp_utc, timestamp_local, date_local, location, commodity, price, source_url),
        )
        conn.commit()


def daily_df(limit_days: int = 180) -> pd.DataFrame:
    query = """
    SELECT date_local,
           MAX(price) AS max_price,
           (SELECT pt2.price FROM price_ticks pt2 WHERE pt2.date_local = pt.date_local ORDER BY timestamp_local ASC LIMIT 1) AS first_price,
           (SELECT pt3.price FROM price_ticks pt3 WHERE pt3.date_local = pt.date_local ORDER BY timestamp_local DESC LIMIT 1) AS last_price
    FROM price_ticks pt
    GROUP BY date_local
    ORDER BY date_local DESC
    LIMIT ?
    """
    with get_conn() as conn:
        df = pd.read_sql_query(query, conn, params=(limit_days,))
    if df.empty:
        return df
    return df.sort_values("date_local")


def ticks_df(limit: int = 200) -> pd.DataFrame:
    with get_conn() as conn:
        df = pd.read_sql_query(
            "SELECT timestamp_local, price, source_url FROM price_ticks ORDER BY timestamp_local DESC LIMIT ?",
            conn,
            params=(limit,),
        )
    return df


def seasonal_high(year: int = 2026) -> dict[str, Any] | None:
    with get_conn() as conn:
        row = conn.execute(
            """
            SELECT date_local, MAX(price) AS high_price
            FROM price_ticks
            WHERE date_local >= ?
            """,
            (f"{year}-01-01",),
        ).fetchone()
    if not row or row["high_price"] is None:
        return None
    return {"date_local": row["date_local"], "price": row["high_price"]}


def rolling_high(days: int) -> float | None:
    with get_conn() as conn:
        row = conn.execute(
            """
            SELECT MAX(max_price) as rolling_high
            FROM (
                SELECT date_local, MAX(price) AS max_price
                FROM price_ticks
                WHERE date(date_local) >= date('now', ?)
                GROUP BY date_local
            )
            """,
            (f"-{days} day",),
        ).fetchone()
    return None if not row else row["rolling_high"]


def last_alert(alert_date: str, alert_type: str) -> float | None:
    with get_conn() as conn:
        row = conn.execute(
            "SELECT price FROM alerts_sent WHERE alert_date=? AND alert_type=? ORDER BY id DESC LIMIT 1",
            (alert_date, alert_type),
        ).fetchone()
    return None if not row else row["price"]


def record_alert(alert_date: str, alert_type: str, price: float, payload: str = "") -> None:
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO alerts_sent(alert_date, alert_type, price, payload) VALUES(?,?,?,?)",
            (alert_date, alert_type, price, payload),
        )
        conn.commit()
