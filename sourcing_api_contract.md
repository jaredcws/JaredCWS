# Candidate Sourcing MVP API Contract

## Auth
- Bearer token required on all endpoints.

## 1) POST /roles
Create a hiring role card.

Request:
```json
{
  "title": "Senior Backend Engineer",
  "department": "Engineering",
  "location_policy": "US remote",
  "min_years_experience": 5,
  "must_have_skills": ["Python", "AWS"],
  "nice_to_have_skills": ["Kubernetes", "Fintech"]
}
```

Response: `201 Created`
```json
{ "id": "uuid", "status": "created" }
```

## 2) GET /candidates/search
Search candidates by role and filters.

Query params:
- `role_id` (required)
- `min_score` (optional)
- `status` (optional)
- `page`, `page_size` (optional)

Response: `200 OK`
```json
{
  "items": [
    {
      "candidate_id": "uuid",
      "full_name": "Jane Doe",
      "overall_score": 86.5,
      "status": "review",
      "top_reasons": ["Strong Python+AWS fit", "US timezone match"]
    }
  ],
  "page": 1,
  "page_size": 25,
  "total": 140
}
```

## 3) GET /scores/{candidate_id}
Get detailed score breakdown for a candidate/role.

Query params:
- `role_id` (required)

Response: `200 OK`
```json
{
  "candidate_id": "uuid",
  "role_id": "uuid",
  "overall_score": 86.5,
  "components": {
    "skill_fit": 90,
    "experience_fit": 82,
    "location_fit": 95,
    "seniority_fit": 80,
    "signal_fit": 78
  },
  "explanation": {
    "must_have_skills_matched": ["Python", "AWS"],
    "gaps": []
  },
  "scored_at": "2026-02-18T16:00:00Z"
}
```

## 4) GET /candidates/{candidate_id}/report
Returns a dossier-style candidate report.

Query params:
- `role_id` (required)
- `format` (`json` default, `pdf` optional)

Response: `200 OK` (JSON)
```json
{
  "report_id": "uuid",
  "candidate_id": "uuid",
  "role_id": "uuid",
  "header": {
    "name": "Jane Doe",
    "current_title": "Senior Backend Engineer",
    "current_company": "Acme",
    "location": "Austin, TX"
  },
  "executive_summary": "High fit candidate with strong backend cloud profile.",
  "fit_matrix": {
    "overall": 86.5,
    "skill_fit": 90,
    "experience_fit": 82,
    "location_fit": 95,
    "seniority_fit": 80,
    "signal_fit": 78
  },
  "risk_flags": ["No direct fintech experience"],
  "evidence": [
    {"claim": "5+ years Python", "source": "approved_source_x", "confidence": 0.91}
  ],
  "generated_at": "2026-02-18T16:00:00Z"
}
```

## 5) POST /outreach
Logs outbound outreach and updates stage.

Request:
```json
{
  "candidate_id": "uuid",
  "role_id": "uuid",
  "channel": "email",
  "template_name": "backend_v1",
  "message_subject": "Opportunity at ExampleCo",
  "message_body": "Hi Jane..."
}
```

Response: `201 Created`
```json
{ "id": "uuid", "status": "logged" }
```

## Common Errors
- `400`: invalid payload
- `401`: unauthorized
- `404`: candidate or role not found
- `409`: duplicate event conflict
- `500`: server error
