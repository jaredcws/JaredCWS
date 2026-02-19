# Candidate Sourcing MVP Service

This repository includes:
- A runnable FastAPI backend MVP implementing the planned endpoints.
- A Windows-friendly desktop UI (`desktop_app.py`) so non-technical users can use the app without Swagger.

## Backend API Endpoints

- `POST /roles`
- `GET /candidates/search`
- `GET /scores/{candidate_id}`
- `GET /candidates/{candidate_id}/report`
- `POST /outreach`

## Run Backend Locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn src.app:app --reload
```

Backend URL: `http://127.0.0.1:8000`

## Run Desktop App

The desktop app can call an already-running backend at `http://127.0.0.1:8000`, or you can click **Start API in Background** inside the UI.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python desktop_app.py
```

Windows Command Prompt activation command:

```bat
.venv\Scripts\activate
```

## Desktop Workflow

1. Open **Role Setup** tab and create/save a role.
2. Go to **Search** tab and fetch candidates for the saved role.
3. Select a candidate row.
4. Go to **Candidate Report / Outreach** tab and click:
   - **Get Score**
   - **Generate Report**
   - **Log Outreach** (optional)

## Test

```bash
pytest -q
```

## Quick Smoke-Test Checklist

- [ ] Launch backend (`uvicorn src.app:app --reload`) or start it from desktop app.
- [ ] Open desktop app with `python desktop_app.py`.
- [ ] Create a role and verify role ID appears in the app.
- [ ] Search candidates and verify list rows are shown.
- [ ] Select a candidate and generate score/report.
- [ ] Log outreach and confirm success message.

## Notes

- Uses SQLite for quick-start local execution.
- Seeds one demo candidate on startup so search/report endpoints work immediately.
