const REQUIRED_FIELDS = ["Date","Task","Account / Notes","Category","Owner","Client Contact","Location","Client","Sub-Client","Status","Meeting Notes","Action","Sub Action","Project Name"];
const DETAIL_FIELDS = ["Date","Task","Client","Sub-Client","Status","Owner","Category","Project Name","Location","Client Contact","Account / Notes","Meeting Notes","Action","Sub Action","Post Link"];
const THEME_STORAGE_KEY = "command-center-theme";
const THEMES = { DARK: "dark", LIGHT: "light" };
const state = {
  sheets: {}, bdSheet: "", bdRows: [], g2Rows: [], selectedSheet: "",
  selectedId: null, selectedGroupIds: [], detailEditMode: false, activeView: "business-development", clientsExpanded: false, renderRows: [],
  g2Loaded: false, activeBdTab: "calendar", eventColumns: [], eventHeaderRow: null, eventsBucket: "upcoming",
  goalCheckRows: [], goalCheckLoaded: false, g2SheetTable: [], socialRows: [], socialLoaded: false, proposalRows: [], proposalLoaded: false, showBdCalendar: true, showSocialCalendar: true, defaultLogoDataUrl: "", reportLogoDataUrl: "", reportNotesImages: [], reportEffortsImages: [], selectedProposalId: null
  goalCheckRows: [], goalCheckLoaded: false, g2SheetTable: [], socialRows: [], socialLoaded: false, showBdCalendar: true, showSocialCalendar: true, defaultLogoDataUrl: "", reportLogoDataUrl: ""
};

const seedBdRows = [
  {id:"BD-101",Date:"2026-02-15",Task:"Discovery Call","Account / Notes":"Retail expansion",Category:"Prospecting",Owner:"Jared","Client Contact":"Taylor Kim",Location:"Zoom",Client:"Northwind","Sub-Client":"Northwind Labs",Status:"Planned","Meeting Notes":"Decision makers identified",Action:"Meet","Sub Action":"Initial","Project Name":"Q2 Expansion"}
];

