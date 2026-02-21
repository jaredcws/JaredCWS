from __future__ import annotations

from src import db
from src.ui_streamlit import run_ui
from src.utils import load_config, setup_logging


def main() -> None:
    logger = setup_logging()
    config = load_config()
    db.init_db()
    run_ui(config, logger)


if __name__ == "__main__":
    main()
