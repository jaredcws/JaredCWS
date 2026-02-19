# Sprint 1 Tickets (Start Immediately)

## A. Platform Setup
1. **Create Postgres migration framework**
   - Deliverable: migration runner + baseline migration.
2. **Implement MVP schema**
   - Deliverable: all tables/indexes from `candidate_sourcing_schema.sql`.

## B. Role + Candidate APIs
3. **Implement POST /roles**
   - Deliverable: request validation + DB insert + tests.
4. **Implement GET /candidates/search**
   - Deliverable: role-based filtering, pagination, min_score filter.
5. **Implement GET /scores/{candidate_id}**
   - Deliverable: score breakdown response + explanation payload.

## C. Dossier Report (Requested Feature)
6. **Implement GET /candidates/{candidate_id}/report (JSON)**
   - Deliverable: sectioned dossier payload (header, executive summary, fit matrix, timeline, risk, evidence).
7. **Implement report export (PDF)**
   - Deliverable: template-based PDF from report payload.

## D. Outreach + Pipeline
8. **Implement POST /outreach**
   - Deliverable: outreach event logging + stage transition to `contacted`.
9. **Pipeline event tracking hooks**
   - Deliverable: log status transitions for all candidate stage changes.

## E. QA + Observability
10. **API integration test pack**
    - Deliverable: happy path + validation + not-found tests for all endpoints.
11. **Audit/compliance checks**
    - Deliverable: provenance field validation and retention date presence for sourced records.
12. **Metrics dashboard seed queries**
    - Deliverable: SQL views for response rate, interview conversion, and time-to-slate.

## Definition of Done (Sprint 1)
- Endpoints functional in staging.
- Dossier JSON endpoint complete; PDF export available behind feature flag.
- Migration is repeatable and rollback-safe.
- Basic KPI queries return expected output.
