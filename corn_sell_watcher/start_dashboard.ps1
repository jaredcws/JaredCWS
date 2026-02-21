$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path ".venv")) {
  Write-Host "[INFO] Creating virtual environment..."
  py -m venv .venv
}

. .\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt

if (-not (Test-Path "config.json")) {
  Copy-Item config.example.json config.json
  Write-Host "[INFO] Created config.json from config.example.json"
}

Write-Host "[INFO] Starting dashboard at http://localhost:8501"
python -m streamlit run dashboard.py