const el = {
  nav: document.querySelectorAll(".nav-links button[data-view]"), themeToggle: document.getElementById("theme-toggle"),
  projectsView: document.getElementById("projects-view"), bdView: document.getElementById("bd-view"), proposalsView: document.getElementById("proposals-view"), reportsView: document.getElementById("reports-view"), sheetView: document.getElementById("sheet-view"),
  sourcePanel: document.getElementById("source-panel"), addPanel: document.getElementById("bd-event-panel"), sheetsPanel: document.getElementById("sheet-list-panel"),
  bdUrlInput: document.getElementById("bd-url-input"), g2UrlInput: document.getElementById("events-url-input"), goalsUrlInput: document.getElementById("goals-url-input"), socialUrlInput: document.getElementById("social-url-input"),
  loadBdUrl: document.getElementById("load-bd-url"), loadG2Url: document.getElementById("load-events-url"), loadGoalsUrl: document.getElementById("load-goals-url"), loadSocialUrl: document.getElementById("load-social-url"),
  bdFileInput: document.getElementById("workbook-input"), g2FileInput: document.getElementById("events-workbook-input"), goalsFileInput: document.getElementById("goals-workbook-input"), socialFileInput: document.getElementById("social-workbook-input"), proposalFileInput: document.getElementById("proposal-workbook-input"), workbookStatus: document.getElementById("workbook-status"),
  nav: document.querySelectorAll(".nav-links button[data-view]"),
  projectsView: document.getElementById("projects-view"), bdView: document.getElementById("bd-view"), reportsView: document.getElementById("reports-view"), sheetView: document.getElementById("sheet-view"),
  sourcePanel: document.getElementById("source-panel"), addPanel: document.getElementById("bd-event-panel"), sheetsPanel: document.getElementById("sheet-list-panel"),
  bdUrlInput: document.getElementById("bd-url-input"), g2UrlInput: document.getElementById("events-url-input"), goalsUrlInput: document.getElementById("goals-url-input"), socialUrlInput: document.getElementById("social-url-input"),
  loadBdUrl: document.getElementById("load-bd-url"), loadG2Url: document.getElementById("load-events-url"), loadGoalsUrl: document.getElementById("load-goals-url"), loadSocialUrl: document.getElementById("load-social-url"),
  bdFileInput: document.getElementById("workbook-input"), g2FileInput: document.getElementById("events-workbook-input"), goalsFileInput: document.getElementById("goals-workbook-input"), socialFileInput: document.getElementById("social-workbook-input"), workbookStatus: document.getElementById("workbook-status"),
  tabBd: document.getElementById("bd-tab-calendar"), tabEvents: document.getElementById("bd-tab-events"), monthControls: document.getElementById("month-controls"), bdTitle: document.getElementById("bd-title"), calendarHeading: document.getElementById("calendar-heading"),
  prevMonth: document.getElementById("prev-month"), nextMonth: document.getElementById("next-month"), calMonth: document.getElementById("calendar-month"), calYear: document.getElementById("calendar-year"),
  statusLabel: document.getElementById("status-label"), ownerLabel: document.getElementById("owner-label"), categoryLabel: document.getElementById("category-label"), searchLabel: document.getElementById("search-label"),
  status: document.getElementById("status-filter"), owner: document.getElementById("owner-filter"), category: document.getElementById("category-filter"), search: document.getElementById("search-filter"), calendarSources: document.getElementById("calendar-sources"), toggleSourceBd: document.getElementById("toggle-source-bd"), toggleSourceSocial: document.getElementById("toggle-source-social"),
  weekdays: document.getElementById("calendar-weekdays"), monthlyGrid: document.getElementById("monthly-calendar"), visible: document.getElementById("visible-count"),
  bdLayout: document.getElementById("bd-layout"), detailPanel: document.getElementById("event-detail-panel"), selectedId: document.getElementById("selected-id"), selectedEffort: document.getElementById("selected-effort"), editSelected: document.getElementById("edit-selected"), closeDetails: document.getElementById("close-details"),
  newDate: document.getElementById("new-date"), newTask: document.getElementById("new-task"), newAccountNotes: document.getElementById("new-account-notes"), newCategory: document.getElementById("new-category"), newOwner: document.getElementById("new-owner"), newClientContact: document.getElementById("new-client-contact"), newLocation: document.getElementById("new-location"), newClient: document.getElementById("new-client"), newSubClient: document.getElementById("new-sub-client"), newStatus: document.getElementById("new-status"), newMeetingNotes: document.getElementById("new-meeting-notes"), newAction: document.getElementById("new-action"), newSubAction: document.getElementById("new-sub-action"), newProjectName: document.getElementById("new-project-name"), saveEvent: document.getElementById("save-event"),
  sheetCalendar: document.getElementById("sheet-calendar"), sheetG2: document.getElementById("sheet-g2"), toggleClients: document.getElementById("toggle-clients"), clientSheetList: document.getElementById("client-sheet-list"),
  sheetTitle: document.getElementById("sheet-title"), sheetTable: document.getElementById("sheet-table"),
  reportDataset: document.getElementById("report-dataset"), reportDsBd: document.getElementById("report-ds-bd"), reportDsEvents: document.getElementById("report-ds-events"), reportDsSocial: document.getElementById("report-ds-social"), reportDsProposals: document.getElementById("report-ds-proposals"), reportFrom: document.getElementById("report-from"), reportTo: document.getElementById("report-to"), reportCenter: document.getElementById("report-center"), reportRolling: document.getElementById("report-rolling"), reportCustom: document.getElementById("report-custom"), reportIncludeGoals: document.getElementById("report-include-goals"), reportCenterRow: document.getElementById("report-center-row"), reportCustomRow: document.getElementById("report-custom-row"), reportDetails: document.getElementById("report-details"), reportNotes: document.getElementById("report-notes"), reportNotesImages: document.getElementById("report-notes-images"), reportNotesImagesStatus: document.getElementById("report-notes-images-status"), reportEfforts: document.getElementById("report-efforts"), reportEffortsImages: document.getElementById("report-efforts-images"), reportEffortsImagesStatus: document.getElementById("report-efforts-images-status"), reportLogoInput: document.getElementById("report-logo-input"), generateReport: document.getElementById("generate-report"), reportStatus: document.getElementById("report-status"), proposalTeamList: document.getElementById("proposal-team-list"), proposalContentList: document.getElementById("proposal-content-list"), proposalCompleteList: document.getElementById("proposal-complete-list"), proposalCountTeam: document.getElementById("proposal-count-team"), proposalCountContent: document.getElementById("proposal-count-content"), proposalCountComplete: document.getElementById("proposal-count-complete"), proposalDetailPanel: document.getElementById("proposal-detail-panel"), proposalDetailContent: document.getElementById("proposal-detail-content"), proposalLayout: document.getElementById("proposal-layout"), proposalCompleteSearch: document.getElementById("proposal-complete-search"), proposalCloseDetails: document.getElementById("proposal-close-details"), proposalSelectedId: document.getElementById("proposal-selected-id")
  reportDataset: document.getElementById("report-dataset"), reportFrom: document.getElementById("report-from"), reportTo: document.getElementById("report-to"), reportCenter: document.getElementById("report-center"), reportRolling: document.getElementById("report-rolling"), reportCustom: document.getElementById("report-custom"), reportIncludeGoals: document.getElementById("report-include-goals"), reportCenterRow: document.getElementById("report-center-row"), reportCustomRow: document.getElementById("report-custom-row"), reportDetails: document.getElementById("report-details"), reportLogoInput: document.getElementById("report-logo-input"), generateReport: document.getElementById("generate-report"), reportStatus: document.getElementById("report-status")
};

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const uid = (prefix="BD") => `${prefix}-${Math.floor(Math.random()*90000)+10000}`;
const iso = (y,m,d) => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
const REPORT_LOGO_WINDOWS_PATH = 'C\\LocalStorage\\Codex Programs\\codex-programs\\Command Center\\Live Data Sources\\Modus_Logo_6in.png';
const REPORT_LOGO_FILE_URL = 'file:///C:/LocalStorage/Codex%20Programs/codex-programs/Command%20Center/Live%20Data%20Sources/Modus_Logo_6in.png';
const REPORT_LOGO_WIDTH = 86;
const REPORT_LOGO_HEIGHT = REPORT_LOGO_WIDTH * (312 / 1798);
const DEFAULT_REPORT_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="180" viewBox="0 0 600 180"><rect width="600" height="180" fill="#ffffff"/><g font-family="Arial, Helvetica, sans-serif" font-size="84" font-weight="700" letter-spacing="16"><text x="8" y="78" fill="#A9ABB1">MODUS</text><text x="8" y="162" fill="#AABA5A">MODUS</text></g></svg>`;

function parseDate(v){
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
  if (typeof v === "number") { const p = XLSX.SSF.parse_date_code(v); return p ? new Date(p.y, p.m - 1, p.d) : null; }
  if (typeof v === "string") { const d = new Date(v); return Number.isNaN(d.getTime()) ? null : d; }
  return null;
}

const norm = (v) => String(v || '').toLowerCase().replace(/[^a-z0-9]/g, '');
function findEventColumn(kind){
  const cols = state.eventColumns || [];
  const checks = {
    date: ['datesconfirmed','dateconfirmed','date'],
    event: ['event'],
    category: ['category'],
    sponsor: ['clientorsponsor','sponsor','clientsponsor'],
    duration: ['durationdays','durationday','duration'],
    notes: ['notes','meetingnotes'],
    site: ['site','website']
  }[kind] || [kind];
  return cols.find((c)=>checks.includes(norm(c))) || checks.map((c)=>cols.find((v)=>norm(v).includes(c))).find(Boolean) || '';
}

function parseEventsSheetRows(ws){
  const headerCandidates = [0, 3];
  let best = { score: -1, row: 0, rows: [], cols: [] };
  headerCandidates.forEach((headerRow)=>{
    const rows = XLSX.utils.sheet_to_json(ws, { range: headerRow, defval: "" });
    const cols = rows.length ? Object.keys(rows[0]) : [];
    const colSet = new Set(cols.map(norm));
    const score = ['datesconfirmed','event','category','site'].reduce((acc, key)=>acc + (colSet.has(key) ? 1 : 0), 0);
    if (score > best.score || (score === best.score && rows.length > best.rows.length)) {
      best = { score, row: headerRow, rows, cols };
    }
  });
  if (!best.rows.length) {
    const rows = XLSX.utils.sheet_to_json(ws, { range: 0, defval: "" });
    best = { score: 0, row: 0, rows, cols: rows.length ? Object.keys(rows[0]) : [] };
  }
  return best;
}
function firstMatchingColumn(row, checks){
  const keys = Object.keys(row || {});
  const found = keys.find((k)=>checks.some((c)=>norm(k) === c || norm(k).includes(c)));
  return found || '';
}

function normalizeEventRow(row, index){
  const dateKey = firstMatchingColumn(row, ['datesconfirmed','dateconfirmed','dates','date']);
  const eventKey = firstMatchingColumn(row, ['event','subject','task','title']);
  const categoryKey = firstMatchingColumn(row, ['category','type']);
  const durationKey = firstMatchingColumn(row, ['durationdays','duration']);
  const sponsorKey = firstMatchingColumn(row, ['clientorsponsor','clientsponsor','sponsor','client']);
  const notesKey = firstMatchingColumn(row, ['notes','meetingnotes']);
  const siteKey = firstMatchingColumn(row, ['site','website','link','url']);

  const d = parseDate(row[dateKey]);
  return {
    id: `EV-${index + 1}`,
    'Dates Confirmed': d ? iso(d.getFullYear(), d.getMonth(), d.getDate()) : String(row[dateKey] ?? '').trim(),
    'Event': String(row[eventKey] ?? '').trim(),
    'Category': String(row[categoryKey] ?? '').trim(),
    'Duration (days)': String(row[durationKey] ?? '').trim(),
    'Client or Sponsor': String(row[sponsorKey] ?? '').trim(),
    'Notes': String(row[notesKey] ?? '').trim(),
    'Website': String(row[siteKey] ?? '').trim()
  };
}


function parseGoalCheckRows(ws){
  let best = { score: -1, rows: [], cols: [] };
  [4, 5, 6, 3].forEach((headerRow)=>{
    const rows = XLSX.utils.sheet_to_json(ws, { range: headerRow, defval: "" });
    const cols = rows.length ? Object.keys(rows[0]) : [];
    const colSet = new Set(cols.map(norm));
    const score = ['goal', 'extrapolatedtoyear'].reduce((acc, key)=>acc + (Array.from(colSet).some((c)=>c.includes(key)) ? 1 : 0), 0);
    if (score > best.score || (score === best.score && rows.length > best.rows.length)) {
      best = { score, rows, cols };
    }
  });

  const rows = best.rows;
  const goalCol = best.cols.find((c)=>norm(c) === 'goal' || norm(c).includes('goal')) || 'Goal';
  const percentCol = best.cols.find((c)=>norm(c).includes('extrapolatedtoyear') || norm(c).includes('percent')) || '% Extrapolated to year';

  return rows
    .map((row)=>({ goal: String(row[goalCol] ?? '').trim(), percent: String(row[percentCol] ?? '').trim() }))
    .filter((row)=>row.goal || row.percent);
}
function fillSelect(select, vals){ select.innerHTML = `<option value="All">All</option>${[...new Set(vals.filter(Boolean))].map(v=>`<option value="${v}">${v}</option>`).join("")}`; }
function normalizeRow(row, prefix){
  const out = { id: row.id || uid(prefix) };
  REQUIRED_FIELDS.forEach((f)=>{
    const raw = row[f] ?? row[Object.keys(row).find(k=>k.toLowerCase().replace(/[^a-z0-9]/g,"")===f.toLowerCase().replace(/[^a-z0-9]/g,""))] ?? "";
    const d = f === "Date" ? parseDate(raw) : null;
    out[f] = f === "Date" ? (d ? iso(d.getFullYear(), d.getMonth(), d.getDate()) : "") : String(raw ?? "").trim();
  });
  return out;
}

function formatDateMMDDYY(value){
  const d = parseDate(value);
  if (!d) return String(value || '');
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

function getSecondTuesday(date = new Date()){
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  const day = d.getDay();
  const firstTuesdayOffset = (2 - day + 7) % 7;
  d.setDate(1 + firstTuesdayOffset + 7);
  d.setHours(0, 0, 0, 0);
  return d;
}


function parsePercentNumber(value){
  const raw = String(value ?? '').replace(/%/g, '').replace(/,/g, '').trim();
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}

async function getDefaultReportLogoDataUrl(){
  if (state.defaultLogoDataUrl) return state.defaultLogoDataUrl;

  const blobToDataUrl = (blob)=>new Promise((resolve, reject)=>{
    const fr = new FileReader();
    fr.onload = ()=>resolve(String(fr.result || ''));
    fr.onerror = reject;
    fr.readAsDataURL(blob);
  });

  try {
    const res = await fetch(REPORT_LOGO_FILE_URL, { method: 'GET', mode: 'cors' });
    if (res.ok) {
      const blob = await res.blob();
      const dataUrl = await blobToDataUrl(blob);
      if (dataUrl) {
        state.defaultLogoDataUrl = dataUrl;
        return state.defaultLogoDataUrl;
      }
    }
  } catch (_err) {
    // Browser security may block file:// reads; fallback below.
  }

  const blob = new Blob([DEFAULT_REPORT_LOGO_SVG], { type: 'image/svg+xml;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  try {
    const img = await new Promise((resolve, reject)=>{
      const elImg = new Image();
      elImg.onload = ()=>resolve(elImg);
      elImg.onerror = reject;
      elImg.src = blobUrl;
    });
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    state.defaultLogoDataUrl = canvas.toDataURL('image/png');
    return state.defaultLogoDataUrl;
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}


function findSheetNameByNorm(sheetNames, targetNorm){
  return (sheetNames || []).find((n)=>norm(n) === targetNorm) || '';
}

function parseG2SheetTable(ws){
  return XLSX.utils.sheet_to_json(ws, { header: 1, range: 'A1:P7', defval: '' })
    .map((row)=>Array.from({ length: 16 }, (_, i)=>String(row[i] ?? '').trim()));
}


function parseSocialSheetRows(ws){
  const rowsFromHeaderCandidates = [];
  let best = { score: -1, rows: [], cols: [] };

  [0, 1, 2, 3, 4, 5].forEach((headerRow)=>{
    const rows = XLSX.utils.sheet_to_json(ws, { range: headerRow, defval: "" });
    const cols = rows.length ? Object.keys(rows[0]) : [];
    const colSet = new Set(cols.map(norm));
    const score = ['date', 'subject', 'postlink', 'caption', 'mediatype'].reduce((acc, key)=>acc + (Array.from(colSet).some((c)=>c.includes(key)) ? 1 : 0), 0);
    if (score > best.score || (score === best.score && rows.length > best.rows.length)) {
      best = { score, rows, cols };
    }
  });

  const dateCol = best.cols.find((c)=>['date','startdate','publishdate','postdate'].some((k)=>norm(c).includes(k))) || '';
  const subjectCol = best.cols.find((c)=>['subject','title','task','summary'].some((k)=>norm(c).includes(k))) || '';
  const postLinkCol = best.cols.find((c)=>['postlink','link','url','website'].some((k)=>norm(c).includes(k))) || '';
  const captionCol = best.cols.find((c)=>['caption','notes','copy','description'].some((k)=>norm(c).includes(k))) || '';
  const mediaTypeCol = best.cols.find((c)=>['mediatype','type','channel','platform'].some((k)=>norm(c).includes(k))) || '';
  const projectCol = best.cols.find((c)=>['project','campaign'].some((k)=>norm(c).includes(k))) || '';

  best.rows.forEach((row)=>{
    rowsFromHeaderCandidates.push({
      dateRaw: row[dateCol] ?? row.Date ?? row.date ?? '',
      subjectRaw: row[subjectCol] ?? row.Subject ?? row.subject ?? row.Title ?? '',
      postLinkRaw: row[postLinkCol] ?? row['Post Link'] ?? row.Link ?? row.URL ?? '',
      captionRaw: row[captionCol] ?? row.Caption ?? row['Account / Notes'] ?? row.Notes ?? '',
      mediaTypeRaw: row[mediaTypeCol] ?? row['Media Type'] ?? row.Type ?? '',
      projectRaw: row[projectCol] ?? row.Project ?? row['Project Name'] ?? ''
    });
  });

  const matrix = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  matrix.forEach((row)=>{
    rowsFromHeaderCandidates.push({
      dateRaw: row[0] ?? '',
      subjectRaw: row[1] ?? '',
      postLinkRaw: row[2] ?? '',
      captionRaw: row[3] ?? '',
      mediaTypeRaw: row[4] ?? '',
      projectRaw: row[5] ?? ''
    });
  });

  const out = [];
  const dedupe = new Set();
  rowsFromHeaderCandidates.forEach((raw)=>{
    const subject = String(raw.subjectRaw ?? '').trim();
    const d = parseDate(raw.dateRaw);
    if (!subject || !d) return;
    const key = `${iso(d.getFullYear(), d.getMonth(), d.getDate())}|${subject.toLowerCase()}`;
    if (dedupe.has(key)) return;
    dedupe.add(key);

    out.push({
      id: `SM-${out.length + 1}`,
      Date: iso(d.getFullYear(), d.getMonth(), d.getDate()),
      Task: subject,
      Subject: subject,
      'Account / Notes': String(raw.captionRaw ?? '').trim(),
      Caption: String(raw.captionRaw ?? '').trim(),
      Category: String(raw.mediaTypeRaw ?? '').trim() || 'Social Media',
      'Media Type': String(raw.mediaTypeRaw ?? '').trim(),
      Owner: '',
      'Client Contact': '',
      Location: '',
      Client: 'Social Media',
      'Sub-Client': '',
      Status: 'Planned',
      'Meeting Notes': '',
      Action: '',
      'Sub Action': '',
      'Project Name': String(raw.projectRaw ?? '').trim() || 'Various',
      'Post Link': String(raw.postLinkRaw ?? '').trim(),
      _social: true
    });
  });

  return out;
}


function normalizeProposalPhase(value){
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return 'Team Development';
  if (raw.includes('complete') || raw.includes('submitted')) return 'Complete';
  if (raw.includes('content')) return 'Content Development';
  if (raw.includes('team')) return 'Team Development';
  return 'Team Development';
}

function proposalResultClass(result){
  const raw = String(result || '').trim().toLowerCase();
  if (raw.includes('won')) return 'won';
  if (raw.includes('lost')) return 'lost';
  if (raw.includes('short')) return 'shortlisted';
  if (raw.includes('no response')) return 'no-response';
  return '';
}

function parseProposalRows(ws){
  const matrix = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  if (!matrix.length) return [];

  let startRow = 0;
  for (let i = 0; i < Math.min(8, matrix.length); i += 1) {
    const rowNorm = matrix[i].map((c)=>norm(c));
    if (rowNorm.includes('proposalname') || rowNorm.includes('phase') || rowNorm.includes('proposaldeadline')) {
      startRow = i + 1;
      break;
    }
  }

  const rows = matrix.slice(startRow);
  const grouped = new Map();

  rows.forEach((row)=>{
    const contentDeadline = row[0] ?? '';
    const proposalDeadline = row[1] ?? '';
    const proposalName = String(row[2] ?? '').trim();
    const proposalDescription = String(row[3] ?? '').trim();
    const architect = String(row[4] ?? '').trim();
    const result = String(row[5] ?? '').trim();
    const contentLink = String(row[6] ?? '').trim();
    const phase = normalizeProposalPhase(row[7] ?? '');

    if (!proposalName) return;

    const key = proposalName.toLowerCase();
    if (!grouped.has(key)) {
      grouped.set(key, {
        id: uid('PR'),
        'Content Deadline': contentDeadline,
        'Proposal Deadline': proposalDeadline,
        'Proposal Name': proposalName,
        'Proposal Description': proposalDescription,
        Architect: architect,
        Result: result,
        'Content Link': contentLink,
        Phase: phase,
        _proposal: true,
        _resultClass: proposalResultClass(result)
      });
      return;
    }

    const current = grouped.get(key);
    const archSet = new Set(String(current.Architect || '').split('|').map((v)=>v.trim()).filter(Boolean));
    if (architect) archSet.add(architect);
    current.Architect = Array.from(archSet).join(' | ');
    if (!current['Content Deadline']) current['Content Deadline'] = contentDeadline;
    if (!current['Proposal Deadline']) current['Proposal Deadline'] = proposalDeadline;
    if (!current['Proposal Description']) current['Proposal Description'] = proposalDescription;
    if (!current.Result) current.Result = result;
    if (!current['Content Link']) current['Content Link'] = contentLink;
    current.Phase = normalizeProposalPhase(current.Phase || phase);
    current._resultClass = proposalResultClass(current.Result);
  });

  return Array.from(grouped.values());
}

function getProposalCalendarRows(){
  const rows = [];
  state.proposalRows.forEach((proposal)=>{
    const name = proposal['Proposal Name'] || 'Proposal';
    const architect = proposal.Architect || '';
    const phase = proposal.Phase || 'Team Development';
    const common = {
      Proposal: name,
      Architect: architect,
      Phase: phase,
      Result: proposal.Result || '',
      'Content Link': proposal['Content Link'] || '',
      'Proposal Description': proposal['Proposal Description'] || '',
      _proposal: true,
      _proposalId: proposal.id,
      _resultClass: proposal._resultClass || ''
    };

    const contentDate = parseDate(proposal['Content Deadline']);
    if (contentDate) {
      rows.push({
        id: `${proposal.id}-content`,
        Date: iso(contentDate.getFullYear(), contentDate.getMonth(), contentDate.getDate()),
        Task: `Proposal Content Due: ${name}`,
        Status: phase,
        Owner: architect,
        Category: 'Proposal',
        Client: 'Proposal Pipeline',
        'Project Name': name,
        'Account / Notes': proposal['Proposal Description'] || '',
        'Client Contact': architect,
        Location: 'Proposal Pipeline',
        'Meeting Notes': '',
        Action: 'Content Deadline',
        'Sub Action': '',
        'Sub-Client': '',
        ...common
      });
    }

    const submissionDate = parseDate(proposal['Proposal Deadline']);
    if (submissionDate) {
      rows.push({
        id: `${proposal.id}-submission`,
        Date: iso(submissionDate.getFullYear(), submissionDate.getMonth(), submissionDate.getDate()),
        Task: `Proposal Submission Due: ${name}`,
        Status: phase,
        Owner: architect,
        Category: 'Proposal',
        Client: 'Proposal Pipeline',
        'Project Name': name,
        'Account / Notes': proposal['Proposal Description'] || '',
        'Client Contact': architect,
        Location: 'Proposal Pipeline',
        'Meeting Notes': '',
        Action: 'Proposal Deadline',
        'Sub Action': '',
        'Sub-Client': '',
        ...common
      });
    }
  });
  return rows;
}

function getCalendarRows(){
  const rows = [];
  if (state.showBdCalendar) rows.push(...state.bdRows);
  if (state.showSocialCalendar) rows.push(...state.socialRows);
  if (state.proposalLoaded) rows.push(...getProposalCalendarRows());
  return rows;
}

function isUndeterminedDate(value){
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return true;
  if (/tbd|undetermined|unknown|n\/a/.test(raw)) return true;
  return !parseDate(value);
}

function renderEventsSections(rows){
  const dateCol = findEventColumn('date') || 'Dates Confirmed';
  const eventCol = findEventColumn('event') || 'Event';
  const categoryCol = findEventColumn('category') || 'Category';
  const durationCol = findEventColumn('duration') || 'Duration (days)';
  const sponsorCol = findEventColumn('sponsor') || 'Client or Sponsor';
  const notesCol = findEventColumn('notes') || 'Notes';
  const siteCol = findEventColumn('site') || 'Website';

  const today = new Date();
  today.setHours(0,0,0,0);
  const currentYear = today.getFullYear();
  const grouped = { upcoming: [], undetermined: [], past: [] };

  rows.forEach((r)=>{
    const rawDate = r[dateCol];
    if (isUndeterminedDate(rawDate)) { grouped.undetermined.push(r); return; }
    const d = parseDate(rawDate);
    if (!d) { grouped.undetermined.push(r); return; }
    d.setHours(0,0,0,0);

    if (d.getFullYear() < currentYear) {
      grouped.upcoming.push({ ...r, _legacyYearDate: true });
      return;
    }

    if (d.getFullYear() == currentYear && d < today) {
      grouped.past.push(r);
      return;
    }

    grouped.upcoming.push(r);
  });

  const labels = {
    upcoming: 'Upcoming Events',
    undetermined: 'Undetermined Dates',
    past: 'Past Events'
  };
  const key = labels[state.eventsBucket] ? state.eventsBucket : 'upcoming';
  const list = grouped[key];

  const controls = `
    <div class="events-bucket-controls" role="tablist" aria-label="Event date buckets">
      <button type="button" class="events-bucket-btn ${key === 'upcoming' ? 'active' : ''}" data-bucket="upcoming">Upcoming Events (${grouped.upcoming.length})</button>
      <button type="button" class="events-bucket-btn ${key === 'undetermined' ? 'active' : ''}" data-bucket="undetermined">Undetermined Dates (${grouped.undetermined.length})</button>
      <button type="button" class="events-bucket-btn ${key === 'past' ? 'active' : ''}" data-bucket="past">Past Events (${grouped.past.length})</button>
    </div>
  `;

  const note = key == 'upcoming' ? '<p class="hint events-note">* Dates shown with an asterisk are 2025 historical placeholders while 2026 dates are still being finalized.</p>' : '';
  if (!list.length) {
    return `${controls}${note}<section class="events-section"><h4>${labels[key]}</h4><p class="hint">No records.</p></section>`;
  }

  const head = '<tr><th>Date</th><th>Event</th><th>Category</th><th>Duration (days)</th><th>Client or Sponsor</th><th>Notes</th><th>Website</th></tr>';
  const body = list.map((r)=>{
    const website = String(r[siteCol] ?? '').trim();
    const hasLink = /^https?:\/\//i.test(website);
    const websiteCell = hasLink ? `<a href="${website}" target="_blank" rel="noopener noreferrer">${website}</a>` : website;
    const dateText = `${formatDateMMDDYY(r[dateCol])}${r._legacyYearDate ? ' *' : ''}`;
    return `<tr class="event-row ${state.selectedId == r.id ? 'selected' : ''}" data-id="${r.id}"><td>${dateText}</td><td>${r[eventCol] ?? ''}</td><td>${r[categoryCol] ?? ''}</td><td>${r[durationCol] ?? ''}</td><td>${r[sponsorCol] ?? ''}</td><td>${r[notesCol] ?? ''}</td><td>${websiteCell}</td></tr>`;
  }).join('');
  return `${controls}${note}<section class="events-section"><h4>${labels[key]}</h4><div class="events-table-wrap"><table>${head}${body}</table></div></section>`;
}

function getActiveRows(){ return state.activeBdTab === "events" ? state.g2Rows : state.bdRows; }

function loadSeed(){
  state.bdRows = seedBdRows.map(r=>({...r}));
  state.g2Rows = [];
  state.goalCheckRows = [];
  state.goalCheckLoaded = false;
  state.g2SheetTable = [];
  state.socialRows = [];
  state.socialLoaded = false;
  state.proposalRows = [];
  state.proposalLoaded = false;
  state.showBdCalendar = true;
  state.showSocialCalendar = true;
  state.sheets = {};
  state.g2Loaded = false;
  renderClientButtons();
}

function ingestWorkbook(buffer, label, target){
  const wb = XLSX.read(new Uint8Array(buffer), { type:"array", cellDates:true, raw:false });
  if (target === "g2") {
    const sheetName = wb.SheetNames.find((n)=>n.trim() === "2026") || "2026";
    const ws = wb.Sheets[sheetName];
    if (!ws) {
      el.workbookStatus.textContent = 'Events source must include a sheet named "2026".';
      return;
    }
    const parsed = parseEventsSheetRows(ws);
    const eventRows = parsed.rows
      .map((r, i)=>normalizeEventRow(r, i))
      .filter((r)=>Object.entries(r).some(([k,v])=>k !== 'id' && String(v || '').trim() !== ''));
    const g2ContactsSheet = findSheetNameByNorm(wb.SheetNames, 'g2contacts');
    if (g2ContactsSheet && wb.Sheets[g2ContactsSheet]) {
      state.g2SheetTable = parseG2SheetTable(wb.Sheets[g2ContactsSheet]);
    }
    state.g2Rows = eventRows;
    state.eventColumns = ['Dates Confirmed','Event','Category','Duration (days)','Client or Sponsor','Notes','Website'];
    state.eventHeaderRow = parsed.row;
    state.g2Loaded = true;
    state.selectedId = null;
    el.workbookStatus.textContent = `EVENTS loaded from ${label}. Parsed ${eventRows.length} rows from sheet 2026 (headers row ${parsed.row + 1}).`;
    renderClientButtons();
    refreshAll();
    return;
  }
  if (target === "social") {
    const socialSheetName = wb.SheetNames.find((n)=>/social\s*media\s*calendar/i.test(n)) || wb.SheetNames[0];
    const socialWs = wb.Sheets[socialSheetName];
    if (!socialWs) {
      el.workbookStatus.textContent = 'Social Calendar source sheet could not be read.';
      return;
    }
    const socialRows = parseSocialSheetRows(socialWs);
    state.socialRows = socialRows;
    state.socialLoaded = true;
    state.showSocialCalendar = true;
    state.selectedId = null;
    el.workbookStatus.textContent = `SOCIAL loaded from ${label}. Parsed ${socialRows.length} rows from sheet ${socialSheetName}.`;
    refreshAll();
    return;
  }

  if (target === "proposal") {
    const proposalSheet = wb.Sheets[wb.SheetNames[0]];
    if (!proposalSheet) {
      el.workbookStatus.textContent = 'Proposal spreadsheet could not be read.';
      return;
    }
    const proposalRows = parseProposalRows(proposalSheet);
    state.proposalRows = proposalRows;
    state.proposalLoaded = proposalRows.length > 0;
    state.selectedProposalId = proposalRows[0]?.id || null;
    el.workbookStatus.textContent = `PROPOSALS loaded from ${label}. Parsed ${proposalRows.length} proposals.`;
    refreshAll();
    return;
  }

  if (target === "goals") {
    const sheetName = wb.SheetNames.find((n)=>norm(n) === '2026progressbars');
    const ws = sheetName ? wb.Sheets[sheetName] : null;
    if (!ws) {
      el.workbookStatus.textContent = 'Goal Checks source must include a sheet named "2026 Progress bars".';
      return;
    }
    const goalRows = parseGoalCheckRows(ws);
    state.goalCheckRows = goalRows;
    state.goalCheckLoaded = true;
    el.workbookStatus.textContent = `Goal Checks loaded from ${label}. Parsed ${goalRows.length} rows from sheet ${sheetName}.`;
    return;
  }
  const sheets = {};
  wb.SheetNames.forEach((n)=>{ sheets[n] = XLSX.utils.sheet_to_json(wb.Sheets[n], { defval:"" }); });
  const detect = wb.SheetNames.find(n=>/business\s*development|bd/i.test(n)) || wb.SheetNames[0];
  const rows = (sheets[detect] || []).map((r)=>normalizeRow(r, "BD"));
  state.bdRows = rows;
  const g2ContactsSheet = findSheetNameByNorm(wb.SheetNames, 'g2contacts');
  if (g2ContactsSheet && wb.Sheets[g2ContactsSheet]) {
    state.g2SheetTable = parseG2SheetTable(wb.Sheets[g2ContactsSheet]);
  }
  state.sheets = sheets;
  state.selectedId = null;
  el.workbookStatus.textContent = `BD loaded from ${label}. Parsed ${rows.length} rows.`;
  renderClientButtons();
  refreshAll();
}

function loadFile(file, target){ const fr = new FileReader(); fr.onload = (e)=>ingestWorkbook(e.target.result, file.name, target); fr.readAsArrayBuffer(file); }

function sharepointDownloadCandidates(rawUrl){
  const seen = new Set();
  const candidates = [];
  const add = (u)=>{ if (!u || seen.has(u)) return; seen.add(u); candidates.push(u); };
  add(rawUrl);

  try {
    const parsed = new URL(rawUrl);
    if (!/sharepoint\.com$/i.test(parsed.hostname)) return candidates;

    const withDownload = new URL(parsed.toString());
    withDownload.searchParams.set('download', '1');
    add(withDownload.toString());

    const withDownloadWeb = new URL(parsed.toString());
    withDownloadWeb.searchParams.set('download', '1');
    withDownloadWeb.searchParams.set('web', '1');
    add(withDownloadWeb.toString());

    const withoutQuery = new URL(parsed.toString());
    withoutQuery.search = '';
    const withDownloadNoToken = new URL(withoutQuery.toString());
    withDownloadNoToken.searchParams.set('download', '1');
    add(withDownloadNoToken.toString());

    if (withoutQuery.pathname.includes('/:x:/')) {
      const altPath = withoutQuery.pathname.replace('/:x:/g/', '/:x:/r/');
      add(`${parsed.origin}${altPath}?download=1`);
      add(`${parsed.origin}${altPath}?download=1&web=1`);

      const layoutFromRaw = `${parsed.origin}/_layouts/15/download.aspx?share=${encodeURIComponent(parsed.toString())}`;
      const layoutFromClean = `${parsed.origin}/_layouts/15/download.aspx?share=${encodeURIComponent(withoutQuery.toString())}`;
      add(layoutFromRaw);
      add(layoutFromClean);
    }
  } catch (_err) {
    return candidates;
  }

  return candidates;
}

function isSharePointUrl(rawUrl){
  try {
    return /sharepoint\.com$/i.test(new URL(rawUrl).hostname);
  } catch (_err) {
    return false;
  }
}

function buildUrlAttempts(rawUrl){
  const direct = sharepointDownloadCandidates(rawUrl).map((u)=>({ url: u, via: 'direct' }));
  if (!isSharePointUrl(rawUrl)) return direct;

  const proxies = [];
  direct.forEach((entry)=>{
    proxies.push({ url: `https://corsproxy.io/?${encodeURIComponent(entry.url)}`, via: 'corsproxy' });
    proxies.push({ url: `https://api.allorigins.win/raw?url=${encodeURIComponent(entry.url)}`, via: 'allorigins' });
  });

  return [...direct, ...proxies];
}


