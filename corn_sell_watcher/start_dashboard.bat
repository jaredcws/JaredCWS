@echo off
setlocal
cd /d %~dp0

if not exist .venv (
  echo [INFO] Creating virtual environment...
  py -m venv .venv
)

call .venv\Scripts\activate
python -m pip install -r requirements.txt

if not exist config.json (
  copy config.example.json config.json >nul
  echo [INFO] Created config.json from config.example.json
)

echo [INFO] Starting dashboard at http://localhost:8501
python -m streamlit run dashboard.py
