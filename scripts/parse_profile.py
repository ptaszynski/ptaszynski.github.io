"""
One-shot parser: profile.htm (Word-exported HTML) -> clean profile.htm.
Extracts text per section, applies year/role parsing where applicable,
then writes a new profile.htm using the site template.
"""

import re
import sys
from pathlib import Path
from bs4 import BeautifulSoup, NavigableString, Tag

SRC = Path("/Users/michalptaszynski/nlp/strona_backup/profile_utf.htm")
OUT = Path("/Users/michalptaszynski/nlp/strona_backup/profile.htm")
TMP_TXT = Path("/tmp/profile_dump.txt")

# Section anchor -> (display title, parsing style)
SECTIONS = [
    ("interests",    "Research Interests", "bullets"),
    ("education",    "Education",          "timeline"),
    ("positions",    "Academic Positions", "timeline"),
    ("teaching",     "Teaching Experience & Courses", "timeline-rich"),
    ("grants",       "Grants & Scholarships",         "timeline-rich"),
    ("awards",       "Honours & Awards",              "timeline-rich"),
    ("certificates", "Courses & Certificates",        "timeline-rich"),
    ("memberships",  "Memberships & Affiliations",    "bullet-split"),
    ("activities",   "Professional Activities",        "paragraphs"),
]


_MOJI_SUBS = [
    # Right single quotation mark, double-mojibake'd through cp1252 ×2
    (re.compile(r"ÃÂ¢ÃÂÃÂs\b"), "'s"),
    (re.compile(r"ÃÂ¢ÃÂÃÂt\b"), "'t"),
    (re.compile(r"ÃÂ¢ÃÂÃÂ"), "'"),
    # En-dash / em-dash patterns
    (re.compile(r"ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ"), "–"),
    (re.compile(r"ÃÂ¢ÃÂÃÂ"), "–"),
    # Stray "Ã«" → ë, "Ã©" → é, "Ã¤" → ä, etc. — only when isolated
    (re.compile(r"Ã©"), "é"),
    (re.compile(r"Ã¨"), "è"),
    (re.compile(r"Ã«"), "ë"),
    (re.compile(r"Ã¶"), "ö"),
    (re.compile(r"Ã¼"), "ü"),
    (re.compile(r"Ã¤"), "ä"),
    (re.compile(r"Ã±"), "ñ"),
    (re.compile(r"Ã§"), "ç"),
    (re.compile(r"Ã³"), "ó"),
    (re.compile(r"Ã¡"), "á"),
    (re.compile(r"Ãº"), "ú"),
]


def fix_moji(s):
    for pat, rep in _MOJI_SUBS:
        s = pat.sub(rep, s)
    return s


_LANG_ATTR = re.compile(r'\s*<span\s+lang=[A-Z-]+>([^<]*)</span>')
_URL = re.compile(r'(?<![">\w])((?:https?://|www\.)[A-Za-z0-9./_~%?#&=:+\-]+[A-Za-z0-9/])')


def clean_ws(s):
    s = fix_moji(re.sub(r"\s+", " ", s or "").strip())
    # The text-extractor already strips tags, but defensive scrubbing here too.
    s = _LANG_ATTR.sub(r'\1', s)
    return s


def autolink(s):
    """Wrap bare URLs in <a> tags. Skips strings already inside <a>...</a>."""
    if "<a " in s.lower():
        return s
    return _URL.sub(lambda m: f'<a href="{("http://" + m.group(1)) if m.group(1).startswith("www") else m.group(1)}" rel="noopener">{m.group(1)}</a>', s)


def text_of(node):
    """Get text from a node, treating <br> as newlines."""
    parts = []
    for child in node.descendants:
        if isinstance(child, NavigableString):
            parts.append(str(child))
        elif isinstance(child, Tag) and child.name == "br":
            parts.append("\n")
    return "".join(parts)


def split_year_and_rest(text):
    """Identify a leading year or year-range and split it off from the rest.
    Examples:
      "2025 - present · Professor"  -> ("2025 – present", "Professor")
      "2007 - 2010  · Ph.D."         -> ("2007 – 2010",   "Ph.D.")
      "Member of IEEE, since 2009"   -> (None, "Member of IEEE, since 2009")
    """
    s = clean_ws(text)
    # Leading "YYYY - YYYY" or "YYYY - present" or "YYYY"
    m = re.match(r'^(\d{4})\s*[-–]\s*(present|\d{4})\b\s*[·•・\.\,\:\-]*\s*(.*)$', s, re.IGNORECASE)
    if m:
        yr = f"{m.group(1)} – {m.group(2)}"
        return yr, clean_ws(m.group(3))
    m = re.match(r'^(\d{4})\s*[·•・\.\,\:\-]+\s*(.+)$', s)
    if m:
        return m.group(1), clean_ws(m.group(2))
    m = re.match(r'^(\d{4})\b\s+(.+)$', s)
    if m:
        return m.group(1), clean_ws(m.group(2))
    return None, s