async function fetchWithTimeout(url, options = {}, timeoutMs = 12000){
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err?.name === 'AbortError') throw new Error(`Timeout after ${Math.round(timeoutMs / 1000)}s`);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function loadFromUrl(url, target){
  const attempts = buildUrlAttempts(url);
  let lastError = null;
  el.workbookStatus.textContent = `Loading ${target.toUpperCase()} from URL...`;

  for (const [index, attempt] of attempts.entries()) {
    el.workbookStatus.textContent = `Loading ${target.toUpperCase()} from URL... (attempt ${index + 1}/${attempts.length})`;
    try {
      const fetchOptions = attempt.via === 'direct'
        ? { method: 'GET', mode: 'cors', credentials: 'include', redirect: 'follow' }
        : { method: 'GET', mode: 'cors', redirect: 'follow' };
      const res = await fetchWithTimeout(attempt.url, fetchOptions, 12000);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const bytes = await res.arrayBuffer();
      if (!bytes.byteLength) throw new Error('Empty file');
      ingestWorkbook(bytes, attempt.url, target);
      return;
    } catch (err) {
      lastError = err;
    }
  }

  const detail = lastError?.message || 'Failed to fetch';
  const usedProxy = attempts.some((a)=>a.via !== 'direct');
  const proxyMsg = usedProxy ? ' Also tried proxy fallbacks.' : '';
  el.workbookStatus.textContent = `Could not load ${target.toUpperCase()} URL.${proxyMsg} Each URL attempt times out automatically, so it should not stay stuck on loading. If your org blocks browser CORS/auth for this link, open the SharePoint file once in this browser (to sign in) and retry, or upload the workbook file. (${detail})`;
}

