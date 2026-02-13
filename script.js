const REQUIRED_FIELDS = ["Date","Task","Account / Notes","Category","Owner","Client Contact","Location","Client","Sub-Client","Status","Meeting Notes","Action","Sub Action","Project Name"];
const state = { sheets: {}, bdSheet: "", bdRows: [], selectedSheet: "", selectedId: null, draft: null };

const seedBdRows = [
  {id:"BD-101",Date:"2026-02-15",Task:"Discovery Call","Account / Notes":"Retail expansion",Category:"Prospecting",Owner:"Jared","Client Contact":"Taylor Kim",Location:"Zoom",Client:"Northwind","Sub-Client":"Northwind Labs",Status:"Planned","Meeting Notes":"Decision makers identified",Action:"Meet","Sub Action":"Initial","Project Name":"Q2 Expansion"},
  {id:"BD-102",Date:"2026-02-18",Task:"Proposal Review","Account / Notes":"Follow-up required",Category:"Pipeline",Owner:"Avery","Client Contact":"Sam Patel",Location:"San Francisco",Client:"Helios","Sub-Client":"Helios Ops",Status:"In Progress","Meeting Notes":"Need pricing follow-up",Action:"Submit Proposal","Sub Action":"Final Review","Project Name":"Onboarding Pilot"},
  {id:"BD-103",Date:"2026-03-03",Task:"Partnership Outreach","Account / Notes":"Warm intro via partner",Category:"Relationship",Owner:"Morgan","Client Contact":"Jordan Lee",Location:"New York",Client:"Altair","Sub-Client":"Altair Retail",Status:"Done","Meeting Notes":"Pilot approved",Action:"Email","Sub Action":"Follow-up","Project Name":"Renewal Program"}
];