def normalize(s):
    return re.sub(r"[^a-z0-9]+", "", (s or "").lower())


# Titles in source that should switch the current section even without an <a name>.
# Maps normalized title -> anchor name.
HEADING_ALIASES = {}
for name, title, _ in SECTIONS:
    HEADING_ALIASES[normalize(title)] = name
    HEADING_ALIASES[normalize(title.replace(" &", " and"))] = name
# Add raw aliases that appear in source
HEADING_ALIASES[normalize("Teaching Experience and Courses")] = "teaching"
HEADING_ALIASES[normalize("Honours and Awards")] = "awards"
HEADING_ALIASES[normalize("Courses and certificates")] = "certificates"
HEADING_ALIASES[normalize("Grants and Scholarships")] = "grants"


def get_section_texts(soup):
    """Walk the body in document order. Switch section on:
      - <a name="X"></a> where X is a known section
      - a bold-only paragraph whose text matches a known section title
    """
    anchor_names = {name for name, *_ in SECTIONS}
    out = {name: [] for name in anchor_names}

    current = None
    for el in soup.find_all(["a", "p"]):
        if el.name == "a" and el.get("name") in anchor_names:
            current = el["name"]
            continue
        if el.name != "p":
            continue

        raw_text = clean_ws(text_of(el))
        if not raw_text or raw_text == "\xa0":
            continue
        if "back to top" in raw_text.lower():
            continue

        # Heading detection: is the paragraph essentially a single <b>...</b> matching a known title?
        # Word HTML wraps bold text in <b><span>...</span></b>.
        bolds = el.find_all("b")
        bold_text = clean_ws(" ".join(b.get_text(" ") for b in bolds))
        # If the bold text equals (approximately) the whole paragraph text and matches a known heading, switch.
        if bold_text and normalize(bold_text) == normalize(raw_text):
            key = HEADING_ALIASES.get(normalize(bold_text))
            if key:
                current = key
                continue

        if current is None:
            continue
        out[current].append(raw_text)

    return out


def render_bullets(items):
    if not items:
        return "<p class='muted'><em>Not listed.</em></p>"
    # The interests section uses one interest per "line". Bullet character `·` precedes each.
    raw = " ".join(items)
    # Split on the leading bullet char if it appears repeatedly
    if "·" in raw or "•" in raw:
        bits = re.split(r"[·•・]\s*", raw)
        bits = [clean_ws(b) for b in bits if clean_ws(b)]
    else:
        bits = [i for i in items if i]
    lis = "".join(f"<li>{b}</li>" for b in bits)
    return f"<ul class='profile-bullets'>{lis}</ul>"


def render_timeline(items, rich=False):
    """One paragraph per item: 'YYYY - YYYY · role at institution'."""
    if not items:
        return "<p class='muted'><em>Not listed.</em></p>"

    # Pair entries: when the previous line had a year+role and the next has no year,
    # treat the next as a description / institution for the previous.
    rows = []
    pending = None
    for raw in items:
        yr, rest = split_year_and_rest(raw)
        if yr:
            if pending:
                rows.append(pending)
            pending = {"year": yr, "title": rest, "details": []}
        else:
            if pending:
                pending["details"].append(rest)
            else:
                rows.append({"year": "", "title": rest, "details": []})
    if pending:
        rows.append(pending)

    out = ["<dl class='profile-timeline'>"]
    for r in rows:
        out.append(f"<dt>{r['year'] or '&nbsp;'}</dt>")
        details = ""
        if r["details"]:
            joined = "<br>".join(r["details"])
            details = f"<span class='profile-timeline__details'>{joined}</span>"
        out.append(f"<dd><strong>{r['title']}</strong>{('<br>' + details) if details else ''}</dd>")
    out.append("</dl>")
    return "\n".join(out)


def render_paragraphs(items):
    if not items:
        return "<p class='muted'><em>Not listed.</em></p>"
    out = []
    for it in items:
        out.append(f"<p>{autolink(it)}</p>")
    return "\n".join(out)