function consolidateRows(rows){
  const map = new Map();
  for (const row of rows) {
    const key = row._social ? `${row.Date}|social|${(row.Task||"").toLowerCase().trim()}` : (row._proposal ? `${row.Date}|proposal|${row._proposalId || row.id}|${row.Action || ""}` : `${row.Date}|${(row.Client || "").toLowerCase().trim()}`);
    const key = row._social ? `${row.Date}|social|${(row.Task||"").toLowerCase().trim()}` : `${row.Date}|${(row.Client || "").toLowerCase().trim()}`;
    if (!map.has(key)) {
      map.set(key, { ...row, _sourceIds: [row.id], _owners: new Set([row.Owner].filter(Boolean)), _contacts: new Set([row["Client Contact"]].filter(Boolean)) });
      continue;
    }
    const item = map.get(key);
    item._sourceIds.push(row.id);
    if (row.Owner) item._owners.add(row.Owner);
    if (row["Client Contact"]) item._contacts.add(row["Client Contact"]);
  }
  return Array.from(map.values()).map((item) => {
    item.Owner = Array.from(item._owners).join(" | ");
    item["Client Contact"] = Array.from(item._contacts).join(" | ");
    delete item._owners; delete item._contacts;
    return item;
  });
}

function filteredRows(){
  if (state.activeBdTab === "events") {
    const filtered = getActiveRows().filter((r)=>{
      const categoryCol = findEventColumn("category");
      const sponsorCol = findEventColumn("sponsor");
      const siteCol = findEventColumn("site");
      if (el.status.value !== "All" && String(r[categoryCol] || "").trim() !== el.status.value) return false;
      if (el.owner.value !== "All" && String(r[sponsorCol] || "").trim() !== el.owner.value) return false;
      if (el.category.value !== "All" && String(r[siteCol] || "").trim() !== el.category.value) return false;
      const q = el.search.value.trim().toLowerCase();
      if (q && !Object.values(r).join(' ').toLowerCase().includes(q)) return false;
      return true;
    });
    return filtered;
  }
  const m = Number(el.calMonth.value), y = Number(el.calYear.value);
  const filtered = getCalendarRows().filter((r)=>{
    const d = parseDate(r.Date); if (!d) return false;
    if (d.getMonth() !== m || d.getFullYear() !== y) return false;
    if (el.status.value !== "All" && r.Status !== el.status.value) return false;
    if (el.owner.value !== "All" && r.Owner !== el.owner.value) return false;
    if (el.category.value !== "All" && r.Category !== el.category.value) return false;
    const q = el.search.value.trim().toLowerCase();
    if (q && ![r.Task,r.Client,r["Project Name"],r["Account / Notes"],r.Owner,r["Client Contact"]].join(" ").toLowerCase().includes(q)) return false;
    return true;
  });
  return consolidateRows(filtered);
}


function hasActiveCalendarFilters(){
  if (state.activeBdTab === "events") return true;
  return el.status.value !== "All" || el.owner.value !== "All" || el.category.value !== "All" || el.search.value.trim() !== "";
}

function setCalendarColumns(rows){
  const showSat = rows.some(r=>parseDate(r.Date)?.getDay()===6);
  const showSun = rows.some(r=>parseDate(r.Date)?.getDay()===0);
  const headers = ["Mon","Tue","Wed","Thu","Fri", ...(showSat?["Sat"]:[]), ...(showSun?["Sun"]:[])];
  const cols = headers.length;
  el.weekdays.innerHTML = headers.map(h=>`<span>${h}</span>`).join("");
  el.weekdays.style.gridTemplateColumns = `repeat(${cols}, minmax(0,1fr))`;
  el.monthlyGrid.style.gridTemplateColumns = `repeat(${cols}, minmax(0,1fr))`;
  return [1,2,3,4,5, ...(showSat?[6]:[]), ...(showSun?[0]:[])];
}

function renderCalendar(){
  const rows = filteredRows();
  state.renderRows = rows;
  el.visible.textContent = String(rows.length);
  if (!rows.find(r=>r.id===state.selectedId)) { state.selectedId = null; state.selectedGroupIds = []; }

  if (state.activeBdTab === "events") {
    el.weekdays.hidden = true;
    el.weekdays.innerHTML = "";
    el.monthlyGrid.classList.remove('list-view');
    el.monthlyGrid.classList.add('events-sections-view');
    el.monthlyGrid.innerHTML = renderEventsSections(rows);
    renderDetailPanel();
    return;
  }

  const listMode = hasActiveCalendarFilters();
  if (listMode) {
    el.weekdays.hidden = true;
    el.monthlyGrid.classList.add('list-view');
    el.monthlyGrid.classList.remove('events-sections-view');
    if (!rows.length) {
      el.monthlyGrid.innerHTML = '<div class="list-empty">No matching entries for the selected filters.</div>';
      renderDetailPanel();
      return;
    }
    const sorted = [...rows].sort((a,b)=>String(a.Date || "").localeCompare(String(b.Date || "")));
    el.monthlyGrid.innerHTML = sorted.map((r)=>{
      const dateVal = r.Date || "-";
      const taskVal = r.Task || "Untitled";
      const metaVal = `${r.Client || "-"} · ${r.Status || "-"}`;
      return `<button class="list-entry event-chip ${r._social ? "social-chip" : ""} ${r._proposal ? "proposal-chip" : ""}" type="button" data-id="${r.id}"><span class="list-date">${dateVal}</span><span class="list-task">${taskVal}</span><span class="list-meta">${metaVal}</span></button>`;
      return `<button class="list-entry event-chip ${r._social ? "social-chip" : ""}" type="button" data-id="${r.id}"><span class="list-date">${dateVal}</span><span class="list-task">${taskVal}</span><span class="list-meta">${metaVal}</span></button>`;
    }).join('');
    renderDetailPanel();
    return;
  }

  el.weekdays.hidden = false;
  el.monthlyGrid.classList.remove('list-view');
  el.monthlyGrid.classList.remove('events-sections-view');
  const weekdays = setCalendarColumns(rows);
  const byDate = rows.reduce((a,r)=>((a[r.Date]??=[]).push(r),a),{});
  const year=Number(el.calYear.value), month=Number(el.calMonth.value);
  const first = new Date(year, month, 1);
  const mondayStart = new Date(first); mondayStart.setDate(first.getDate()-((first.getDay()+6)%7));

  let html='';
  const weekOrder = [1,2,3,4,5,6,0];
  for(let w=0; w<6; w++){
    for(const wd of weekdays){
      const dayOffset = weekOrder.indexOf(wd);
      const date = new Date(mondayStart); date.setDate(mondayStart.getDate()+w*7+dayOffset);
      const key = iso(date.getFullYear(), date.getMonth(), date.getDate());
      const inMonth = date.getMonth()===month;
      const entries = byDate[key] || [];
      html += `<div class="calendar-cell ${inMonth?'':'empty'}" data-date="${key}"><div class="cell-day">${date.getDate()}</div>${entries.map(e=>`<button class="event-chip ${e._social ? "social-chip" : ""} ${e._proposal ? "proposal-chip" : ""}" type="button" data-id="${e.id}">${e.Task||'Untitled'}</button>`).join('')}</div>`;
      html += `<div class="calendar-cell ${inMonth?'':'empty'}" data-date="${key}"><div class="cell-day">${date.getDate()}</div>${entries.map(e=>`<button class="event-chip ${e._social ? "social-chip" : ""}" type="button" data-id="${e.id}">${e.Task||'Untitled'}</button>`).join('')}</div>`;
    }
  }
  el.monthlyGrid.innerHTML = html;
  renderDetailPanel();
}

function getCalendarDetailFields(row){
  if (row && row._proposal) {
    return ['Task','Date','Proposal','Phase','Result','Architect','Proposal Description','Content Link'].filter((f)=>row[f] != null && String(row[f]).trim() !== '');
  }
  if (row && row._social) {
    return ['Date','Subject','Project Name','Caption','Media Type','Post Link'].filter((f)=>row[f] != null && String(row[f]).trim() !== '');
  }
  return DETAIL_FIELDS.filter((f)=>row && row[f] != null && String(row[f]).trim() !== '');
}

function renderDetailPanel(){
  const row = state.renderRows.find(r=>r.id===state.selectedId);
  if (!row){
    state.selectedGroupIds = [];
    state.detailEditMode = false;
    el.detailPanel.hidden = true;
    el.bdLayout.classList.remove('with-details');
    el.selectedEffort.innerHTML = '';
    el.selectedId.textContent = 'None';
    el.editSelected.textContent = 'Edit';
    return;
  }
  el.detailPanel.hidden = false;
  el.bdLayout.classList.add('with-details');
  el.selectedId.textContent = row.id;
  const visible = state.activeBdTab === "events" ? Object.keys(row).filter((f)=>f !== "id" && row[f] != null && String(row[f]).trim() !== "") : getCalendarDetailFields(row);
  state.selectedGroupIds = row._sourceIds || [row.id];
  if (state.detailEditMode){
    el.editSelected.textContent = 'Save';
    el.selectedEffort.innerHTML = `<div class="detail-record"><div class="pill-grid">${visible.map((f)=>`<div><span>${f}</span><input data-field="${f}" value="${String(row[f]).replace(/"/g,'&quot;')}" /></div>`).join('')}</div></div>`;
  } else {
    el.editSelected.textContent = 'Edit';
    el.selectedEffort.innerHTML = `<div class="detail-record"><div class="pill-grid">${visible.map((f)=>{
      const value = String(row[f] ?? '');
      const linkable = /link|url|website/i.test(f) && /^https?:\/\//i.test(value);
      return `<div><span>${f}</span>${linkable ? `<p class="pill-value"><a href="${value}" target="_blank" rel="noopener noreferrer">${value}</a></p>` : `<p class="pill-value">${value}</p>`}</div>`;
    }).join('')}</div><div class="detail-footer"><button id="delete-selected" class="subtab" type="button">Delete Record</button></div></div>`;
  }
}

