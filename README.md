# Candidate Sourcing MVP Service

This repository now includes a runnable backend MVP implementing the planned endpoints:

- `POST /roles`
- `GET /candidates/search`
- `GET /scores/{candidate_id}`
- `GET /candidates/{candidate_id}/report`
- `POST /outreach`

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn src.app:app --reload
```

## Test

```bash
pytest -q
```

## Notes

- Uses SQLite for quick-start local execution.
- Seeds one demo candidate on startup so search/report endpoints work immediately.