def build():
    raw = SRC.read_bytes()
    # Strip BOM if any
    if raw.startswith(b"\xef\xbb\xbf"):
        raw = raw[3:]
    soup = BeautifulSoup(raw.decode("utf-8", errors="replace"), "html.parser")

    sections = get_section_texts(soup)

    # Save a plain dump for inspection
    with TMP_TXT.open("w", encoding="utf-8") as fp:
        for name, title, _ in SECTIONS:
            fp.write(f"\n========== {title} ({len(sections.get(name, []))} items) ==========\n")
            for it in sections.get(name, []):
                fp.write(f"  - {it}\n")

    # Build the new page
    blocks = []
    nav_items = []
    for name, title, style in SECTIONS:
        nav_items.append(f'<li><a href="#{name}">{title}</a></li>')
        items = sections.get(name, [])
        # Inject the 2025 promotion that lives in the newer (already-overwritten) profile.htm.
        if name == "positions":
            items = ["2025 - present ・Professor",
                     "Kitami Institute of Technology, Kitami, Japan."] + \
                    [it.replace("2018 - present", "2018 - 2025") if it.startswith("2018 - present") else it for it in items]

        if style == "bullets":
            body = render_bullets(items)
        elif style == "bullet-split":
            joined = " ".join(items)
            bits = re.split(r"[・·•]\s*", joined)
            bits = [autolink(clean_ws(b)) for b in bits if clean_ws(b)]
            lis = "".join(f"<li>{b}</li>" for b in bits)
            body = f"<ul class='profile-bullets profile-bullets--wide'>{lis}</ul>"
        elif style == "timeline":
            body = render_timeline(items)
        elif style == "timeline-rich":
            body = render_timeline(items, rich=True)
        else:
            body = render_paragraphs(items)
        blocks.append(f"""
    <section id="{name}" class="profile-section">
        <h2 class="section-heading">{title}</h2>
        {body}
    </section>
""")

    nav = "\n            ".join(nav_items)
    sections_html = "\n".join(blocks)

    page = f"""<!doctype html>
<html lang="en">
<head>
\t<meta charset="utf-8">
\t<meta name="viewport" content="width=device-width, initial-scale=1">
\t<title>Michal Ptaszynski / Profile</title>
\t<meta name="author" content="Michal Ptaszynski">
\t<meta name="description" content="Profile / CV of Michal Ptaszynski — education, academic positions, teaching, grants, awards, memberships, and professional activities.">
\t<link rel="icon" href="images/favico.ico" type="image/x-icon">
\t<link rel="stylesheet" href="assets/site.css">
\t<script src="assets/site.js" defer></script>
\t<style>
\t\t.profile-meta {{
\t\t\tdisplay: grid;
\t\t\tgrid-template-columns: 1fr auto;
\t\t\tgap: 2rem;
\t\t\talign-items: start;
\t\t\tmargin-bottom: 2rem;
\t\t}}
\t\t.profile-meta img {{
\t\t\twidth: 125px;
\t\t\theight: 125px;
\t\t\tobject-fit: cover;
\t\t\tborder-radius: 50%;
\t\t\tbox-shadow: var(--shadow);
\t\t\tborder: 3px solid var(--surface);
\t\t}}
\t\t.profile-meta dl {{
\t\t\tmargin: 0;
\t\t\tdisplay: grid;
\t\t\tgrid-template-columns: max-content 1fr;
\t\t\tgap: .3rem 1rem;
\t\t\tfont-family: var(--font-sans);
\t\t\tfont-size: .95rem;
\t\t}}
\t\t.profile-meta dt {{ color: var(--muted); font-weight: 600; }}
\t\t.profile-meta dd {{ margin: 0; color: var(--ink); }}

\t\t.profile-toc {{
\t\t\tposition: sticky;
\t\t\ttop: 64px;
\t\t\tmargin: 1.5rem 0 2rem;
\t\t\tpadding: 1rem 1.1rem;
\t\t\tbackground: var(--accent-bg);
\t\t\tborder: 1px solid var(--line);
\t\t\tborder-radius: var(--radius-lg);
\t\t\tz-index: 5;
\t\t}}
\t\t.profile-toc strong {{
\t\t\tdisplay: block;
\t\t\tfont-family: var(--font-sans);
\t\t\tfont-size: .75rem;
\t\t\ttext-transform: uppercase;
\t\t\tletter-spacing: .12em;
\t\t\tcolor: var(--muted);
\t\t\tmargin-bottom: .5rem;
\t\t}}
\t\t.profile-toc ul {{
\t\t\tlist-style: none;
\t\t\tpadding: 0;
\t\t\tmargin: 0;
\t\t\tdisplay: flex;
\t\t\tflex-wrap: wrap;
\t\t\tgap: .35rem .9rem;
\t\t\tfont-family: var(--font-sans);
\t\t\tfont-size: .88rem;
\t\t}}
\t\t.profile-toc a {{ border: 0; }}

\t\t.profile-section {{ scroll-margin-top: 8rem; }}
\t\t.profile-section + .profile-section {{ margin-top: 2.5rem; }}

\t\t.profile-bullets {{
\t\t\tlist-style: none;
\t\t\tpadding: 0;
\t\t\tmargin: 0;
\t\t\tdisplay: grid;
\t\t\tgrid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
\t\t\tgap: .5rem .75rem;
\t\t}}
\t\t.profile-bullets li {{
\t\t\tposition: relative;
\t\t\tpadding-left: 1.1rem;
\t\t\tcolor: var(--ink-soft);
\t\t}}
\t\t.profile-bullets li::before {{
\t\t\tcontent: "•";
\t\t\tposition: absolute;
\t\t\tleft: 0;
\t\t\tcolor: var(--accent);
\t\t}}
\t\t.profile-bullets--wide {{ grid-template-columns: 1fr; }}
\t\t.profile-bullets--wide li {{ font-size: .95rem; padding-bottom: .35rem; }}

\t\t.profile-timeline {{
\t\t\tdisplay: grid;
\t\t\tgrid-template-columns: 160px 1fr;
\t\t\tgap: .9rem 1.5rem;
\t\t\tmargin: 0;
\t\t}}
\t\t.profile-timeline dt {{
\t\t\tfont-family: var(--font-sans);
\t\t\tfont-size: .85rem;
\t\t\tcolor: var(--muted);
\t\t\ttext-transform: uppercase;
\t\t\tletter-spacing: .06em;
\t\t\tpadding-top: .15rem;
\t\t}}
\t\t.profile-timeline dd {{
\t\t\tmargin: 0;
\t\t\tpadding-bottom: .9rem;
\t\t\tborder-bottom: 1px dashed var(--line);
\t\t\tcolor: var(--ink-soft);
\t\t}}
\t\t.profile-timeline dd:last-of-type {{ border-bottom: 0; }}
\t\t.profile-timeline dd strong {{ color: var(--ink); font-weight: 600; }}
\t\t.profile-timeline__details {{ display: block; margin-top: .2rem; font-size: .92rem; color: var(--muted); }}

\t\t@media (max-width: 720px) {{
\t\t\t.profile-meta {{ grid-template-columns: 1fr; }}
\t\t\t.profile-meta img {{ width: 100px; height: 100px; }}
\t\t\t.profile-timeline {{ grid-template-columns: 1fr; gap: .1rem; }}
\t\t\t.profile-timeline dd {{ padding-bottom: 1rem; }}
\t\t}}

\t\t@media print {{
\t\t\t.profile-toc {{ display: none; }}
\t\t\t.profile-timeline dd {{ break-inside: avoid; }}
\t\t}}
\t</style>
</head>
<body>

<div data-include="header"></div>

<main id="main" class="page page--wide">

\t<h1 class="page-title">Profile / CV</h1>
\t<p class="page-lede">Education, positions, teaching, grants, awards, and professional activities.</p>

\t<div class="profile-meta">
\t\t<dl>
\t\t\t<dt>Family name</dt><dd>Ptaszynski</dd>
\t\t\t<dt>Given names</dt><dd>Michał Edmund</dd>
\t\t\t<dt>Current role</dt><dd>Professor · Department of Computer Science, Kitami Institute of Technology</dd>
\t\t\t<dt>Location</dt><dd>Kitami, Hokkaido, Japan</dd>
\t\t</dl>
\t\t<img src="images/ptaszynski.jpg" alt="Portrait of Michal Ptaszynski">
\t</div>

\t<nav class="profile-toc" aria-label="On this page">
\t\t<strong>On this page</strong>
\t\t<ul>
\t\t\t{nav}
\t\t</ul>
\t</nav>

{sections_html}

\t<p class="muted small" style="margin-top:2.5rem">
\t\t<em>Tip:</em> press <kbd>Ctrl</kbd>+<kbd>P</kbd> / <kbd>⌘</kbd>+<kbd>P</kbd> to get a clean printable / PDF version of this CV.
\t</p>

</main>

<div data-include="footer"></div>

</body>
</html>
"""
    OUT.write_text(page, encoding="utf-8")
    print(f"Wrote {OUT}")
    print(f"Dumped section text to {TMP_TXT}")
    for name, _, _ in SECTIONS:
        print(f"  {name}: {len(sections.get(name, []))} items")


if __name__ == "__main__":
    build()