function saveNewBdEvent(){
  const rec = {
    id: uid('BD'),
    Date: el.newDate.value,
    Task: el.newTask.value,
    "Account / Notes": el.newAccountNotes.value,
    Category: el.newCategory.value,
    Owner: el.newOwner.value,
    "Client Contact": el.newClientContact.value,
    Location: el.newLocation.value,
    Client: el.newClient.value,
    "Sub-Client": el.newSubClient.value,
    Status: el.newStatus.value,
    "Meeting Notes": el.newMeetingNotes.value,
    Action: el.newAction.value,
    "Sub Action": el.newSubAction.value,
    "Project Name": el.newProjectName.value
  };
  if (!rec.Date || !rec.Task) return;
  state.bdRows.push(rec);
  refreshAll();
}

function hasG2ContactsSheet(){
  return Object.keys(state.sheets || {}).some((n)=>norm(n) === 'g2contacts');
}

function syncSheetsPanelVisibility(){
  const hasAdditionalSheets = state.g2Loaded || hasG2ContactsSheet() || Object.keys(state.sheets || {}).some((n)=>!/business\s*development|bd|events?|g2|calendar/i.test(n));
  el.sheetsPanel.hidden = state.activeView !== 'business-development' || !hasAdditionalSheets;
}

function renderClientButtons(){
  const names = [...new Set(Object.keys(state.sheets || {}))].filter((n)=>!/business\s*development|bd|events?|g2|calendar/i.test(n));
  el.clientSheetList.innerHTML = names.map((n)=>`<button class="sheet-link client-sheet" type="button" data-sheet="${n}">${n}</button>`).join('');
  const hasClients = names.length > 0;
  el.toggleClients.hidden = !hasClients;
  if (!hasClients) {
    state.clientsExpanded = false;
    el.clientSheetList.hidden = true;
    el.toggleClients.textContent = 'Clients ▾';
  }
  el.sheetG2.textContent = "G2 Contacts";
  el.sheetG2.hidden = !(state.g2Loaded || hasG2ContactsSheet());
  syncSheetsPanelVisibility();
}

function renderSheet(name){
  const isG2Sheet = name === "G2 Contacts";
  const g2SheetRows = state.sheets[name] || [];
  const rows = isG2Sheet ? (g2SheetRows.length ? g2SheetRows : state.g2Rows) : (state.sheets[name] || []);
  el.sheetTitle.textContent = name;
  if (!rows.length){ el.sheetTable.innerHTML = '<p>No rows.</p>'; return; }
  const cols = [...new Set(rows.flatMap(r=>Object.keys(r)))];
  const visibleCols = isG2Sheet ? cols : cols.filter((c)=>rows.some((r)=>String(r[c] ?? '').trim() !== ''));
  const head = `<tr>${visibleCols.map(c=>`<th>${c}</th>`).join('')}</tr>`;
  const body = rows.slice(0,400).map(r=>`<tr>${visibleCols.map(c=>`<td>${r[c] ?? ''}</td>`).join('')}</tr>`).join('');
  el.sheetTable.innerHTML = `<div class="table-wrap"><table>${head}${body}</table></div>`;
}


function renderProposalDetails(){
  const row = state.proposalRows.find((r)=>r.id === state.selectedProposalId);
  if (!row) {
    el.proposalLayout?.classList.remove('with-details');
    if (el.proposalDetailPanel) el.proposalDetailPanel.hidden = true;
    el.proposalDetailContent.innerHTML = '<p class="hint">Select a completed proposal to view details.</p>';
    if (el.proposalSelectedId) el.proposalSelectedId.textContent = 'None';
    return;
  }

  el.proposalLayout?.classList.add('with-details');
  if (el.proposalDetailPanel) el.proposalDetailPanel.hidden = false;

  const link = String(row['Content Link'] || '').trim();
  const href = normalizeProposalHref(link);
  const linkHtml = href
    ? `<a href="${href}" target="_blank" rel="noopener noreferrer">${link}</a>`
    : (link || '-');

  el.proposalDetailContent.innerHTML = `
    <div class="proposal-detail-shell">
      <div class="proposal-detail-line"><span>Content Deadline</span><p>${formatDateMMDDYY(row['Content Deadline'])}</p></div>
      <div class="proposal-detail-line"><span>RFP/RFQ Deadline</span><p>${formatDateMMDDYY(row['Proposal Deadline'])}</p></div>
      <div class="proposal-detail-line"><span>Architect(s)</span><p>${row.Architect || '-'}</p></div>
      <div class="proposal-detail-line"><span>Description</span><p>${row['Proposal Description'] || '-'}</p></div>
      <div class="proposal-detail-line"><span>RFP Location</span><p>${linkHtml}</p></div>
      <div class="proposal-detail-line"><span>Result</span><p>${row.Result || '-'}</p></div>
    </div>
  `;
}

function normalizeProposalHref(linkValue){
  const raw = String(linkValue || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^www\./i.test(raw)) return `https://${raw}`;
  return raw;
}

function proposalCardLink(row){
  const link = String(row['Content Link'] || '').trim();
  const href = normalizeProposalHref(link);
  if (!href) return '-';
  return `<a href="${href}" target="_blank" rel="noopener noreferrer">Live link to the RFP/RFQ file</a>`;
}

function proposalNameLink(row){
  const name = row['Proposal Name'] || 'Untitled Proposal';
  const link = String(row['Content Link'] || '').trim();
  const href = normalizeProposalHref(link);
  if (!href) return `<strong>${name}</strong>`;
  return `<a href="${href}" target="_blank" rel="noopener noreferrer"><strong>${name}</strong></a>`;
}

function proposalCardHtml(row, phase){
  const isSelected = row.id === state.selectedProposalId;
  const content = formatDateMMDDYY(row['Content Deadline']);
  const submit = formatDateMMDDYY(row['Proposal Deadline']);
  const architect = row.Architect || '-';

  if (phase === 'Complete') {
    const resultClass = ` proposal-complete-${row._resultClass || 'default'}`;
    return `<button class="proposal-card proposal-card-complete${isSelected ? ' selected' : ''}${resultClass}" type="button" data-id="${row.id}" data-phase="Complete">
      <div class="proposal-card-top"><strong>Deadline - ${submit}</strong><span><strong>Result</strong><br/>${row.Result || '-'}</span></div>
      <div class="proposal-card-name">${row['Proposal Name'] || 'Untitled Proposal'}</div>
    </button>`;
  }

  const descriptionRow = phase === 'Content Development'
    ? `<div class="proposal-row proposal-row-full"><span>Description</span><p>${row['Proposal Description'] || '-'}</p></div>`
    : '';

  const locationRow = `<div class="proposal-row proposal-row-full"><span>RFP Location</span><p>${proposalCardLink(row)}</p></div>`;

  return `<div class="proposal-card proposal-card-stage" data-id="${row.id}" data-phase="${phase}">
    <div class="proposal-card-grid">
      <div class="proposal-row"><span>Content Deadline</span><p>${content}</p></div>
      <div class="proposal-row"><span>RFP/RFQ Deadline</span><p>${submit}</p></div>
      <div class="proposal-row proposal-row-full"><span>RFP/RFQ Name</span><p>${proposalNameLink(row)}</p></div>
      <div class="proposal-row proposal-row-full"><span>Architect${phase === 'Content Development' ? '(s)' : ''}</span><p>${architect}</p></div>
      ${descriptionRow}
      ${locationRow}
    </div>
  </div>`;
}

function renderProposals(){
  if (state.activeView !== 'proposals') return;
  const query = String(el.proposalCompleteSearch?.value || '').trim().toLowerCase();

  const phases = {
    'Team Development': state.proposalRows.filter((r)=>r.Phase === 'Team Development'),
    'Content Development': state.proposalRows.filter((r)=>r.Phase === 'Content Development'),
    Complete: state.proposalRows.filter((r)=>r.Phase === 'Complete')
  };

  const completeRows = phases.Complete.filter((r)=>!query || [r['Proposal Name'], r.Architect, r.Result, r['Proposal Description']].join(' ').toLowerCase().includes(query));

  const selectedIsComplete = !!completeRows.find((r)=>r.id === state.selectedProposalId);
  if (!selectedIsComplete) state.selectedProposalId = null;

  el.proposalCountTeam.textContent = String(phases['Team Development'].length);
  el.proposalCountContent.textContent = String(phases['Content Development'].length);
  el.proposalCountComplete.textContent = String(completeRows.length);

  el.proposalTeamList.innerHTML = phases['Team Development'].map((r)=>proposalCardHtml(r, 'Team Development')).join('') || '<p class="hint">No proposals in this stage.</p>';
  el.proposalContentList.innerHTML = phases['Content Development'].map((r)=>proposalCardHtml(r, 'Content Development')).join('') || '<p class="hint">No proposals in this stage.</p>';
  el.proposalCompleteList.innerHTML = completeRows.map((r)=>proposalCardHtml(r, 'Complete')).join('') || '<p class="hint">No proposals in this stage.</p>';

  renderProposalDetails();
}

function switchView(view){
  state.activeView = view;
  el.projectsView.hidden = view !== 'projects';
  el.bdView.hidden = view !== 'business-development';
  el.proposalsView.hidden = view !== 'proposals';
  el.reportsView.hidden = view !== 'reports';
  el.sheetView.hidden = true;
  const dataMode = view === 'business-development' || view === 'proposals';
  el.sourcePanel.hidden = !dataMode;
  el.addPanel.hidden = view !== 'business-development';
  syncSheetsPanelVisibility();
  if (view === 'proposals') renderProposals();
  el.reportsView.hidden = view !== 'reports';
  el.sheetView.hidden = true;
  const bdMode = view === 'business-development';
  el.sourcePanel.hidden = !bdMode;
  el.addPanel.hidden = !bdMode;
  syncSheetsPanelVisibility();
}

function moveMonth(delta){
  let m = Number(el.calMonth.value), y = Number(el.calYear.value);
  m += delta;
  if (m < 0){ m = 11; y -= 1; }
  if (m > 11){ m = 0; y += 1; }
  el.calMonth.value = String(m); el.calYear.value = String(y);
  renderCalendar();
}

