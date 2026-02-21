from __future__ import annotations

import argparse

from src import db
from src.core import poll_once
from src.scheduler import AppScheduler
from src.ui_streamlit import run_ui
from src.utils import load_config, setup_logging


def main() -> None:
    parser = argparse.ArgumentParser(description="Corn Sell Watcher")
    parser.add_argument("--mode", choices=["ui", "once", "scheduler"], default="once")
    args = parser.parse_args()

    logger = setup_logging()
    config = load_config()
    db.init_db()

    if args.mode == "once":
        out = poll_once(config, logger)
        print(f"Logged tick: ${out['price']:.2f} | Prob season high: {out['signal'].prob_season_high_today:.1%}")
    elif args.mode == "scheduler":
        sched = AppScheduler()
        sched.start(
            lambda: poll_once(config, logger),
            interval=config["polling"].get("interval", "hourly"),
            daily_time=config["polling"].get("daily_time", "09:05"),
            timezone=config.get("timezone", "America/Chicago"),
        )
        print("Scheduler running. Press Ctrl+C to exit.")
        try:
            import time

            while True:
                time.sleep(60)
        except KeyboardInterrupt:
            sched.stop()
    else:
        print("UI mode is intended for Streamlit.")
        print("Run: python -m streamlit run dashboard.py")
        run_ui(config, logger)


if __name__ == "__main__":
    main()