const el = {
  nav: document.querySelectorAll(".nav-links button[data-view]"), dashboard: document.getElementById("dashboard-view"), bd: document.getElementById("bd-view"), sheet: document.getElementById("sheet-view"),
  portfolio: document.getElementById("portfolio-health"), eventPanel: document.getElementById("bd-event-panel"), sheetPanel: document.getElementById("sheet-list-panel"),
  sheetList: document.getElementById("sheet-list"), workbookInput: document.getElementById("workbook-input"), workbookStatus: document.getElementById("workbook-status"),
  status: document.getElementById("status-filter"), owner: document.getElementById("owner-filter"), category: document.getElementById("category-filter"), search: document.getElementById("search-filter"),
  calMonth: document.getElementById("calendar-month"), calYear: document.getElementById("calendar-year"), dayList: document.getElementById("scheduled-days"), calList: document.getElementById("bd-calendar-list"), visible: document.getElementById("visible-count"),
  selectedId: document.getElementById("selected-id"), selectedEffort: document.getElementById("selected-effort"),
  newTask: document.getElementById("new-task"), newClient: document.getElementById("new-client"), newMonth: document.getElementById("new-month"), newDay: document.getElementById("new-day"), newYear: document.getElementById("new-year"), newStatus: document.getElementById("new-status"), saveEvent: document.getElementById("save-event"), draftDate: document.getElementById("draft-date"),
  sheetTitle: document.getElementById("sheet-title"), sheetTable: document.getElementById("sheet-table")
};

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fillSelect(select, vals, all=true){ select.innerHTML = `${all?'<option value="All">All</option>':''}${vals.map(v=>`<option value="${v}">${v}</option>`).join("")}`; }
function iso(y,m,d){ return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`; }
function parseDate(v){ const d=new Date(v); return Number.isNaN(d.getTime())?null:d; }
function uid(){ return `BD-${Math.floor(Math.random()*90000)+10000}`; }

function loadSeed(){
  state.sheets = {
    "Business Development": seedBdRows.map(r=>({...r})),
    "Pipeline Notes": [{Owner:"Jared",Notes:"Prioritize Q2 follow-ups"}],
    "Reference": [{Field:"Status",Values:"Planned, In Progress, Done"}]
  };
  state.bdSheet = "Business Development";
  state.bdRows = state.sheets[state.bdSheet];
  state.selectedSheet = state.bdSheet;
}

function detectBdSheet(names){ return names.find(n=>/business\s*development|bd/i.test(n)) || names[0] || ""; }
function normalizeBdRow(row){
  const out = { id: row.id || uid() };
  REQUIRED_FIELDS.forEach(f => out[f] = String(row[f] ?? "").trim());
  return out;
}

function loadWorkbook(file){
  const reader = new FileReader();
  reader.onload = (e) => {
    const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
    const sheets = {};
    wb.SheetNames.forEach(name => {
      sheets[name] = XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: "" });
    });
    state.sheets = sheets;
    state.bdSheet = detectBdSheet(wb.SheetNames);
    state.bdRows = (state.sheets[state.bdSheet] || []).map(normalizeBdRow);
    state.sheets[state.bdSheet] = state.bdRows;
    state.selectedSheet = state.bdSheet;
    el.workbookStatus.textContent = `Loaded workbook: ${file.name}. ${wb.SheetNames.length} sheets available.`;
    refreshAll();
  };
  reader.readAsArrayBuffer(file);
}

function activeBdRows(){
  const rows = [...state.bdRows];
  if (state.draft?.Date) rows.push({ ...state.draft, id: "DRAFT", Status: state.draft.Status || "Draft" });
  const m = Number(el.calMonth.value); const y = Number(el.calYear.value);
  return rows.filter(r => {
    const d = parseDate(r.Date); if (!d) return false;
    const monthYear = d.getMonth() === m && d.getFullYear() === y;
    const status = el.status.value === "All" || r.Status === el.status.value;
    const owner = el.owner.value === "All" || r.Owner === el.owner.value;
    const category = el.category.value === "All" || r.Category === el.category.value;
    const search = !el.search.value.trim() || [r.Task, r.Client, r["Project Name"], r["Account / Notes"]].join(" ").toLowerCase().includes(el.search.value.toLowerCase());
    return monthYear && status && owner && category && search;
  }).sort((a,b)=>a.Date.localeCompare(b.Date));
}

function renderCalendar(){
  const rows = activeBdRows();
  el.visible.textContent = String(rows.length);
  const uniqueDays = [...new Set(rows.map(r => r.Date))];
  el.dayList.innerHTML = uniqueDays.length ? uniqueDays.map(d=>`<span class="day-pill">${d}</span>`).join("") : "<p>No scheduled dates.</p>";
  el.calList.innerHTML = rows.length ? rows.map(r=>`<div class="calendar-item ${state.selectedId===r.id?'active':''}" data-id="${r.id}"><strong>${r.Date} • ${r.Task || "(No task)"}</strong><p>${r.Client || "(No client)"} (${r.Status || "Open"}) — ${r.Owner || "Unassigned"}</p></div>`).join("") : "<p>No events for this month/filter.</p>";
  if (!rows.find(r=>r.id===state.selectedId)) state.selectedId = rows[0]?.id || null;
  renderSelected();
}

function renderSelected(){
  const row = state.bdRows.find(r=>r.id===state.selectedId);
  if (!row){ el.selectedId.textContent = "None"; el.selectedEffort.innerHTML = "<p>Select a row to modify.</p>"; return; }
  el.selectedId.textContent = row.id;
  el.selectedEffort.innerHTML = `<div class="mini-form"><input id="edit-task" value="${row.Task}"><input id="edit-client" value="${row.Client}"><input id="edit-date" type="date" value="${row.Date}"><select id="edit-status"></select><button id="save-edit" type="button">Save Update</button></div>`;
  fillSelect(document.getElementById("edit-status"), [...new Set(state.bdRows.map(r=>r.Status).filter(Boolean))], false);
  document.getElementById("edit-status").value = row.Status || "";
  document.getElementById("save-edit").addEventListener("click", ()=>{
    row.Task = document.getElementById("edit-task").value;
    row.Client = document.getElementById("edit-client").value;
    row.Date = document.getElementById("edit-date").value;
    row.Status = document.getElementById("edit-status").value;
    renderCalendar();
  });
}

function renderSheetList(){
  const names = Object.keys(state.sheets);
  el.sheetList.innerHTML = names.map(n=>`<button class="sheet-link ${state.selectedSheet===n?'active':''}" data-sheet="${n}">${n}</button>`).join("");
}

function renderSheetView(){
  const name = state.selectedSheet;
  const rows = state.sheets[name] || [];
  el.sheetTitle.textContent = name || "Sheet";
  if (!rows.length){ el.sheetTable.innerHTML = "<p>Sheet has no rows.</p>"; return; }
  const cols = [...new Set(rows.flatMap(r => Object.keys(r)))];
  const head = `<tr>${cols.map(c=>`<th>${c}</th>`).join("")}</tr>`;
  const body = rows.slice(0, 300).map(r=>`<tr>${cols.map(c=>`<td>${r[c] ?? ""}</td>`).join("")}</tr>`).join("");
  el.sheetTable.innerHTML = `<div class="table-wrap"><table>${head}${body}</table></div>`;
}

function toggleMain(area){
  el.dashboard.hidden = area !== "dashboard";
  el.bd.hidden = area !== "bd";
  el.sheet.hidden = area !== "sheet";
}

function switchView(name){
  const bdMode = name === "business-development";
  el.portfolio.hidden = bdMode;
  el.eventPanel.hidden = !bdMode;
  el.sheetPanel.hidden = !bdMode;
  if (!bdMode) toggleMain("dashboard");
  else if (state.selectedSheet && state.selectedSheet !== state.bdSheet) { toggleMain("sheet"); renderSheetView(); }
  else toggleMain("bd");
}

function updateDraft(){
  const y = Number(el.newYear.value), m = Number(el.newMonth.value), d = Number(el.newDay.value);
  if (!y || Number.isNaN(m) || !d) { state.draft = null; el.draftDate.textContent = "Draft date: --"; renderCalendar(); return; }
  state.draft = {
    Date: iso(y,m,d), Task: el.newTask.value || "New BD Effort", Client: el.newClient.value || "", Status: el.newStatus.value || "Planned",
    Owner: "", Category: "", "Account / Notes": "", "Client Contact": "", Location: "", "Sub-Client": "", "Meeting Notes": "", Action: "", "Sub Action": "", "Project Name": ""
  };
  el.draftDate.textContent = `Draft date: ${state.draft.Date}`;
  renderCalendar();
}

function addEventFromDraft(){
  if (!state.draft?.Date) return;
  state.bdRows.push({ id: uid(), ...state.draft });
  state.sheets[state.bdSheet] = state.bdRows;
  state.draft = null;
  el.newTask.value = ""; el.newClient.value = "";
  el.draftDate.textContent = "Draft date: --";
  refreshFilters(); renderCalendar();
}

function refreshFilters(){
  fillSelect(el.status, [...new Set(state.bdRows.map(r=>r.Status).filter(Boolean))]);
  fillSelect(el.owner, [...new Set(state.bdRows.map(r=>r.Owner).filter(Boolean))]);
  fillSelect(el.category, [...new Set(state.bdRows.map(r=>r.Category).filter(Boolean))]);
  fillSelect(el.newStatus, [...new Set(state.bdRows.map(r=>r.Status).filter(Boolean))], false);
  if (!el.newStatus.value) el.newStatus.value = "Planned";
}

function refreshAll(){ renderSheetList(); refreshFilters(); renderCalendar(); switchView(document.querySelector('.nav-links button.active')?.dataset.view || "dashboard"); }

function init(){
  loadSeed();
  months.forEach((m,i)=>{ el.calMonth.innerHTML += `<option value="${i}">${m}</option>`; el.newMonth.innerHTML += `<option value="${i}">${m}</option>`; });
  for (let d=1; d<=31; d++){ el.newDay.innerHTML += `<option value="${d}">${d}</option>`; }
  const now = new Date();
  el.calMonth.value = String(now.getMonth()); el.calYear.value = String(now.getFullYear());
  el.newMonth.value = String(now.getMonth()); el.newDay.value = String(now.getDate()); el.newYear.value = String(now.getFullYear());

  el.nav.forEach(btn => btn.addEventListener("click", ()=>{ el.nav.forEach(b=>b.classList.remove("active")); btn.classList.add("active"); switchView(btn.dataset.view); }));
  [el.status,el.owner,el.category,el.search,el.calMonth,el.calYear].forEach(c => c.addEventListener("input", renderCalendar));
  [el.newTask,el.newClient,el.newMonth,el.newDay,el.newYear,el.newStatus].forEach(c => c.addEventListener("input", updateDraft));
  el.saveEvent.addEventListener("click", addEventFromDraft);
  el.calList.addEventListener("click", (e)=>{ const item=e.target.closest(".calendar-item"); if (!item || item.dataset.id==="DRAFT") return; state.selectedId=item.dataset.id; renderCalendar(); });
  el.sheetList.addEventListener("click", (e)=>{ const btn=e.target.closest(".sheet-link"); if(!btn) return; state.selectedSheet=btn.dataset.sheet; renderSheetList(); if (state.selectedSheet===state.bdSheet) toggleMain("bd"); else { toggleMain("sheet"); renderSheetView(); } });
  el.workbookInput.addEventListener("change", (e)=>{ const file=e.target.files?.[0]; if(file) loadWorkbook(file); });

  refreshAll(); updateDraft();
}

init();
