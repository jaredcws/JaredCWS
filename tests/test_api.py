import os
import tempfile

from fastapi.testclient import TestClient


def build_client():
    db_fd, db_path = tempfile.mkstemp(prefix="candidate_sourcing_", suffix=".db")
    os.close(db_fd)
    os.environ["APP_DB_PATH"] = db_path

    from src.app import app
    from src import db

    db.init_db()
    db.seed_demo_data()

    return TestClient(app), db_path


def test_end_to_end_flow():
    client, db_path = build_client()

    role_resp = client.post(
        "/roles",
        json={
            "title": "Senior Backend Engineer",
            "department": "Engineering",
            "location_policy": "US remote",
            "min_years_experience": 5,
            "must_have_skills": ["Python", "AWS"],
            "nice_to_have_skills": ["Kubernetes"],
        },
    )
    assert role_resp.status_code == 201
    role_id = role_resp.json()["id"]

    search_resp = client.get(f"/candidates/search?role_id={role_id}")
    assert search_resp.status_code == 200
    items = search_resp.json()["items"]
    assert len(items) >= 1
    candidate_id = items[0]["candidate_id"]

    score_resp = client.get(f"/scores/{candidate_id}?role_id={role_id}")
    assert score_resp.status_code == 200
    assert score_resp.json()["overall_score"] >= 0

    report_resp = client.get(f"/candidates/{candidate_id}/report?role_id={role_id}")
    assert report_resp.status_code == 200
    assert report_resp.json()["header"]["name"]

    outreach_resp = client.post(
        "/outreach",
        json={
            "candidate_id": candidate_id,
            "role_id": role_id,
            "channel": "email",
            "template_name": "v1",
            "message_subject": "Hello",
            "message_body": "Hi there",
        },
    )
    assert outreach_resp.status_code == 201

    os.remove(db_path)
