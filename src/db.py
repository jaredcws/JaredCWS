import json
import os
import sqlite3
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Any, Iterable

DB_PATH = os.getenv("APP_DB_PATH", "candidate_sourcing.db")


def utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


@contextmanager
def transaction() -> Iterable[sqlite3.Connection]:
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    with transaction() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS roles (
              id TEXT PRIMARY KEY,
              title TEXT NOT NULL,
              department TEXT,
              location_policy TEXT NOT NULL,
              min_years_experience INTEGER NOT NULL,
              must_have_skills TEXT NOT NULL,
              nice_to_have_skills TEXT NOT NULL,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS candidates (
              id TEXT PRIMARY KEY,
              full_name TEXT NOT NULL,
              headline TEXT,
              current_company TEXT,
              current_title TEXT,
              primary_email TEXT,
              primary_phone TEXT,
              status TEXT NOT NULL,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS candidate_experiences (
              id TEXT PRIMARY KEY,
              candidate_id TEXT NOT NULL,
              company TEXT NOT NULL,
              title TEXT NOT NULL,
              start_date TEXT,
              end_date TEXT,
              is_current INTEGER NOT NULL DEFAULT 0,
              description TEXT,
              created_at TEXT NOT NULL,
              FOREIGN KEY(candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS candidate_scores (
              id TEXT PRIMARY KEY,
              candidate_id TEXT NOT NULL,
              role_id TEXT NOT NULL,
              overall_score REAL NOT NULL,
              skill_fit REAL NOT NULL,
              experience_fit REAL NOT NULL,
              location_fit REAL NOT NULL,
              seniority_fit REAL NOT NULL,
              signal_fit REAL NOT NULL,
              score_explanation TEXT NOT NULL,
              scored_at TEXT NOT NULL,
              FOREIGN KEY(candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
              FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS candidate_reports (
              id TEXT PRIMARY KEY,
              candidate_id TEXT NOT NULL,
              role_id TEXT,
              report_version TEXT NOT NULL,
              executive_summary TEXT NOT NULL,
              report_payload TEXT NOT NULL,
              confidence_score REAL,
              generated_at TEXT NOT NULL,
              FOREIGN KEY(candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
              FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS outreach_events (
              id TEXT PRIMARY KEY,
              candidate_id TEXT NOT NULL,
              role_id TEXT,
              channel TEXT NOT NULL,
              template_name TEXT,
              message_subject TEXT,
              message_body TEXT,
              sent_at TEXT NOT NULL,
              response_status TEXT NOT NULL,
              response_at TEXT,
              FOREIGN KEY(candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
              FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE SET NULL
            );
            """
        )


def seed_demo_data() -> None:
    with transaction() as conn:
        exists = conn.execute("SELECT COUNT(*) AS c FROM candidates").fetchone()["c"]
        if exists:
            return

        cand_id = str(uuid.uuid4())
        now = utcnow()
        conn.execute(
            """
            INSERT INTO candidates(id, full_name, headline, current_company, current_title, primary_email, primary_phone, status, created_at, updated_at)
            VALUES(?,?,?,?,?,?,?,?,?,?)
            """,
            (
                cand_id,
                "Jane Doe",
                "Senior Backend Engineer",
                "Acme",
                "Senior Backend Engineer",
                "jane@example.com",
                "+15555555555",
                "review",
                now,
                now,
            ),
        )


def create_role(payload: dict[str, Any]) -> str:
    role_id = str(uuid.uuid4())
    now = utcnow()
    with transaction() as conn:
        conn.execute(
            """
            INSERT INTO roles(id,title,department,location_policy,min_years_experience,must_have_skills,nice_to_have_skills,created_at,updated_at)
            VALUES(?,?,?,?,?,?,?,?,?)
            """,
            (
                role_id,
                payload["title"],
                payload.get("department"),
                payload["location_policy"],
                payload["min_years_experience"],
                json.dumps(payload.get("must_have_skills", [])),
                json.dumps(payload.get("nice_to_have_skills", [])),
                now,
                now,
            ),
        )
    return role_id


def get_role(role_id: str) -> sqlite3.Row | None:
    with transaction() as conn:
        return conn.execute("SELECT * FROM roles WHERE id = ?", (role_id,)).fetchone()


def compute_candidate_score(candidate: sqlite3.Row, role: sqlite3.Row) -> dict[str, float]:
    # Placeholder deterministic scoring for MVP.
    skill_fit = 90.0 if "Backend" in (candidate["headline"] or "") else 65.0
    experience_fit = 82.0
    location_fit = 95.0 if "remote" in role["location_policy"].lower() else 75.0
    seniority_fit = 80.0
    signal_fit = 78.0
    overall = 0.35 * skill_fit + 0.25 * experience_fit + 0.20 * location_fit + 0.10 * seniority_fit + 0.10 * signal_fit
    return {
        "overall_score": round(overall, 2),
        "skill_fit": skill_fit,
        "experience_fit": experience_fit,
        "location_fit": location_fit,
        "seniority_fit": seniority_fit,
        "signal_fit": signal_fit,
    }


def upsert_score(candidate_id: str, role_id: str) -> dict[str, Any] | None:
    with transaction() as conn:
        candidate = conn.execute("SELECT * FROM candidates WHERE id = ?", (candidate_id,)).fetchone()
        role = conn.execute("SELECT * FROM roles WHERE id = ?", (role_id,)).fetchone()
        if not candidate or not role:
            return None

        score = compute_candidate_score(candidate, role)
        score_id = str(uuid.uuid4())
        scored_at = utcnow()
        explanation = {
            "must_have_skills_matched": json.loads(role["must_have_skills"]),
            "gaps": [],
        }
        conn.execute(
            """
            INSERT INTO candidate_scores(id,candidate_id,role_id,overall_score,skill_fit,experience_fit,location_fit,seniority_fit,signal_fit,score_explanation,scored_at)
            VALUES(?,?,?,?,?,?,?,?,?,?,?)
            """,
            (
                score_id,
                candidate_id,
                role_id,
                score["overall_score"],
                score["skill_fit"],
                score["experience_fit"],
                score["location_fit"],
                score["seniority_fit"],
                score["signal_fit"],
                json.dumps(explanation),
                scored_at,
            ),
        )

        return {
            "candidate_id": candidate_id,
            "role_id": role_id,
            "overall_score": score["overall_score"],
            "components": {
                "skill_fit": score["skill_fit"],
                "experience_fit": score["experience_fit"],
                "location_fit": score["location_fit"],
                "seniority_fit": score["seniority_fit"],
                "signal_fit": score["signal_fit"],
            },
            "explanation": explanation,
            "scored_at": scored_at,
        }


def search_candidates(role_id: str, min_score: float | None, status: str | None, page: int, page_size: int) -> dict[str, Any] | None:
    role = get_role(role_id)
    if not role:
        return None

    with transaction() as conn:
        rows = conn.execute("SELECT * FROM candidates").fetchall()

    items: list[dict[str, Any]] = []
    for row in rows:
        scored = upsert_score(row["id"], role_id)
        if not scored:
            continue
        if min_score is not None and scored["overall_score"] < min_score:
            continue
        if status and row["status"] != status:
            continue
        items.append(
            {
                "candidate_id": row["id"],
                "full_name": row["full_name"],
                "overall_score": scored["overall_score"],
                "status": row["status"],
                "top_reasons": ["Strong backend fit", "Location policy match"],
            }
        )

    start = (page - 1) * page_size
    end = start + page_size
    paged = items[start:end]
    return {"items": paged, "page": page, "page_size": page_size, "total": len(items)}


def latest_score(candidate_id: str, role_id: str) -> dict[str, Any] | None:
    with transaction() as conn:
        row = conn.execute(
            """
            SELECT * FROM candidate_scores
            WHERE candidate_id = ? AND role_id = ?
            ORDER BY scored_at DESC LIMIT 1
            """,
            (candidate_id, role_id),
        ).fetchone()
    if not row:
        return upsert_score(candidate_id, role_id)
    return {
        "candidate_id": row["candidate_id"],
        "role_id": row["role_id"],
        "overall_score": row["overall_score"],
        "components": {
            "skill_fit": row["skill_fit"],
            "experience_fit": row["experience_fit"],
            "location_fit": row["location_fit"],
            "seniority_fit": row["seniority_fit"],
            "signal_fit": row["signal_fit"],
        },
        "explanation": json.loads(row["score_explanation"]),
        "scored_at": row["scored_at"],
    }


def generate_report(candidate_id: str, role_id: str) -> dict[str, Any] | None:
    with transaction() as conn:
        candidate = conn.execute("SELECT * FROM candidates WHERE id = ?", (candidate_id,)).fetchone()
        role = conn.execute("SELECT * FROM roles WHERE id = ?", (role_id,)).fetchone()

    if not candidate or not role:
        return None

    score = latest_score(candidate_id, role_id)
    if not score:
        return None

    report_id = str(uuid.uuid4())
    generated_at = utcnow()
    payload = {
        "report_id": report_id,
        "candidate_id": candidate_id,
        "role_id": role_id,
        "header": {
            "name": candidate["full_name"],
            "current_title": candidate["current_title"],
            "current_company": candidate["current_company"],
            "location": role["location_policy"],
        },
        "executive_summary": f"{candidate['full_name']} is a strong match for {role['title']} based on current profile and score.",
        "fit_matrix": {
            "overall": score["overall_score"],
            **score["components"],
        },
        "risk_flags": [],
        "evidence": [
            {"claim": "Profile includes backend experience", "source": "internal_demo_seed", "confidence": 0.9}
        ],
        "generated_at": generated_at,
    }

    with transaction() as conn:
        conn.execute(
            """
            INSERT INTO candidate_reports(id,candidate_id,role_id,report_version,executive_summary,report_payload,confidence_score,generated_at)
            VALUES(?,?,?,?,?,?,?,?)
            """,
            (
                report_id,
                candidate_id,
                role_id,
                "v1",
                payload["executive_summary"],
                json.dumps(payload),
                90.0,
                generated_at,
            ),
        )

    return payload


def create_outreach(payload: dict[str, Any]) -> str | None:
    with transaction() as conn:
        candidate = conn.execute("SELECT id FROM candidates WHERE id = ?", (payload["candidate_id"],)).fetchone()
        if not candidate:
            return None
        event_id = str(uuid.uuid4())
        conn.execute(
            """
            INSERT INTO outreach_events(id,candidate_id,role_id,channel,template_name,message_subject,message_body,sent_at,response_status,response_at)
            VALUES(?,?,?,?,?,?,?,?,?,?)
            """,
            (
                event_id,
                payload["candidate_id"],
                payload.get("role_id"),
                payload["channel"],
                payload.get("template_name"),
                payload.get("message_subject"),
                payload.get("message_body"),
                utcnow(),
                "none",
                None,
            ),
        )
        conn.execute(
            "UPDATE candidates SET status = ?, updated_at = ? WHERE id = ?",
            ("contacted", utcnow(), payload["candidate_id"]),
        )
    return event_id