function consolidateReportRows(rows){
  const grouped = new Map();
  rows.forEach((r)=>{
    const d = new Date(r.parsedDate);
    d.setHours(0,0,0,0);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const locationKey = String(r.location || '').toLowerCase().trim();
    const clientKey = String(r.client || '').toLowerCase().trim();
    const eventKey = String(r.task || '').toLowerCase().trim();
    const key = r.source === 'BD'
      ? `${r.source}|${dateKey}|${locationKey}`
      : (r.source === 'EV' ? `${r.source}|${dateKey}|${eventKey}` : `${r.source}|${dateKey}|${clientKey}`);
    const key = r.source === 'BD' ? `${r.source}|${dateKey}|${locationKey}` : `${r.source}|${dateKey}|${clientKey}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        ...r,
        parsedDate: d,
        ownerSet: new Set([r.owner].filter(Boolean)),
        clientSet: new Set([r.client].filter(Boolean)),
        notesSet: new Set([r.notes].filter(Boolean)),
        contactSet: new Set([r.contact].filter(Boolean))
      });
      return;
    }

    const item = grouped.get(key);
    if (r.owner) item.ownerSet.add(r.owner);
    if (r.client) item.clientSet.add(r.client);
    if (r.notes) item.notesSet.add(r.notes);
    if (r.contact) item.contactSet.add(r.contact);
    if (!item.task || item.task === '-') item.task = r.task;
    if (!item.category || item.category === '-') item.category = r.category;
    if (!item.project || item.project === '-') item.project = r.project;
    if (!item.client || item.client === '-') item.client = r.client;
    if (!item.location || item.location === '-') item.location = r.location;
  });

  return Array.from(grouped.values()).map((r)=>({
    ...r,
    owner: Array.from(r.ownerSet).join(', ') || '-',
    client: Array.from(r.clientSet).join(', ') || '-',
    notes: Array.from(r.notesSet).join(', ') || '-',
    contact: Array.from(r.contactSet).join(', ') || '-',
    ownerSet: undefined,
    clientSet: undefined,
    owner: Array.from(r.ownerSet).join(' | ') || '-',
    notes: Array.from(r.notesSet).join(' | ') || '-',
    contact: Array.from(r.contactSet).join(' | ') || '-',
    ownerSet: undefined,
    notesSet: undefined,
    contactSet: undefined
  }));
}


function consolidateEventRows(rows){
  return consolidateReportRows(rows.filter((r)=>r.source === 'EV'))
    .concat(rows.filter((r)=>r.source !== 'EV'));
}

function consolidateDisplayRows(rows){
  const grouped = new Map();
  rows.forEach((r)=>{
    const d = new Date(r.parsedDate);
    d.setHours(0,0,0,0);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const taskKey = String(r.task || '').toLowerCase().trim();
    const statusKey = String(r.status || '').toLowerCase().trim();
    const key = `${r.source}|${dateKey}|${taskKey}|${statusKey}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        ...r,
        parsedDate: d,
        clientSet: new Set([r.client].filter(Boolean)),
        ownerSet: new Set([r.owner].filter(Boolean)),
        contactSet: new Set([r.contact].filter(Boolean)),
        notesSet: new Set([r.notes].filter(Boolean)),
        categorySet: new Set([r.category].filter(Boolean)),
        projectSet: new Set([r.project].filter(Boolean)),
        locationSet: new Set([r.location].filter(Boolean))
      });
      return;
    }

    const item = grouped.get(key);
    if (r.client) item.clientSet.add(r.client);
    if (r.owner) item.ownerSet.add(r.owner);
    if (r.contact) item.contactSet.add(r.contact);
    if (r.notes) item.notesSet.add(r.notes);
    if (r.category) item.categorySet.add(r.category);
    if (r.project) item.projectSet.add(r.project);
    if (r.location) item.locationSet.add(r.location);
  });

  return Array.from(grouped.values()).map((r)=>({
    ...r,
    client: Array.from(r.clientSet).join(', ') || '-',
    owner: Array.from(r.ownerSet).join(', ') || '-',
    contact: Array.from(r.contactSet).join(', ') || '-',
    notes: Array.from(r.notesSet).join(', ') || '-',
    category: Array.from(r.categorySet).join(', ') || '-',
    project: Array.from(r.projectSet).join(', ') || '-',
    location: Array.from(r.locationSet).join(', ') || '-',
    clientSet: undefined,
    ownerSet: undefined,
    contactSet: undefined,
    notesSet: undefined,
    categorySet: undefined,
    projectSet: undefined,
    locationSet: undefined
  }));
}

function getSelectedReportDatasets(){
  const selected = [];
  if (el.reportDsBd?.checked) selected.push('bd');
  if (el.reportDsEvents?.checked) selected.push('g2');
  if (el.reportDsSocial?.checked) selected.push('social');
  if (el.reportDsProposals?.checked) selected.push('proposals');

  if (!selected.length && el.reportDataset) {
    const ds = el.reportDataset.value;
    if (ds === 'both') return ['bd','g2','social','proposals'];
    return [ds];
  }
  return selected;
}

