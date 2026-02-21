# Corn Sell Watcher (Whittemore, IA MVP)

Local Windows-friendly Python app for tracking Whittemore (`agricharts_loc=202`) top-line **Corn cash price**, storing history in SQLite, calculating highs and a transparent probability that **today is the Jan 1–Jun 1 seasonal high**, and optionally alerting via Email + Twilio SMS.

## What it does
- Scrapes New Cooperative cash bids page and parses first row where Name = `Corn`.
- Logs each price tick to SQLite (`data/corn_prices.sqlite`).
- Computes 2026 high, rolling 30-day high, rolling 60-day high.
- Pulls NWS forecast (`api.weather.gov`) and derives weather risk score (0–1).
- Produces explainable probability (`logistic-style`) for best time to sell.
- Supports cooldown-based alerts for:
  - New 2026 high
  - Rolling 30 high
  - Rolling 60 high
  - Best-time probability threshold cross
- Streamlit dashboard with settings and charts.

## Project structure

```text
corn_sell_watcher/
  README.md
  requirements.txt
  config.example.json
  app.py
  dashboard.py                    # dedicated Streamlit entrypoint
  start_dashboard.bat             # one-click Windows launcher (cmd)
  start_dashboard.ps1             # one-click Windows launcher (PowerShell)
  src/
    core.py
    fetcher.py
    parser.py
    weather.py
    db.py
    signals.py
    notify.py
    scheduler.py
    ui_streamlit.py
    utils.py
  data/
  logs/
```

## Setup

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp config.example.json config.json  # Windows: copy config.example.json config.json
```

## How to view this on your computer

### Easiest (Windows): one-click launcher
- **Command Prompt**: double-click `start_dashboard.bat`
- **PowerShell**: right-click `start_dashboard.ps1` → *Run with PowerShell*

Both scripts will:
1. create `.venv` if needed,
2. install requirements,
3. create `config.json` if missing,
4. start the dashboard.

### Manual run
```bash
python -m streamlit run dashboard.py
```

Then open:
- `http://localhost:8501`

## Other run modes

```bash
# one immediate poll + DB write
python app.py --mode once

# background scheduler mode
python app.py --mode scheduler
```

## Troubleshooting “I can’t view it”
- If browser does not auto-open, manually go to `http://localhost:8501`.
- Keep the terminal window open while dashboard runs.
- Ensure local firewall/AV is not blocking Python on localhost.
- If a command says `streamlit` not found, run with module form:
  - `python -m streamlit run dashboard.py`

## Twilio credentials
1. Create/login to Twilio account.
2. Get `Account SID`, `Auth Token`, and a messaging-enabled `From` number.
3. Put values in `config.json` (`twilio.*`) or env vars (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`).

Reference docs:
- https://www.twilio.com/docs/messaging/tutorials/how-to-send-sms-messages
- https://www.twilio.com/docs/messaging/quickstart
- https://www.twilio.com/docs/libraries/reference/twilio-python/

## Gmail SMTP app password
1. Enable 2-Step Verification on Google account.
2. Generate an App Password.
3. Use SMTP settings in `config.json`:
   - host: `smtp.gmail.com`
   - port: `587`
   - user: your gmail
   - password: app password

Reference docs:
- https://support.google.com/mail/answer/185833
- https://developers.google.com/workspace/gmail/imap/imap-smtp

## Notes
- Timezone defaults to `America/Chicago`.
- All credentials are externalized; no hardcoded secrets.
- Errors are logged to `logs/app.log`.
- If HTML parsing fails, Playwright fallback is available.
