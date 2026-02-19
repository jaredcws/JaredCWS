import json
import subprocess
import sys
import tkinter as tk
from tkinter import messagebox, ttk
from typing import Any

import requests


class ProspectIdentifierDesktopApp:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title("Prospect Identifier Desktop")
        self.root.geometry("1100x720")

        self.base_url_var = tk.StringVar(value="http://127.0.0.1:8000")
        self.last_role_id_var = tk.StringVar(value="")
        self.selected_candidate_id: str | None = None
        self.selected_candidate_name: str | None = None
        self.api_process: subprocess.Popen[str] | None = None

        self.role_title_var = tk.StringVar()
        self.role_department_var = tk.StringVar()
        self.role_location_var = tk.StringVar(value="US remote")
        self.role_min_years_var = tk.StringVar(value="5")
        self.role_must_have_var = tk.StringVar(value="Python, AWS")
        self.role_nice_to_have_var = tk.StringVar(value="Kubernetes")

        self.search_status_var = tk.StringVar(value="")
        self.search_min_score_var = tk.StringVar(value="")
        self.outreach_channel_var = tk.StringVar(value="email")
        self.outreach_template_var = tk.StringVar(value="desktop_v1")
        self.outreach_subject_var = tk.StringVar(value="Opportunity at our company")

        self.candidate_map: dict[str, dict[str, Any]] = {}

        self._build_ui()
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

    def _build_ui(self) -> None:
        top_frame = ttk.Frame(self.root, padding=8)
        top_frame.pack(fill="x")

        ttk.Label(top_frame, text="API Base URL:").pack(side="left")
        ttk.Entry(top_frame, textvariable=self.base_url_var, width=40).pack(side="left", padx=6)
        ttk.Button(top_frame, text="Check API", command=self.check_api).pack(side="left", padx=4)
        ttk.Button(top_frame, text="Start API in Background", command=self.start_api_background).pack(side="left", padx=4)
        ttk.Label(top_frame, text="Last Role ID:").pack(side="left", padx=(20, 4))
        ttk.Entry(top_frame, textvariable=self.last_role_id_var, width=38).pack(side="left")

        notebook = ttk.Notebook(self.root)
        notebook.pack(fill="both", expand=True, padx=8, pady=8)

        self.role_tab = ttk.Frame(notebook)
        self.search_tab = ttk.Frame(notebook)
        self.report_tab = ttk.Frame(notebook)

        notebook.add(self.role_tab, text="Role Setup")
        notebook.add(self.search_tab, text="Search")
        notebook.add(self.report_tab, text="Candidate Report / Outreach")

        self._build_role_tab()
        self._build_search_tab()
        self._build_report_tab()

    def _build_role_tab(self) -> None:
        frm = ttk.Frame(self.role_tab, padding=16)
        frm.pack(fill="both", expand=True)

        row = 0
        self._labeled_entry(frm, "Title", self.role_title_var, row)
        row += 1
        self._labeled_entry(frm, "Department", self.role_department_var, row)
        row += 1
        self._labeled_entry(frm, "Location Policy", self.role_location_var, row)
        row += 1
        self._labeled_entry(frm, "Min Years Experience", self.role_min_years_var, row)
        row += 1
        self._labeled_entry(frm, "Must-Have Skills (comma separated)", self.role_must_have_var, row)
        row += 1
        self._labeled_entry(frm, "Nice-to-Have Skills (comma separated)", self.role_nice_to_have_var, row)
        row += 1

        ttk.Button(frm, text="Create & Save Role", command=self.create_role).grid(row=row, column=0, sticky="w", pady=12)

        self.role_output = tk.Text(frm, height=16, wrap="word")
        self.role_output.grid(row=row + 1, column=0, columnspan=2, sticky="nsew", pady=10)
        frm.rowconfigure(row + 1, weight=1)
        frm.columnconfigure(1, weight=1)

    def _build_search_tab(self) -> None:
        frm = ttk.Frame(self.search_tab, padding=12)
        frm.pack(fill="both", expand=True)

        controls = ttk.Frame(frm)
        controls.pack(fill="x", pady=4)
        ttk.Label(controls, text="Min Score:").pack(side="left")
        ttk.Entry(controls, textvariable=self.search_min_score_var, width=10).pack(side="left", padx=4)
        ttk.Label(controls, text="Status:").pack(side="left", padx=(10, 0))
        ttk.Entry(controls, textvariable=self.search_status_var, width=14).pack(side="left", padx=4)
        ttk.Button(controls, text="Search Candidates", command=self.search_candidates).pack(side="left", padx=8)

        columns = ("candidate_id", "name", "company", "headline", "score", "status")
        self.search_tree = ttk.Treeview(frm, columns=columns, show="headings", height=18)
        for col, width in [
            ("candidate_id", 220),
            ("name", 140),
            ("company", 140),
            ("headline", 240),
            ("score", 80),
            ("status", 100),
        ]:
            self.search_tree.heading(col, text=col)
            self.search_tree.column(col, width=width, anchor="w")

        self.search_tree.pack(fill="both", expand=True)
        self.search_tree.bind("<<TreeviewSelect>>", self.on_candidate_selected)

    def _build_report_tab(self) -> None:
        frm = ttk.Frame(self.report_tab, padding=12)
        frm.pack(fill="both", expand=True)

        button_bar = ttk.Frame(frm)
        button_bar.pack(fill="x")
        ttk.Button(button_bar, text="Get Score", command=self.get_score).pack(side="left", padx=4)
        ttk.Button(button_bar, text="Generate Report", command=self.generate_report).pack(side="left", padx=4)
        ttk.Button(button_bar, text="Log Outreach", command=self.log_outreach).pack(side="left", padx=4)

        outreach_bar = ttk.Frame(frm)
        outreach_bar.pack(fill="x", pady=8)
        ttk.Label(outreach_bar, text="Channel").pack(side="left")
        ttk.Combobox(
            outreach_bar,
            textvariable=self.outreach_channel_var,
            values=["email", "linkedin_inmail", "phone", "other"],
            width=15,
            state="readonly",
        ).pack(side="left", padx=6)

        ttk.Label(outreach_bar, text="Template").pack(side="left")
        ttk.Entry(outreach_bar, textvariable=self.outreach_template_var, width=20).pack(side="left", padx=6)

        ttk.Label(outreach_bar, text="Subject").pack(side="left")
        ttk.Entry(outreach_bar, textvariable=self.outreach_subject_var, width=32).pack(side="left", padx=6)

        ttk.Label(frm, text="Outreach Message").pack(anchor="w")
        self.outreach_message = tk.Text(frm, height=5, wrap="word")
        self.outreach_message.insert("1.0", "Hi there, I'd love to connect about a role that matches your background.")
        self.outreach_message.pack(fill="x", pady=4)

        self.report_output = tk.Text(frm, wrap="word")
        self.report_output.pack(fill="both", expand=True, pady=8)

    def _labeled_entry(self, parent: ttk.Frame, label: str, var: tk.StringVar, row: int) -> None:
        ttk.Label(parent, text=label).grid(row=row, column=0, sticky="w", pady=4, padx=(0, 10))
        ttk.Entry(parent, textvariable=var, width=70).grid(row=row, column=1, sticky="ew", pady=4)

    def _request(self, method: str, path: str, **kwargs: Any) -> requests.Response:
        url = f"{self.base_url_var.get().rstrip('/')}{path}"
        try:
            return requests.request(method, url, timeout=10, **kwargs)
        except requests.RequestException as exc:
            raise RuntimeError(f"Could not reach API at {self.base_url_var.get()}: {exc}") from exc

    def _parse_error(self, response: requests.Response) -> str:
        try:
            data = response.json()
            if isinstance(data, dict):
                return str(data.get("detail", data))
            return str(data)
        except Exception:
            return response.text or f"HTTP {response.status_code}"

    def check_api(self) -> None:
        try:
            resp = self._request("GET", "/health")
            if resp.status_code == 200:
                messagebox.showinfo("API Status", "API is running and reachable.")
            else:
                messagebox.showerror("API Status", f"API returned {resp.status_code}: {self._parse_error(resp)}")
        except RuntimeError as exc:
            messagebox.showerror("API Status", str(exc))

    def start_api_background(self) -> None:
        if self.api_process and self.api_process.poll() is None:
            messagebox.showinfo("API", "Background API is already running.")
            return

        try:
            self.api_process = subprocess.Popen(
                [sys.executable, "-m", "uvicorn", "src.app:app", "--host", "127.0.0.1", "--port", "8000"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            messagebox.showinfo("API", "Started FastAPI backend in the background at http://127.0.0.1:8000")
        except Exception as exc:
            messagebox.showerror("API", f"Failed to start API background process: {exc}")

    def create_role(self) -> None:
        try:
            min_years = int(self.role_min_years_var.get().strip())
        except ValueError:
            messagebox.showerror("Validation", "Min Years Experience must be an integer.")
            return

        payload = {
            "title": self.role_title_var.get().strip(),
            "department": self.role_department_var.get().strip() or None,
            "location_policy": self.role_location_var.get().strip(),
            "min_years_experience": min_years,
            "must_have_skills": [x.strip() for x in self.role_must_have_var.get().split(",") if x.strip()],
            "nice_to_have_skills": [x.strip() for x in self.role_nice_to_have_var.get().split(",") if x.strip()],
        }

        if not payload["title"] or not payload["location_policy"]:
            messagebox.showerror("Validation", "Title and Location Policy are required.")
            return

        try:
            resp = self._request("POST", "/roles", json=payload)
        except RuntimeError as exc:
            messagebox.showerror("Create Role", str(exc))
            return

        if resp.status_code != 201:
            messagebox.showerror("Create Role", f"API error: {self._parse_error(resp)}")
            return

        data = resp.json()
        self.last_role_id_var.set(data.get("id", ""))
        self.role_output.delete("1.0", tk.END)
        self.role_output.insert(tk.END, json.dumps({"request": payload, "response": data}, indent=2))
        messagebox.showinfo("Role", "Role created and saved in this session.")

    def search_candidates(self) -> None:
        role_id = self.last_role_id_var.get().strip()
        if not role_id:
            messagebox.showerror("Search", "No role_id found. Create a role first or paste role_id.")
            return

        params: dict[str, Any] = {"role_id": role_id}
        if self.search_min_score_var.get().strip():
            try:
                params["min_score"] = float(self.search_min_score_var.get().strip())
            except ValueError:
                messagebox.showerror("Search", "Min Score must be numeric.")
                return
        if self.search_status_var.get().strip():
            params["status"] = self.search_status_var.get().strip()

        try:
            resp = self._request("GET", "/candidates/search", params=params)
        except RuntimeError as exc:
            messagebox.showerror("Search", str(exc))
            return

        if resp.status_code != 200:
            messagebox.showerror("Search", f"API error: {self._parse_error(resp)}")
            return

        data = resp.json()

        for item in self.search_tree.get_children():
            self.search_tree.delete(item)
        self.candidate_map.clear()

        for item in data.get("items", []):
            cid = item.get("candidate_id", "")
            self.candidate_map[cid] = item
            self.search_tree.insert(
                "",
                tk.END,
                iid=cid,
                values=(
                    cid,
                    item.get("full_name", ""),
                    item.get("current_company", ""),
                    item.get("headline", ""),
                    item.get("overall_score", ""),
                    item.get("status", ""),
                ),
            )

        self.report_output.delete("1.0", tk.END)
        self.report_output.insert(tk.END, json.dumps(data, indent=2))

    def on_candidate_selected(self, _event: Any) -> None:
        selected = self.search_tree.selection()
        if not selected:
            return
        cid = selected[0]
        self.selected_candidate_id = cid
        self.selected_candidate_name = self.candidate_map.get(cid, {}).get("full_name")
        self.report_output.delete("1.0", tk.END)
        self.report_output.insert(
            tk.END,
            f"Selected candidate: {self.selected_candidate_name or 'Unknown'} ({cid})\n"
            "You can now click Get Score, Generate Report, or Log Outreach.",
        )

    def _require_selected(self) -> tuple[str, str] | None:
        role_id = self.last_role_id_var.get().strip()
        if not role_id:
            messagebox.showerror("Action", "No role_id available.")
            return None
        if not self.selected_candidate_id:
            messagebox.showerror("Action", "Select a candidate from Search tab first.")
            return None
        return self.selected_candidate_id, role_id

    def get_score(self) -> None:
        required = self._require_selected()
        if not required:
            return
        candidate_id, role_id = required

        try:
            resp = self._request("GET", f"/scores/{candidate_id}", params={"role_id": role_id})
        except RuntimeError as exc:
            messagebox.showerror("Get Score", str(exc))
            return

        if resp.status_code != 200:
            messagebox.showerror("Get Score", f"API error: {self._parse_error(resp)}")
            return

        self.report_output.delete("1.0", tk.END)
        self.report_output.insert(tk.END, json.dumps(resp.json(), indent=2))

    def generate_report(self) -> None:
        required = self._require_selected()
        if not required:
            return
        candidate_id, role_id = required

        try:
            resp = self._request("GET", f"/candidates/{candidate_id}/report", params={"role_id": role_id})
        except RuntimeError as exc:
            messagebox.showerror("Generate Report", str(exc))
            return

        if resp.status_code != 200:
            messagebox.showerror("Generate Report", f"API error: {self._parse_error(resp)}")
            return

        self.report_output.delete("1.0", tk.END)
        self.report_output.insert(tk.END, json.dumps(resp.json(), indent=2))

    def log_outreach(self) -> None:
        required = self._require_selected()
        if not required:
            return
        candidate_id, role_id = required

        payload = {
            "candidate_id": candidate_id,
            "role_id": role_id,
            "channel": self.outreach_channel_var.get(),
            "template_name": self.outreach_template_var.get().strip() or None,
            "message_subject": self.outreach_subject_var.get().strip() or None,
            "message_body": self.outreach_message.get("1.0", tk.END).strip() or None,
        }

        try:
            resp = self._request("POST", "/outreach", json=payload)
        except RuntimeError as exc:
            messagebox.showerror("Log Outreach", str(exc))
            return

        if resp.status_code != 201:
            messagebox.showerror("Log Outreach", f"API error: {self._parse_error(resp)}")
            return

        self.report_output.delete("1.0", tk.END)
        self.report_output.insert(tk.END, json.dumps({"request": payload, "response": resp.json()}, indent=2))
        messagebox.showinfo("Outreach", "Outreach logged successfully.")

    def on_close(self) -> None:
        if self.api_process and self.api_process.poll() is None:
            self.api_process.terminate()
        self.root.destroy()


def main() -> None:
    root = tk.Tk()
    app = ProspectIdentifierDesktopApp(root)
    _ = app
    root.mainloop()


if __name__ == "__main__":
    main()
