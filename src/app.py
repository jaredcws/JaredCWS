from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field

from src import db


class RoleCreate(BaseModel):
    title: str
    department: str | None = None
    location_policy: str
    min_years_experience: int = Field(ge=0)
    must_have_skills: list[str] = []
    nice_to_have_skills: list[str] = []


class OutreachCreate(BaseModel):
    candidate_id: str
    role_id: str | None = None
    channel: str
    template_name: str | None = None
    message_subject: str | None = None
    message_body: str | None = None


app = FastAPI(title="Candidate Sourcing MVP")


@app.on_event("startup")
def startup() -> None:
    db.init_db()
    db.seed_demo_data()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/roles", status_code=201)
def create_role(payload: RoleCreate) -> dict[str, str]:
    role_id = db.create_role(payload.model_dump())
    return {"id": role_id, "status": "created"}


@app.get("/candidates/search")
def candidates_search(
    role_id: str,
    min_score: float | None = None,
    status: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
) -> dict:
    result = db.search_candidates(role_id, min_score, status, page, page_size)
    if not result:
        raise HTTPException(status_code=404, detail="role not found")
    return result


@app.get("/scores/{candidate_id}")
def get_score(candidate_id: str, role_id: str) -> dict:
    result = db.latest_score(candidate_id, role_id)
    if not result:
        raise HTTPException(status_code=404, detail="candidate or role not found")
    return result


@app.get("/candidates/{candidate_id}/report")
def candidate_report(candidate_id: str, role_id: str, format: str = "json") -> dict:
    if format not in {"json", "pdf"}:
        raise HTTPException(status_code=400, detail="invalid format")

    report = db.generate_report(candidate_id, role_id)
    if not report:
        raise HTTPException(status_code=404, detail="candidate or role not found")

    if format == "pdf":
        # MVP placeholder; returns JSON metadata indicating export readiness.
        report["export"] = {"format": "pdf", "status": "queued"}
    return report


@app.post("/outreach", status_code=201)
def outreach(payload: OutreachCreate) -> dict[str, str]:
    if payload.channel not in {"email", "linkedin_inmail", "phone", "other"}:
        raise HTTPException(status_code=400, detail="invalid channel")
    event_id = db.create_outreach(payload.model_dump())
    if not event_id:
        raise HTTPException(status_code=404, detail="candidate not found")
    return {"id": event_id, "status": "logged"}
