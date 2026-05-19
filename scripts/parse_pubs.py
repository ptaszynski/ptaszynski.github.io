"""
One-shot parser: publications.htm -> publications.json.
Tolerant best-effort extractor. Per-entry fidelity ~80-90%; user can refine
individual entries afterward by editing the JSON.
"""

import json
import re
import sys
from pathlib import Path
from bs4 import BeautifulSoup, NavigableString, Tag

SRC = Path("/Users/michalptaszynski/nlp/strona_backup/publications.htm")
OUT = Path("/Users/michalptaszynski/nlp/strona_backup/assets/publications.json")

SECTION_MAP = {
    "[Books, Book Chapters]":       "book",
    "[Journals]":                   "journal",
    "[International Conferences]":  "conference",
    "[Local Conferences, Workshops and Symposia]": "local",
    "[Patents & Standards]":        "patent",
    "[Dissertations]":              "dissertation",
    "[Other]":                      "other",
}

# Icon images to ignore when picking a cover.
ICON_PATTERNS = re.compile(
    r"(acrobat\.png|github_png|github-logo|pypi\.webp|youtube|"
    r"facebook|twitter|linkedin|orcid|scholar|hf\.png|"
    r"semantic_scholar|web-of-science|dblp|mastodon|bluesky|reddit|"
    r"academiaedu|GoogleDev|researchmap)",
    re.IGNORECASE,
)


def clean_ws(s: str) -> str:
    return re.sub(r"\s+", " ", s or "").strip()


def first_year_in(text: str) -> int | None:
    m = re.search(r"\b(19|20)\d{2}\b", text)
    return int(m.group(0)) if m else None


def extract_links(scope: Tag) -> list[dict]:
    out = []
    for a in scope.find_all("a", href=True):
        href = a["href"].strip()
        if not href or href.startswith("#"):
            continue
        # label: prefer text, else the first non-icon image's alt/filename
        label = clean_ws(a.get_text(" "))
        if not label:
            img = a.find("img")
            if img and img.get("src"):
                label = Path(img["src"]).stem
            else:
                label = "link"
        if len(label) > 60:
            label = label[:57] + "…"
        out.append({"label": label, "url": href})
    # dedupe by url, keep first
    seen, dedup = set(), []
    for l in out:
        if l["url"] in seen:
            continue
        seen.add(l["url"])
        dedup.append(l)
    return dedup


def extract_cover(li: Tag, ul: Tag) -> str | None:
    """Find a cover image - look inside li, inside ul, and at ul's previous siblings."""
    candidates = []
    candidates.extend(li.find_all("img"))
    # also images that are direct children of ul but outside the li
    for child in ul.children:
        if isinstance(child, Tag) and child.name == "img":
            candidates.append(child)
        elif isinstance(child, Tag) and child.name == "a":
            candidates.extend(child.find_all("img"))
    # previous sibling of ul might be an anchor with cover
    prev = ul.find_previous_sibling()
    if isinstance(prev, Tag):
        candidates.extend(prev.find_all("img"))
    for img in candidates:
        src = img.get("src", "").strip()
        if not src:
            continue
        if ICON_PATTERNS.search(src):
            continue
        # ignore tiny icons by inline width
        style = img.get("style", "")
        m = re.search(r"width:\s*(\d+)px", style)
        if m and int(m.group(1)) < 30:
            continue
        return src
    return None


def parse_li(li: Tag, ul: Tag, pub_type: str) -> dict:
    # Extract text in a way that preserves separation around <br>
    text_parts = []
    for child in li.descendants:
        if isinstance(child, NavigableString):
            text_parts.append(str(child))
        elif isinstance(child, Tag) and child.name == "br":
            text_parts.append("\n")
    full_text = clean_ws(" ".join(text_parts).replace("\n", " || "))

    # The structure is typically: AUTHORS || TITLE || VENUE...
    chunks = [clean_ws(c) for c in full_text.split(" || ") if clean_ws(c)]

    # Title is the bold element if present
    title_tag = li.find("b")
    title = clean_ws(title_tag.get_text(" ")) if title_tag else ""
    # if title is wrapped in <b><i>, that's still the title; that's fine
    if title.startswith('"') and title.endswith('"'):
        title = title[1:-1].strip()

    # Authors: first chunk if it doesn't equal title
    authors = ""
    if chunks:
        first = chunks[0]
        if first and (not title or first != title and title not in first[:200]):
            authors = first
        elif len(chunks) > 1:
            authors = chunks[0]
    # if authors accidentally captured the title, try to clean
    if title and title in authors:
        authors = authors.replace(title, "").strip(" ,:")

    # Venue / details: everything after the title
    venue = ""
    if title:
        idx = full_text.find(title)
        if idx >= 0:
            tail = full_text[idx + len(title):]
            # strip leading separators / quotes
            tail = re.sub(r'^[\s\|"”\.,:;-]+', '', tail)
            venue = clean_ws(tail.replace(" || ", " "))
    if not venue and len(chunks) > 2:
        venue = " ".join(chunks[2:])

    year = first_year_in(full_text)
    cover = extract_cover(li, ul)
    links = extract_links(li)
    # also pull links from preceding sibling that hosts a cover-with-link
    prev = ul.find_previous_sibling()
    if isinstance(prev, Tag):
        for l in extract_links(prev):
            if l not in links:
                links.insert(0, l)

    return {
        "type": pub_type,
        "year": year,
        "authors": authors,
        "title": title,
        "venue": venue,
        "image": cover,
        "links": links,
    }


def main():
    html = SRC.read_text(encoding="utf-8-sig", errors="replace")
    soup = BeautifulSoup(html, "html.parser")

    # Walk the document, tracking current section.
    current_type = None
    publications = []

    # Find the main content area to avoid headers
    for el in soup.find_all(["h3", "ul"]):
        if el.name == "h3":
            heading = clean_ws(el.get_text(" "))
            current_type = SECTION_MAP.get(heading)
        elif el.name == "ul" and current_type:
            # Each ul might contain one or more <li>; usually one
            for li in el.find_all("li", recursive=False):
                if not li.get_text(strip=True):
                    continue
                rec = parse_li(li, el, current_type)
                if not rec["title"] and not rec["authors"]:
                    continue
                publications.append(rec)

    # Stable id and sort: newest first within section, sections in fixed order
    type_order = {"book": 0, "journal": 1, "conference": 2, "local": 3,
                  "patent": 4, "dissertation": 5, "other": 6}
    publications.sort(key=lambda p: (type_order.get(p["type"], 99),
                                     -(p["year"] or 0)))

    for i, p in enumerate(publications):
        p["id"] = f"p{i:04d}"

    payload = {
        "_comment": "Edit this file to add/remove publications. Newest first within each type. The publications.htm page reads this at runtime.",
        "_schema": {
            "type": "one of: book, journal, conference, local, patent, dissertation, other",
            "year": "integer (used for sorting + filters)",
            "authors": "string",
            "title": "string",
            "venue": "string (journal/conference + vol/pages/ISBN)",
            "image": "optional URL of cover image",
            "links": "array of {label, url}",
        },
        "publications": publications,
    }

    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(publications)} entries to {OUT}")
    by_type = {}
    for p in publications:
        by_type[p["type"]] = by_type.get(p["type"], 0) + 1
    for t, c in by_type.items():
        print(f"  {t}: {c}")


if __name__ == "__main__":
    main()
