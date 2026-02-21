from __future__ import annotations

from bs4 import BeautifulSoup

from .utils import parse_currency


def parse_top_corn_price(html: str) -> float:
    soup = BeautifulSoup(html, "html.parser")
    tables = soup.find_all("table")
    for table in tables:
        rows = table.find_all("tr")
        for row in rows:
            cells = row.find_all(["td", "th"])
            if len(cells) < 2:
                continue
            name = cells[0].get_text(strip=True).lower()
            if name == "corn":
                for cell in cells[1:]:
                    text = cell.get_text(" ", strip=True)
                    if "$" in text or any(ch.isdigit() for ch in text):
                        try:
                            return parse_currency(text.split()[0])
                        except ValueError:
                            continue
    raise ValueError("Unable to find top Corn row cash price")
