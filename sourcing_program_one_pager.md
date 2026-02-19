# One-Pager: Candidate Sourcing Program MVP (Decision Draft)

**Owner:** Final Decision Maker (You)  
**Date:** 2026-02-18  
**Status:** Pending Approval

## 1) Decision to Make Today

Approve launch of a 30-day MVP for an internal candidate sourcing system that:
- identifies candidates by skills, relevant years of experience, and location/time-zone fit,
- ranks candidates with explainable scoring,
- generates an individual candidate intelligence-style report (FBI/CIA dossier layout adapted for hiring),
- supports recruiter/hiring-manager shortlist review,
- tracks outreach and conversion outcomes.

## 2) Why This Matters

- Reduce dependence on expensive external recruiters/agencies.
- Build reusable internal hiring infrastructure.
- Improve speed-to-slate and measurable sourcing ROI.

## 3) Scope (MVP)

### In Scope
1. Role intake (must-have skills, min years, location/time-zone).
2. Candidate ingestion from approved/contracted sources.
3. Normalization into a standard data model.
4. Scoring + routing into review queues.
5. Candidate dossier/report generation per person.
6. Shortlist approval workflow.
7. Outreach event tracking and response reporting.

### Out of Scope (Phase 2)
- Full automation of outbound campaigns.
- Complex ML model training pipelines.
- Multi-region legal framework customization beyond baseline controls.

## 4) Default Decisions (Use Immediately)

### A) Scoring Model (v1)
`overall_score = 0.35*skill_fit + 0.25*experience_fit + 0.20*location_fit + 0.10*seniority_fit + 0.10*signal_fit`

Routing:
- `>= 80`: High-priority outreach
- `65–79`: Human review
- `< 65`: Keep warm

### B) Pipeline Stages
`new -> review -> shortlist -> contacted -> responded -> interview -> closed`

### C) Core Data Entities
`roles`, `candidates`, `candidate_experiences`, `candidate_skills`, `candidate_locations`, `candidate_scores`, `outreach_events`, `pipeline_events`, `sources`

### D) API Surface (MVP)
- `POST /roles`
- `GET /candidates/search`
- `GET /scores/{candidate_id}`
- `GET /candidates/{candidate_id}/report`
- `POST /outreach`

### E) Candidate Report Layout (Intelligence Dossier Style)
Each candidate gets a one-page report with a high-clarity, evidence-first layout:
- **Header:** Candidate name, current title/company, location, generated date, report ID.
- **Executive Summary:** 4–6 sentence fit assessment and recommendation.
- **Fit Matrix:** Skill fit, experience fit, location fit, seniority fit, signal fit with numeric scores.
- **Career Timeline:** Chronological role history with tenure highlights.
- **Capability Profile:** Core skills, domain exposure, certifications, notable project indicators.
- **Risk & Flags:** Gaps, instability signals, relocation/visa constraints (if known and lawful).
- **Engagement Intel:** Prior outreach history, response behavior, preferred channel/time.
- **Evidence Annex:** Source citations and confidence level for each major claim.

### F) Compliance Defaults
- Approved acquisition channels only.
- No unauthorized scraping/automation that violates platform terms.
- Store only job-relevant fields.
- Retention + deletion workflow enabled from day one.

## 5) Execution Plan (30 Days)

### Week 1 — Foundation
- Finalize role intake form.
- Implement database schema + basic role management.
- Confirm source/legal guardrails.

### Week 2 — Data Pipeline
- Connect first approved sources.
- Build profile normalization for title history, skills, years, location.

### Week 3 — Ranking + Review
- Implement scoring engine and threshold routing.
- Build shortlist/review dashboard.
- Build candidate dossier renderer (web + exportable PDF).

### Week 4 — Outreach + Measurement
- Log outreach events and responses.
- Publish KPI dashboard and baseline performance report.

## 6) Success Criteria (First 60 Days)

Track and report weekly:
- Time-to-first-qualified-slate
- Outreach response rate
- Interview conversion rate
- Offer acceptance rate
- Cost per hire vs historical recruiter/agency baseline

## 7) Risks and Mitigations

1. **Data quality inconsistency**  
   Mitigation: normalization rules + manual override in review stage.

2. **False positives in ranking**  
   Mitigation: human shortlist approval + threshold tuning every 2 weeks.

3. **Compliance/privacy drift**  
   Mitigation: provenance logging, retention windows, deletion requests workflow.

4. **Low response rates initially**  
   Mitigation: messaging variants + source-level performance tracking.

## 8) Approval Block

**Decision:** Approve / Reject / Revise  
**Approved Budget Envelope (MVP):** __________________  
**Go-Live Target Date:** __________________  
**Decision Maker Signature:** __________________

---

If approved, next deliverables will be:
1. SQL schema (DDL),
2. API contract spec,
3. sprint-ready implementation tickets.
