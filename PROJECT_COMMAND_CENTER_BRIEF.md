# Project Command Center — Product & Technical Brief

## Purpose
Build a dark-theme, executive-style **Project Command Center** web app that combines:
- Business Development (BD) calendar planning,
- Marketing/Events tracking,
- Social media scheduling visibility,
- Cross-source reporting/export,
- Workbook-driven operations (Excel as operational source of truth).

This brief is designed so development can restart cleanly in a new repository/feed.

---

## Product Vision
A single operational interface where BD, marketing events, and social efforts are visible in one place, with:
- **Calendar-first planning** for day-to-day execution,
- **Source-aware overlays** (BD vs Social),
- **Structured events view** for marketing operations,
- **Actionable details panel** for any selected item,
- **Report generation** from combined datasets.

---

## Core UX Requirements

### 1) Global Layout & Theme
- Dark, Apple-inspired visual design.
- Left sidebar for navigation + data source controls.
- Main area with:
  - BD Calendar tab,
  - Events tab,
  - Reports tab.
- Floating bottom-right calendar-source legend in BD calendar mode.

### 2) Business Development Calendar (Primary View)
- Monthly calendar grid with entries as pill chips.
- Calendar entries from:
  - BD workbook data,
  - Social media workbook data (when enabled).
- Source toggle legend:
  - `BD Calendar` checkbox,
  - `Social Media Calendar` checkbox.
- Social entries must render in a distinct **lilac** style.

### 3) Social Media Calendar Integration
Source file expectations:
- File: `Social Media Calendar.xlsx`
- Sheet: `Social Media Calendar`

Behavior:
- On load, social rows are appended into BD monthly calendar dates.
- Calendar chip label = value from **Subject** column.
- Clicking social chip opens right-side details panel.

Social details panel fields:
- Date
- Subject
- Project
- Caption
- Media Type
- Post Link (must be a live clickable URL)

### 4) Marketing Events View
Source file expectations:
- File: `Marketing Events.xlsx`
- Sheet: `2026`

Events table columns (strict order):
1. Date
2. Event
3. Category
4. Duration (days)
5. Client or Sponsor
6. Notes
7. Website

Rules:
- **Website** column renders live links when URL exists.
- `TBD` dates go to **Undetermined Dates** bucket.
- **Past Events** = dates in current year prior to today (e.g., 2026 before today).
- Dates from prior year (e.g., 2025) should appear in **Upcoming Events** as placeholder references, with `*` marker and explanatory note.
- Events table rows should be clickable and open a right-side details panel.

Events details panel fields:
- Date
- Event
- Category
- Duration (days)
- Client or Sponsor
- Notes
- Website (live link)

### 5) Reports
- Report generation should support dataset combinations:
  - BD Calendar,
  - Events,
  - Both.
- Output windows include rolling time-range behavior and custom date range options.
- Exclusion logic and dedupe/consolidation logic should be preserved as configurable report rules.
- Links in report content should be rendered in blue and clickable where supported.

---

## Data Source Model

### Live Data Sources in Sidebar
Each source should support:
- URL import,
- File upload fallback.

Sources:
- BD Workbook
- Events Workbook
- Goal Checks Workbook
- Social Media Calendar Workbook

Status messaging should clearly report:
- Source loaded,
- Sheet selected,
- Parsed row count,
- Any parse/load error reason.

---

## Parsing & Normalization Requirements

### Normalized internal shapes
Use explicit normalized schemas to avoid header drift.

#### BD row
- Date, Task, Account / Notes, Category, Owner, Client Contact, Location, Client, Sub-Client, Status, Meeting Notes, Action, Sub Action, Project Name.

#### Social row (calendar-compatible)
- Date
- Task (from Subject)
- Subject
- Caption
- Media Type
- Project Name
- Post Link
- `_social: true`

#### Events row
- Dates Confirmed (or Date display field)
- Event
- Category
- Duration (days)
- Client or Sponsor
- Notes
- Website

### Parsing priorities
- Robust header-row detection.
- Fallback support for column-position sheets.
- Date parsing for:
  - ISO strings,
  - slash-formatted strings,
  - Excel serial dates.
- De-duplication logic for imported social/calendar rows where appropriate.

---

## Interaction Model

### Calendar interactions
- Click chip => open details side panel.
- Side panel supports read mode + edit mode where appropriate.
- Delete operation removes selected record(s) safely.

### Events interactions
- Bucket tabs:
  - Upcoming
  - Undetermined
  - Past
- Click row => open details side panel.

---

## Visual Design Requirements
- Dark background with subtle contrast layers.
- Rounded cards, soft borders.
- BD chips in blue family.
- Social chips in lilac/purple family.
- Floating source legend at bottom-right in calendar mode.
- Responsive fallback for smaller screens (floating elements become static where needed).

---

## Technical Architecture (Recommended for new repository)

### Frontend
- Vanilla JS + HTML/CSS (or migrate to React/Vue if preferred).
- Keep parsing/rendering logic modular:
  - `parsers/`
  - `normalizers/`
  - `renderers/`
  - `state/`

### Suggested file layout
```text
src/
  app/
    state.js
    constants.js
  data/
    parseBd.js
    parseEvents.js
    parseSocial.js
    normalize.js
  views/
    bdCalendarView.js
    eventsView.js
    detailPanel.js
    reportsView.js
  ui/
    sidebar.js
    sourceLegend.js
  utils/
    dates.js
    links.js
index.html
styles.css
```

### Validation strategy
- Add parser unit tests with fixture workbooks (or JSON fixture rows).
- Add UI smoke tests for:
  - social chip rendering,
  - events bucket classification,
  - side panel opening,
  - link rendering.

---

## Acceptance Checklist

### BD + Social
- [ ] Social workbook loads from `Social Media Calendar` sheet.
- [ ] Social entries appear as lilac pills on matching calendar dates.
- [ ] Social chip text equals Subject.
- [ ] Clicking social chip opens details with Date/Subject/Project/Caption/Media Type/Post Link.
- [ ] Post Link is clickable.

### Events
- [ ] Marketing Events workbook loads from `2026` sheet.
- [ ] Table columns match required order and names.
- [ ] Website links are clickable.
- [ ] 2025 dates are in Upcoming with `*` note.
- [ ] Past includes only current-year prior dates.
- [ ] TBD rows go to Undetermined.
- [ ] Clicking events row opens side details panel.

### Layout
- [ ] Floating bottom-right source legend in calendar mode.
- [ ] Calendar + details panel behavior matches provided mockups.
- [ ] Dark UI consistency retained.

---

## Repository Handoff Notes
When starting in a new repository/feed, begin with:
1. Data contracts (row schemas) and parser tests,
2. Calendar/events renderers with mock data,
3. Workbook loaders + status messaging,
4. Detail panel wiring,
5. Reports integration.

This avoids regressions caused by interleaving parsing and styling changes too early.
