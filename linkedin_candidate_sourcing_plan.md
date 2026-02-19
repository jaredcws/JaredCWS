# LinkedIn Candidate Sourcing Program (Recruiter-Grade Blueprint)

Yes—this is feasible, and the most effective approach is to model your system after the tools strong corporate recruiting teams already use, while staying compliant.

## 1) What top corporate recruiters actually use (and why)

Recruiters rarely use one tool. They use a **stack** with distinct jobs:

1. **LinkedIn Recruiter / Recruiter Lite (primary sourcing surface)**
   - Advanced filters: title, skills, years in role, geography, company, seniority.
   - Saved searches + alerts for newly matching candidates.
   - InMail and project folders/pipelines.

2. **ATS (Applicant Tracking System)** (Greenhouse, Lever, Workday, etc.)
   - Job requisition control, interview workflow, and compliance records.
   - Candidate stage tracking and reporting.

3. **Talent CRM / sourcing workspace** (often built into ATS or separate)
   - Talent pools, nurture campaigns, and rediscovery of prior candidates.
   - Historical engagement context.

4. **Contact and enrichment tools** (ZoomInfo, Clearbit, Apollo, etc.)
   - Work email/firmographic enrichment.
   - Data refresh for stale profiles.

5. **Outbound sequencing + personalization tools**
   - Multi-step outreach (email/InMail), messaging templates, A/B tests.
   - Response tracking and follow-up automation.

6. **Analytics / labor market intelligence**
   - Funnel conversion by role, source quality, and time-to-fill.
   - Geo compensation/talent density benchmarks.

## 2) Capabilities to copy into your internal system

Design your program around these recruiter-grade capabilities:

- **Boolean + semantic search** for skill and experience matching.
- **Weighted fit scoring** with transparent reasons per candidate.
- **Saved search + alerts** for newly qualified profiles.
- **Pipeline states** (`new`, `review`, `shortlist`, `contacted`, `responded`, `interview`, `closed`).
- **Outreach assist** (personalized first message + follow-up reminders).
- **Candidate intelligence dossier** (structured one-page report per candidate).
- **Deduplication + identity resolution** across sources.
- **Audit/compliance controls** (source provenance, retention, deletion).
- **Feedback loop** that tunes scoring from outcomes.

## 3) Turn your initial request into an implementation spec

Below is the upgraded version of your request, ready for engineering:

> Build an internal candidate discovery and outreach system that identifies candidates by:
> - required skills and domain background,
> - minimum years of relevant experience,
> - location/time-zone constraints,
> and ranks them for outreach using an explainable score.
>
> System requirements:
> 1. ingest candidates from approved/contracted sources (including LinkedIn-approved channels),
> 2. normalize profile data into a standard schema,
> 3. score and rank candidates with transparent sub-scores,
> 4. allow recruiter/hiring-manager review and shortlist approval,
> 5. generate an individual candidate dossier report with fit summary, risk flags, and source evidence,
> 6. generate personalized outreach drafts and track outcomes,
> 7. report source quality, response rate, interview conversion, and cost per hire,
> 8. enforce legal/privacy controls (data minimization, retention limits, delete-on-request).

## 4) Candidate scoring model (v1)

### 4.1 Core score

`overall_score = 0.35*skill_fit + 0.25*experience_fit + 0.20*location_fit + 0.10*seniority_fit + 0.10*signal_fit`

### 4.2 Sub-score definitions

- `skill_fit` (0–100)
  - Hard requirement match (must-have skills)
  - Related skill similarity (semantic/ontology expansion)
- `experience_fit` (0–100)
  - Years in relevant functions (not total career years)
  - Role recency weighting (recent roles count more)
- `location_fit` (0–100)
  - Same metro/country/time-zone preferred
  - Remote overlap logic
- `seniority_fit` (0–100)
  - IC vs manager vs director alignment
- `signal_fit` (0–100)
  - Industry/domain relevance, tenure stability, notable projects/certs

### 4.3 Routing thresholds

- `>= 80`: High-priority outreach queue
- `65–79`: Recruiter review queue
- `< 65`: Keep warm / monitor via alerts

## 5) Data model you should start with

Minimum entities:

- `roles` (hiring requirements)
- `candidates` (canonical person profile)
- `candidate_experiences` (title/company/date ranges)
- `candidate_skills` (skill + confidence)
- `candidate_locations` (raw + normalized)
- `candidate_scores` (overall + component scores + timestamp)
- `candidate_reports` (rendered summary, report version, generated timestamp)
- `outreach_events` (channel, template, send time, response)
- `pipeline_events` (status transitions)
- `sources` (provenance + compliance metadata)

## 6) Candidate report format (FBI/CIA-style layout for hiring)

Use an intelligence brief visual model: concise, structured, evidence-backed.

Sections for each candidate:

1. **Cover Block**
   - Candidate name, current role/company, geo, report ID, generated date.
2. **Executive Assessment**
   - 3–6 bullet recommendation: `Pursue`, `Review`, or `Hold` with rationale.
3. **Fit Scoreboard**
   - Overall score and component bars (`skill_fit`, `experience_fit`, `location_fit`, `seniority_fit`, `signal_fit`).
4. **Timeline of Service**
   - Career chronology with tenure lengths and notable progression.
5. **Capability & Domain Profile**
   - Top skills, domain experience, certifications, and leadership indicators.
6. **Risk/Constraint Flags**
   - Missing must-have skills, possible instability, location mismatch, compensation/level mismatch.
7. **Engagement Intelligence**
   - Prior outreach attempts, response history, preferred channel/time if known.
8. **Evidence & Confidence Annex**
   - Source-attributed claims with confidence scores and last-updated timestamps.

## 7) Workflow that mirrors strong recruiter teams

1. Hiring manager defines role card (must-haves, nice-to-haves, geo constraints).
2. System runs saved searches and imports newly matched candidates.
3. Scoring engine ranks candidates and explains “why this person”.
4. System generates candidate dossier for review packet.
5. Human reviewer approves shortlist.
6. Outreach sequence launches (personalized message variants).
7. Replies/interviews feed back into scoring weights.

## 8) Compliance guardrails (non-negotiable)

- Use only approved data acquisition channels and contractual data rights.
- Do not use unauthorized scraping/automation that violates platform terms.
- Keep only job-relevant data; apply retention windows.
- Maintain deletion workflows and access audit logs.
- Run legal/privacy review before production rollout.

## 9) 30-day MVP plan

### Week 1: Requirements + schema
- Lock role intake template and scoring rubric.
- Implement database schema and role definition UI.

### Week 2: Ingestion + normalization
- Connect approved sources.
- Build parsers for title history, skills, years, and location normalization.

### Week 3: Ranking + review
- Ship scoring API and shortlist dashboard.
- Add saved search alerts and pipeline states.
- Add dossier rendering endpoint (`GET /candidates/{id}/report`) and PDF export.

### Week 4: Outreach + analytics
- Add personalized outreach drafting and tracking.
- Launch dashboards for response rate, interview conversion, and time-to-slate.

## 10) KPIs to validate this beats agency spend

- Time-to-first-qualified-slate
- Outreach response rate (by source and template)
- Interview conversion rate (screen → onsite)
- Offer acceptance rate
- Cost per hire vs prior recruiter/agency baseline

---

If useful, next I can produce:
1. a concrete SQL schema,
2. a JSON scoring config you can tune without code changes,
3. and an MVP API contract (`/roles`, `/candidates/search`, `/scores`, `/candidates/{id}/report`, `/outreach`).