async function generatePdfReport(){
  const mapBd = (r)=>({
    source: 'BD',
    rawDate: r.Date,
    parsedDate: parseDate(r.Date),
    task: r.Task || '-',
    client: r.Client || '-',
    status: r.Status || '-',
    owner: r.Owner || '-',
    category: r.Category || '-',
    project: r['Project Name'] || '-',
    notes: r['Meeting Notes'] || '-',
    contact: r['Client Contact'] || '-',
    location: r.Location || '-'
  });

  const mapSocial = (r)=>({
    source: 'SM',
    rawDate: r.Date,
    parsedDate: parseDate(r.Date),
    task: r.Subject || r.Task || '-',
    client: 'Social Media',
    status: r.Status || '-',
    owner: r.Owner || '-',
    category: r['Media Type'] || r.Category || '-',
    project: r['Project Name'] || '-',
    notes: r.Caption || r['Account / Notes'] || '-',
    contact: '-',
    location: r['Post Link'] || '-',
    link: r['Post Link'] || '-'
  });

  const eventDateCol = findEventColumn('date') || 'Dates Confirmed';
  const eventCol = findEventColumn('event') || 'Event';
  const eventSponsorCol = findEventColumn('sponsor') || 'Client or Sponsor';
  const eventCategoryCol = findEventColumn('category') || 'Category';
  const eventNotesCol = findEventColumn('notes') || 'Notes';

  const mapEvents = (r)=>({
    source: 'EV',
    rawDate: r[eventDateCol],
    parsedDate: parseDate(r[eventDateCol]),
    task: r[eventCol] || '-',
    client: r[eventSponsorCol] || '-',
    status: '-',
    owner: r[eventSponsorCol] || '-',
    category: r[eventCategoryCol] || '-',
    project: '-',
    notes: r[eventNotesCol] || '-',
    contact: '-',
    location: '-'
  });

  const mapProposals = (r)=>({
    source: 'PR',
    rawDate: r['Proposal Deadline'] || r['Content Deadline'],
    parsedDate: parseDate(r['Proposal Deadline']) || parseDate(r['Content Deadline']),
    task: r['Proposal Name'] || '-',
    client: r.Architect || '-',
    status: r.Phase || '-',
    owner: r.Architect || '-',
    category: 'Proposal',
    project: r['Proposal Name'] || '-',
    notes: r['Proposal Description'] || '-',
    contact: r.Architect || '-',
    location: 'Proposal Pipeline',
    result: r.Result || '-',
    contentDeadline: r['Content Deadline'] || '-',
    proposalDeadline: r['Proposal Deadline'] || '-'
  });

  let rows = [];
  const selectedDatasets = getSelectedReportDatasets();
  if (!selectedDatasets.length) {
    el.reportStatus.textContent = 'Select at least one dataset before generating the report.';
    return;
  }
  if (selectedDatasets.includes('bd')) rows = rows.concat(state.bdRows.map(mapBd));
  if (selectedDatasets.includes('social')) rows = rows.concat(state.socialRows.map(mapSocial));
  if (selectedDatasets.includes('proposals')) rows = rows.concat(state.proposalRows.map(mapProposals));
  if (selectedDatasets.includes('g2')) rows = rows.concat(state.g2Rows.map(mapEvents));
  let rows = [];
  if (el.reportDataset.value === 'bd' || el.reportDataset.value === 'both') rows = rows.concat(state.bdRows.map(mapBd));
  if (el.reportDataset.value === 'g2' || el.reportDataset.value === 'both') rows = rows.concat(state.g2Rows.map(mapEvents));

  const validRows = rows
    .filter((r)=>r.parsedDate)
    .filter((r)=>String(r.status || '').trim().toLowerCase() !== 'incomplete')
    .map((r)=>({ ...r, parsedDate: new Date(r.parsedDate) }));

  const useRolling = !!el.reportRolling.checked;
  let centerDate = parseDate(el.reportCenter.value);
  if (!centerDate) centerDate = new Date();
  centerDate.setHours(0,0,0,0);

  let startDate;
  let endDate;
  let upcomingRows = [];
  let pastRows = [];
  let customRows = [];

  const inRange = (d, start, end) => {
    const copy = new Date(d);
    copy.setHours(0,0,0,0);
    return copy >= start && copy <= end;
  };

  const sortByDate = (a,b)=>a.parsedDate - b.parsedDate;

  const applyEventSectionRules = (rows)=>{
    let out = rows.filter((r)=>r.source !== 'PR' && r.source !== 'SM');
    out = consolidateReportRows(out);
    out = consolidateEventRows(out);
    out = consolidateDisplayRows(out);
    return out.sort(sortByDate);
  };

  if (useRolling) {
    startDate = new Date(centerDate);
    startDate.setDate(startDate.getDate() - 30);
    startDate.setHours(0,0,0,0);
    endDate = new Date(centerDate);
    endDate.setDate(endDate.getDate() + 29);
    endDate.setHours(23,59,59,999);

    const rangeMidnightEnd = new Date(endDate);
    rangeMidnightEnd.setHours(0,0,0,0);

    upcomingRows = applyEventSectionRules(validRows.filter((r)=>inRange(r.parsedDate, centerDate, rangeMidnightEnd)));
    pastRows = applyEventSectionRules(validRows.filter((r)=>inRange(r.parsedDate, startDate, new Date(centerDate.getTime()-86400000))));
    upcomingRows = validRows.filter((r)=>inRange(r.parsedDate, centerDate, rangeMidnightEnd)).sort(sortByDate);
    pastRows = validRows.filter((r)=>inRange(r.parsedDate, startDate, new Date(centerDate.getTime()-86400000))).sort(sortByDate);

    if (el.reportDetails.value === 'full') {
      upcomingRows = consolidateReportRows(upcomingRows).sort(sortByDate);
      pastRows = consolidateReportRows(pastRows).sort(sortByDate);
    }
  } else {
    const from = parseDate(el.reportFrom.value);
    const to = parseDate(el.reportTo.value);
    if (!from || !to) { el.reportStatus.textContent = 'Please select both from/to dates for custom range.'; return; }
    startDate = new Date(from);
    endDate = new Date(to);
    startDate.setHours(0,0,0,0);
    endDate.setHours(23,59,59,999);
    customRows = applyEventSectionRules(validRows.filter((r)=>inRange(r.parsedDate, startDate, endDate)));
    customRows = validRows.filter((r)=>inRange(r.parsedDate, startDate, endDate)).sort(sortByDate);
    if (el.reportDetails.value === 'full') customRows = consolidateReportRows(customRows).sort(sortByDate);
  }

  const jsPDFCtor = window.jspdf?.jsPDF;
  if (!jsPDFCtor) { el.reportStatus.textContent = 'PDF library unavailable.'; return; }
  const doc = new jsPDFCtor();
  const pageBottom = 282;
  let y = 14;

  const ensurePage = (needed = 6)=>{
    if (y + needed > pageBottom) { doc.addPage(); y = 14; }
  };

  const writeWrapped = (text, x, maxWidth)=>{
    const lines = doc.splitTextToSize(String(text), maxWidth);
    lines.forEach((ln)=>{
      ensurePage(6);
      doc.text(ln, x, y);
      y += 6;
    });
  };

  const renderSection = (title, rangeText, sectionRows)=>{
    ensurePage(14);
    doc.setFontSize(11);
    doc.text(title, 14, y);
    y += 6;
    doc.setFontSize(9);
    doc.text(rangeText, 14, y);
    y += 6;

    if (!sectionRows.length) {
      writeWrapped('No records in this period.', 18, 172);
      y += 2;
      return;
    }

    sectionRows.forEach((r, i)=>{
      const line = `${i+1}. [${r.source}] ${formatDateMMDDYY(r.rawDate)} | ${r.task} | ${r.client} | ${r.status}`;
      writeWrapped(line, 18, 172);
      if (el.reportDetails.value === 'full') {
        writeWrapped(`Owner:${r.owner} Client Contact:${r.contact} Category:${r.category} Project:${r.project}`, 22, 168);
        if (r.source === 'PR') {
          writeWrapped(`Content Deadline:${formatDateMMDDYY(r.contentDeadline)} Proposal Deadline:${formatDateMMDDYY(r.proposalDeadline)} Result:${r.result || '-'}`, 22, 168);
        }
        if (r.source === 'SM') {
          writeWrapped(`Post Link:${r.link || '-'} Media Type:${r.category || '-'}`, 22, 168);
        }
        writeWrapped(`Meeting Notes:${r.notes}`, 22, 168);
      }
    });
    y += 2;
  };

  const renderSpecialSections = (rowsInWindow, rangeText)=>{
    const socialRows = rowsInWindow.filter((r)=>r.source === 'SM');
    const proposalRows = rowsInWindow.filter((r)=>r.source === 'PR');

    if (socialRows.length) {
      renderSection('Social Media Posts', rangeText, socialRows.sort(sortByDate));
    }

    if (proposalRows.length) {
      renderSection('RFP / RFQ Deadlines', rangeText, proposalRows.sort(sortByDate));
    }
  };

  const renderGoalChecksSection = ()=>{
    if (!el.reportIncludeGoals.checked) return;
    ensurePage(14);
    doc.setFontSize(11);
    doc.text('2026 Progress Bars (Marketing Goal Checks)', 14, y);
    y += 6;
    doc.setFontSize(9);

    if (!state.goalCheckRows.length) {
      writeWrapped('No Goal Checks data loaded. Load workbook "2026 Marketing Goal Checks" and sheet "2026 Progress bars".', 18, 172);
      y += 2;
      return;
    }

    state.goalCheckRows.forEach((r, i)=>{
      writeWrapped(`${i + 1}. ${r.goal || '-'} | ${r.percent || '-'}`, 18, 172);
    });
    y += 2;
  };

  // Header / branding block
  const secondTuesday = getSecondTuesday(new Date());

  try {
    const logoData = state.reportLogoDataUrl || await getDefaultReportLogoDataUrl();
    const logoW = REPORT_LOGO_WIDTH;
    const logoH = REPORT_LOGO_HEIGHT;
    doc.addImage(logoData, 'PNG', 14, y, logoW, logoH);
  } catch (_e) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(10);
    doc.text('Default logo could not be rendered', 14, y + 8);
  }

  y += 24;
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Monthly Marketing Report', 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('(Discussion on 2nd Tuesday of month)', 14, y);
  y += 6;
  doc.text(formatDateMMDDYY(secondTuesday), 14, y);
  y += 8;

  const chartTopY = y;
  const chartX = 122;
  const chartWidth = 74;

  const fillGradientBar = (x, by, w, h, startRgb, endRgb)=>{
    const steps = Math.max(12, Math.floor(w / 1.4));
    for (let i = 0; i < steps; i += 1) {
      const t = steps <= 1 ? 0 : i / (steps - 1);
      const r = Math.round(startRgb[0] + (endRgb[0] - startRgb[0]) * t);
      const g = Math.round(startRgb[1] + (endRgb[1] - startRgb[1]) * t);
      const b = Math.round(startRgb[2] + (endRgb[2] - startRgb[2]) * t);
      doc.setFillColor(r, g, b);
      const segX = x + (i / steps) * w;
      const segW = Math.max(0.6, w / steps + 0.1);
      doc.rect(segX, by, segW, h, 'F');
    }
  };

  const chartBottomY = (()=>{
    if (!el.reportIncludeGoals.checked) return chartTopY;
    let cy = chartTopY;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('G2 Sheet (Progress Bars)', chartX, cy);
    cy += 5;

    if (!state.goalCheckRows.length) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const lines = doc.splitTextToSize('Load 2026 Progress bars to render chart.', chartWidth);
      lines.forEach((ln)=>{ doc.text(ln, chartX, cy); cy += 4; });
      return cy;
    }

    const rows = state.goalCheckRows.slice(0, 13);
    rows.forEach((r)=>{
      const pct = parsePercentNumber(r.percent);
      const label = (r.goal || '').slice(0, 18) || '-';
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(label, chartX, cy + 2.4);

      const barX = chartX + 22;
      const barW = chartWidth - 26;
      const barY = cy;
      const barH = 3.2;
      doc.setDrawColor(210, 210, 210);
      doc.rect(barX, barY, barW, barH);

      const midX = barX + barW / 2;
      if (pct !== null) {
        if (pct >= 0) {
          const w = Math.min((pct / 210) * (barW / 2), barW / 2);
          fillGradientBar(midX, barY, w, barH, [229, 245, 232], [104, 186, 120]);
        } else {
          const w = Math.min((Math.abs(pct) / 100) * (barW / 2), barW / 2);
          fillGradientBar(midX - w, barY, w, barH, [245, 206, 206], [235, 109, 109]);
        }
      }
      doc.setDrawColor(120, 120, 120);
      doc.line(midX, barY, midX, barY + barH);
      cy += 5;
    });
    return cy;
  })();

  const writeLink = (text, url, x, maxWidth)=>{
    const lines = doc.splitTextToSize(String(text), maxWidth);
    lines.forEach((ln)=>{
      ensurePage(6);
      doc.setTextColor(37, 99, 235);
      if (typeof doc.textWithLink === 'function') {
        doc.textWithLink(ln, x, y, { url });
      } else {
        doc.text(ln, x, y);
      }
      const width = doc.getTextWidth(ln);
      doc.setDrawColor(37, 99, 235);
      doc.line(x, y + 0.8, x + width, y + 0.8);
      y += 6;
      doc.setTextColor(30, 30, 30);
    });
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Summary:', 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  writeLink('2026 Goals – Tracking is here.', 'https://moduseng-my.sharepoint.com/:x:/g/personal/jnielsen_modus-eng_com/IQAHPv_TTKTERL5RjAFJNOzDAffCe_GpYoM7h9Eia9bVMRI?e=Qez8gR', 18, 100);
  y += 2;

  doc.setFont('helvetica', 'bold');
  doc.text('Tier 1:', 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  writeWrapped('G1: Strengthen InVision Partnership:', 18, 100);
  writeWrapped('G2: Increase fees across client base', 18, 100);
  writeWrapped('G3: Expand in Wisconsin:', 18, 100);
  writeLink('G4: Log Weekly BD Outreach Efforts', 'https://moduseng-my.sharepoint.com/:x:/g/personal/jheidemann_modus-eng_com/IQCipROWxYdoQ4Bc_NU1gt-oAUMusSsgTtz8I9QdwJ3jI_8?e=dD3BAI', 18, 100);
  writeWrapped('G5: Enhance marketing efforts (Iowa City, Wtlo, InV):', 18, 100);
  writeWrapped('G6: Expand Trade Show Efforts:', 18, 100);
  writeWrapped('G7: Small Event Strategy:', 18, 100);
  y += 2;

  doc.setFont('helvetica', 'bold');
  doc.text('Tier 2:', 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  writeWrapped('G8: Client Retention Plan:', 18, 100);
  writeWrapped('G9: Identify Win/Capture Rates: Complete', 18, 100);
  writeWrapped('G10: Client Experience Initiative:', 18, 100);
  writeWrapped('G11: Market Directly to K12 and Healthcare:', 18, 100);
  y += 2;

  doc.setFont('helvetica', 'bold');
  doc.text('Tier 3:', 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  writeWrapped('G12: Strategic Pursuit Teaming', 18, 100);
  writeWrapped('G13 Increase Weighting Chasing $', 18, 100);
  writeWrapped('G2 Sheet', 18, 100);

  if (state.g2SheetTable.length) {
    ensurePage(22);
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('G2 Sheet Table (A1:P7)', 18, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);

    const tableRows = state.g2SheetTable;
    const cols = 16;
    const tableX = 18;
    const tableW = 178;
    const firstColW = 21;
    const otherColW = (tableW - firstColW) / (cols - 1);
    const rowH = 4.6;

    tableRows.forEach((row, rIdx)=>{
      ensurePage(rowH + 2);
      for (let c = 0; c < cols; c += 1) {
        const isHeaderRow = rIdx == 0;
        const isFirstCol = c == 0;
        const cellW = isFirstCol ? firstColW : otherColW;
        const cellX = tableX + (isFirstCol ? 0 : firstColW + (c - 1) * otherColW);
        const cellY = y - rowH + 0.7;

        if (isHeaderRow && !isFirstCol) {
          doc.setFillColor(205, 225, 232);
          doc.rect(cellX, cellY, cellW, rowH, 'F');
        }

        doc.setDrawColor(196, 196, 196);
        doc.setLineWidth(0.1);
        doc.rect(cellX, cellY, cellW, rowH);

        if (isHeaderRow || isFirstCol) {
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.35);
          doc.rect(cellX, cellY, cellW, rowH);
        }

        const txt = String(row[c] || '');
        if (txt) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.8);
          const maxChars = isFirstCol ? 30 : 16;
          const clipped = txt.length > maxChars ? `${txt.slice(0, maxChars)}…` : txt;
          doc.text(clipped, cellX + 0.45, y - 0.8);
        }
      }
      y += rowH;
    });
  }

  y = Math.max(y + 4, chartBottomY + 4);

  const renderNotesTextBlock = (title, text)=>{
    const notesText = String(text || '').trim();
    if (!notesText) return;
    ensurePage(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(title, 18, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    notesText.split(/\r?\n/).forEach((line)=>{
      writeWrapped(line || ' ', 18, 178);
    });
    y += 3;
  };

  const getImageFormat = (dataUrl)=>{
    if (typeof dataUrl !== 'string') return 'PNG';
    if (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')) return 'JPEG';
    if (dataUrl.startsWith('data:image/webp')) return 'WEBP';
    return 'PNG';
  };

  const getImageSize = (dataUrl)=>new Promise((resolve, reject)=>{
    const img = new Image();
    img.onload = ()=>resolve({ width: img.width || 1, height: img.height || 1 });
    img.onerror = reject;
    img.src = dataUrl;
  });

  const renderNotesImageBlock = async (title, images, itemLabel)=>{
    if (!images.length) return;
    if (title) {
      ensurePage(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(title, 18, y);
      y += 5;
    }

    for (let i = 0; i < images.length; i += 1) {
      const image = images[i];
      try {
        const dims = await getImageSize(image.dataUrl);
        const maxW = 170;
        const w = Math.min(maxW, dims.width);
        const h = Math.max(12, w * (dims.height / Math.max(dims.width, 1)));
        ensurePage(h + 10);
        doc.addImage(image.dataUrl, getImageFormat(image.dataUrl), 18, y, w, h);
        y += h + 4;
        doc.setTextColor(30, 30, 30);
      } catch (_err) {
        writeWrapped(`${i + 1}. Unable to render ${itemLabel}: ${image.name || 'Unknown file'}`, 18, 178);
      }
    }
    y += 2;
  };

  renderNotesTextBlock('Report Notes', el.reportNotes?.value || '');
  await renderNotesImageBlock('Report Note Images', state.reportNotesImages, 'note image');
  renderNotesTextBlock('Efforts', el.reportEfforts?.value || '');
  await renderNotesImageBlock('', state.reportEffortsImages, 'efforts image');

  if (useRolling) {
    const upcomingRangeText = `${formatDateMMDDYY(centerDate)} to ${formatDateMMDDYY(endDate)}`;
    const pastRangeText = `${formatDateMMDDYY(startDate)} to ${formatDateMMDDYY(new Date(centerDate.getTime()-86400000))}`;
    const fullWindowRangeText = `${formatDateMMDDYY(startDate)} to ${formatDateMMDDYY(endDate)}`;

    renderSection(
      'Upcoming Events',
      upcomingRangeText,
  if (useRolling) {
    renderSection(
      'Upcoming Events',
      `${formatDateMMDDYY(centerDate)} to ${formatDateMMDDYY(endDate)}`,
      upcomingRows
    );

    renderSection(
      'Past Events',
      pastRangeText,
      pastRows
    );

    const rollingWindowRows = validRows.filter((r)=>inRange(r.parsedDate, startDate, endDate));
    renderSpecialSections(rollingWindowRows, fullWindowRangeText);
  } else {
    const customRangeText = `${formatDateMMDDYY(startDate)} to ${formatDateMMDDYY(endDate)}`;
    renderSection(
      'Custom Range Events',
      customRangeText,
      customRows
    );

    const customWindowRows = validRows.filter((r)=>inRange(r.parsedDate, startDate, endDate));
    renderSpecialSections(customWindowRows, customRangeText);
      `${formatDateMMDDYY(startDate)} to ${formatDateMMDDYY(new Date(centerDate.getTime()-86400000))}`,
      pastRows
    );
  } else {
    renderSection(
      'Custom Range Events',
      `${formatDateMMDDYY(startDate)} to ${formatDateMMDDYY(endDate)}`,
      customRows
    );
  }


  doc.save(`efforts-report-${new Date().toISOString().slice(0,10)}.pdf`);
  el.reportStatus.textContent = useRolling
    ? `Generated PDF: Upcoming (${upcomingRows.length}) | Past (${pastRows.length}).`
    : `Generated PDF: Custom Range (${customRows.length}).`;
}


function setTheme(theme){
  const nextTheme = theme === THEMES.LIGHT ? THEMES.LIGHT : THEMES.DARK;
  document.body.dataset.theme = nextTheme;
  try { localStorage.setItem(THEME_STORAGE_KEY, nextTheme); } catch (_err) {}
  if (el.themeToggle) {
    const isLight = nextTheme === THEMES.LIGHT;
    el.themeToggle.textContent = isLight ? 'Switch to dark mode' : 'Switch to light mode';
    el.themeToggle.setAttribute('aria-pressed', isLight ? 'true' : 'false');
  }
}

function getInitialTheme(){
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === THEMES.LIGHT || saved === THEMES.DARK) return saved;
  } catch (_err) {}
  return THEMES.DARK;
}


function updateReportModeUI(){
  const useRolling = !!el.reportRolling.checked;
  el.reportCustom.checked = !useRolling;
  el.reportCenterRow.hidden = !useRolling;
  el.reportCustomRow.hidden = useRolling;
}

function setCalendarToFirstDataMonth(){
  const row = getCalendarRows().find(r => parseDate(r.Date));
  if (!row) return;
  const d = parseDate(row.Date);
  el.calMonth.value = String(d.getMonth());
  el.calYear.value = String(d.getFullYear());
}

function refreshFilters(){
  const rows = state.activeBdTab === "events" ? getActiveRows() : getCalendarRows();
  if (state.activeBdTab === "events") {
    el.statusLabel.textContent = 'Category';
    const categoryCol = findEventColumn('category') || 'Category';
    const sponsorCol = findEventColumn('sponsor') || 'Client or Sponsor';
    const siteCol = findEventColumn('site') || 'Website';
    el.ownerLabel.textContent = 'Client or Sponsor';
    el.categoryLabel.textContent = siteCol;
    el.search.placeholder = 'Event, notes, sponsor...';
    fillSelect(el.status, rows.map(r=>r[categoryCol]));
    fillSelect(el.owner, rows.map(r=>r[sponsorCol]));
    fillSelect(el.category, rows.map(r=>r[siteCol]));
    return;
  }
  el.statusLabel.textContent = 'Status';
  el.ownerLabel.textContent = 'Owner';
  el.categoryLabel.textContent = 'Category';
  el.search.placeholder = 'Task, account, project...';
  fillSelect(el.status, rows.map(r=>r.Status));
  fillSelect(el.owner, rows.map(r=>r.Owner));
  fillSelect(el.category, rows.map(r=>r.Category));
}

function refreshAll(){
  const eventsMode = state.activeBdTab === "events";
  el.bdTitle.textContent = eventsMode ? 'Events (2026)' : 'BD Calendar';
  el.calendarHeading.textContent = eventsMode ? 'Events (sheet 2026)' : 'Business Development Calendar';
  el.tabBd.classList.toggle('active', !eventsMode);
  el.tabEvents.classList.toggle('active', eventsMode);
  el.monthControls.hidden = eventsMode;
  el.addPanel.hidden = state.activeView !== 'business-development' || eventsMode;
  if (el.calendarSources) {
    el.calendarSources.hidden = state.activeView !== 'business-development' || eventsMode;
    if (el.toggleSourceBd) el.toggleSourceBd.checked = !!state.showBdCalendar;
    if (el.toggleSourceSocial) {
      el.toggleSourceSocial.checked = !!state.showSocialCalendar;
      el.toggleSourceSocial.disabled = !state.socialLoaded;
    }
  }
  refreshFilters();
  renderCalendar();
  renderProposals();
}

function init(){
  loadSeed();
  months.forEach((m,i)=>{ el.calMonth.innerHTML += `<option value="${i}">${m}</option>`; });
  const now = new Date();
  el.calMonth.value = String(now.getMonth()); el.calYear.value = String(now.getFullYear()); el.newDate.value = iso(now.getFullYear(), now.getMonth(), now.getDate());
  el.reportCenter.value = iso(now.getFullYear(), now.getMonth(), now.getDate());
  updateReportModeUI();
  setTheme(getInitialTheme());

  el.themeToggle?.addEventListener('click', ()=>{
    const currentTheme = document.body.dataset.theme === THEMES.LIGHT ? THEMES.LIGHT : THEMES.DARK;
    setTheme(currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT);
  });

  el.nav.forEach((btn)=>btn.addEventListener('click', ()=>{ el.nav.forEach(b=>b.classList.remove('active')); btn.classList.add('active'); switchView(btn.dataset.view); refreshAll(); }));
  el.tabBd.addEventListener('click', ()=>{ state.activeBdTab='calendar'; state.selectedId=null; refreshAll(); });
  el.tabEvents.addEventListener('click', ()=>{ state.activeBdTab='events'; state.eventsBucket='upcoming'; state.selectedId=null; refreshAll(); });
  el.toggleSourceBd?.addEventListener('change', ()=>{ state.showBdCalendar = !!el.toggleSourceBd.checked; refreshAll(); });
  el.toggleSourceSocial?.addEventListener('change', ()=>{ if (!state.socialLoaded) return; state.showSocialCalendar = !!el.toggleSourceSocial.checked; refreshAll(); });
  [el.status,el.owner,el.category,el.search,el.calMonth,el.calYear].forEach((c)=>c.addEventListener('input', renderCalendar));
  el.prevMonth.addEventListener('click', ()=>moveMonth(-1)); el.nextMonth.addEventListener('click', ()=>moveMonth(1));
  el.saveEvent.addEventListener('click', saveNewBdEvent);
  el.proposalsView?.addEventListener('click', (e)=>{
    const card = e.target.closest('.proposal-card');
    if (!card) return;
    if (card.dataset.phase !== 'Complete') {
      state.selectedProposalId = null;
      renderProposals();
      return;
    }
    state.selectedProposalId = card.dataset.id;
    renderProposals();
  });
  el.proposalCompleteSearch?.addEventListener('input', ()=>renderProposals());
  el.proposalCloseDetails?.addEventListener('click', ()=>{
    state.selectedProposalId = null;
    renderProposals();
  });

  el.monthlyGrid.addEventListener('click', (e)=>{
    const bucketBtn = e.target.closest('.events-bucket-btn');
    if (bucketBtn) { state.eventsBucket = bucketBtn.dataset.bucket; renderCalendar(); return; }
    const eventRow = e.target.closest('.event-row');
    if (eventRow){ state.selectedId = eventRow.dataset.id; state.detailEditMode = false; renderCalendar(); return; }
    const chip=e.target.closest('.event-chip');
    if (chip){ state.selectedId = chip.dataset.id; state.detailEditMode = false; renderCalendar(); }
  });
  el.editSelected.addEventListener('click', ()=>{
    const row = state.renderRows.find(r=>r.id===state.selectedId);
    if (!row) return;
    if (!state.detailEditMode){ state.detailEditMode = true; renderDetailPanel(); return; }
    const sourceRows = (state.activeBdTab === "events" ? getActiveRows() : getCalendarRows()).filter((r)=>state.selectedGroupIds.includes(r.id));
    el.selectedEffort.querySelectorAll('input[data-field]').forEach((inp)=>{
      if (state.activeBdTab !== "events" && ["Owner","Client Contact"].includes(inp.dataset.field)) {
        const pieces = inp.value.split('|').map(v=>v.trim()).filter(Boolean);
        sourceRows.forEach((r, i)=>{ r[inp.dataset.field] = pieces[i] || pieces[0] || ""; });
      } else if (sourceRows[0]) {
        sourceRows[0][inp.dataset.field] = inp.value;
      }
    });
    state.detailEditMode = false; renderCalendar();
  });
  el.closeDetails.addEventListener('click', ()=>{ state.selectedId = null; state.selectedGroupIds = []; state.detailEditMode = false; renderCalendar(); });
  el.selectedEffort.addEventListener('click', (e)=>{
    const del = e.target.closest('#delete-selected');
    if (!del) return;
    if (!confirm('Are you sure you want to delete this record?')) return;
    const ids = new Set(state.selectedGroupIds);
    if (state.activeBdTab === "events") state.g2Rows = state.g2Rows.filter(r=>!ids.has(r.id));
    else {
      state.bdRows = state.bdRows.filter(r=>!ids.has(r.id));
      state.socialRows = state.socialRows.filter(r=>!ids.has(r.id));
    }
    state.selectedId = null; state.selectedGroupIds = []; state.detailEditMode = false;
    refreshAll();
  });

  el.loadBdUrl.addEventListener('click', ()=>{ const u=el.bdUrlInput.value.trim(); if (u) loadFromUrl(u,'bd'); });
  el.loadG2Url.addEventListener('click', ()=>{ const u=el.g2UrlInput.value.trim(); if (u) loadFromUrl(u,'g2'); });
  el.loadGoalsUrl.addEventListener('click', ()=>{ const u=el.goalsUrlInput.value.trim(); if (u) loadFromUrl(u,'goals'); });
  el.loadSocialUrl.addEventListener('click', ()=>{ const u=el.socialUrlInput.value.trim(); if (u) loadFromUrl(u,'social'); });
  el.bdFileInput.addEventListener('change', (e)=>{ const f=e.target.files?.[0]; if (f) loadFile(f,'bd'); });
  el.g2FileInput.addEventListener('change', (e)=>{ const f=e.target.files?.[0]; if (f) loadFile(f,'g2'); });
  el.goalsFileInput.addEventListener('change', (e)=>{ const f=e.target.files?.[0]; if (f) loadFile(f,'goals'); });
  el.socialFileInput.addEventListener('change', (e)=>{ const f=e.target.files?.[0]; if (f) loadFile(f,'social'); });
  el.proposalFileInput.addEventListener('change', (e)=>{ const f=e.target.files?.[0]; if (f) loadFile(f,'proposal'); });

  const openSheetView = (sheetName)=>{
    switchView('business-development');
    state.selectedId = null;
    state.detailEditMode = false;
    el.sheetView.hidden = false;
    el.bdView.hidden = true;
    renderSheet(sheetName);
  };
  el.sheetCalendar.addEventListener('click', ()=>{
    state.activeBdTab = 'calendar';
    state.selectedId = null;
    switchView('business-development');
    refreshAll();
  });
  el.sheetG2.addEventListener('click', ()=>{ openSheetView('G2 Contacts'); });
  el.toggleClients.addEventListener('click', ()=>{ state.clientsExpanded = !state.clientsExpanded; el.clientSheetList.hidden = !state.clientsExpanded; el.toggleClients.textContent = state.clientsExpanded ? 'Clients ▴' : 'Clients ▾'; });
  el.clientSheetList.addEventListener('click', (e)=>{ const b=e.target.closest('.client-sheet'); if(!b) return; openSheetView(b.dataset.sheet); });

  el.reportRolling.addEventListener('change', ()=>{ if (el.reportRolling.checked) updateReportModeUI(); });
  el.reportCustom.addEventListener('change', ()=>{ if (el.reportCustom.checked) { el.reportRolling.checked = false; updateReportModeUI(); } else if (!el.reportRolling.checked) { el.reportRolling.checked = true; updateReportModeUI(); } });
  el.reportLogoInput?.addEventListener('change', (e)=>{
    const f = e.target.files?.[0];
    if (!f) { state.reportLogoDataUrl = ''; return; }
    const fr = new FileReader();
    fr.onload = (ev)=>{ state.reportLogoDataUrl = String(ev.target?.result || ''); };
    fr.readAsDataURL(f);
  });
  const readImageFiles = async (files)=>{
    const toDataUrl = (file)=>new Promise((resolve, reject)=>{
      const fr = new FileReader();
      fr.onload = ()=>resolve({ name: file.name, dataUrl: String(fr.result || '') });
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
    const loaded = await Promise.all(files.map(toDataUrl));
    return loaded.filter((item)=>item.dataUrl);
  };

  el.reportNotesImages?.addEventListener('change', async (e)=>{
    const files = Array.from(e.target.files || []);
    if (!files.length) {
      state.reportNotesImages = [];
      if (el.reportNotesImagesStatus) el.reportNotesImagesStatus.textContent = 'No note images selected.';
      return;
    }
    state.reportNotesImages = await readImageFiles(files);
    if (el.reportNotesImagesStatus) {
      el.reportNotesImagesStatus.textContent = state.reportNotesImages.length
        ? `${state.reportNotesImages.length} note image(s) ready for export.`
        : 'No note images selected.';
    }
  });

  el.reportEffortsImages?.addEventListener('change', async (e)=>{
    const files = Array.from(e.target.files || []);
    if (!files.length) {
      state.reportEffortsImages = [];
      if (el.reportEffortsImagesStatus) el.reportEffortsImagesStatus.textContent = 'No efforts images selected.';
      return;
    }
    state.reportEffortsImages = await readImageFiles(files);
    if (el.reportEffortsImagesStatus) {
      el.reportEffortsImagesStatus.textContent = state.reportEffortsImages.length
        ? `${state.reportEffortsImages.length} efforts image(s) ready for export.`
        : 'No efforts images selected.';
    }
  });

  el.generateReport.addEventListener('click', generatePdfReport);

  switchView('business-development');
  state.activeBdTab = 'calendar';
  setCalendarToFirstDataMonth();
  refreshAll();
}

init();
