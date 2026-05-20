# Changelog

All notable changes to the personal homepage.

## 2026-05-20 — Phase 8.4: Profile refresh from 2025 CV

Refreshed `profile.htm` (+ JA/PL) from `Ptaszynski_CV_academic-official_2025.pdf`,
adding only the new entries in two sections.

### Courses & Certificates

- Added **2023 — IEEE Ethics Champion** (newest entry, top of the list).

### Professional Activities

- Added two new year sections, **2024** and **2023**, ahead of the
  existing 2022 (kept separate per request, even though the CV's two
  lists are near-identical ongoing roles — IEEE memberships/councils,
  ACL/IEEE standards & ethics committees, ~50 journal reviewer/editorial
  roles, plus that cycle's conference PCs: ACL 2023, AIGC 2023, ASEC
  2024, AUSDM'23, BICA*AI 2023, CTIEEM 2023, EMNLP 2023, ICCIT 2023,
  ICNLP 2024, ICON 2023, LREC-COLING 2024, LTC'23 / EDO 2023, MetaACES
  2023, WOAH 2023, FedCSIS 2023, IEEE ICALT 2024 DIGITEL).
- Applied to all three language profiles (entries are English proper
  nouns, kept verbatim per the academic-CV convention). OCR artifacts
  from the PDF cleaned (`4?6`→`4-6`, `6 ?10`→`6-10`, `17?20`→`17-20`,
  `Pozna?`→`Poznań`, `3nd`→`3rd`); same-venue dual roles shown as
  separate lines as in the CV.

---

## 2026-05-20 — Phase 8.3: Icon theming, eYou, profile bullet cleanup

### "Find me on" icons

- **Thinner border**: the icon tiles' hairline now mixes the line color
  ~55% toward the surface (`color-mix`), so it reads as a lighter, thinner
  edge in both themes.
- **Theme-aware variants**: seven icons now swap light/dark with the
  palette via paired `<img class="theme-img-light/​dark">` + a small CSS
  toggle. Mapping (light theme → dark theme):
  - Semantic Scholar: `Semantic_scholar_logo-square.jpeg` → `semantic-scholar-icon-dark.png`
  - DBLP: `dblp-300x300.png` → `dblp-300x300-dark.png`
  - researchmap: `icon_researchmap.png` → `icon_researchmap-dark.png`
  - Scopus: `scopus.png` → `scopus-dark.png`
  - X / Twitter: `twitterlogo.png` → `twitterlogo-dark.avif`
  - Bluesky: `bluesky-social-dark.png` → `bluesky-social-white.png`
  - ResearchGate: `rg-dark.avif` → `rg-white.png`
  - (`twitterlogo-light` and `rg-dark.png` from the request didn't exist;
    used the real files `twitterlogo-dark.avif` and `rg-dark.avif`.)
  - Ten new image assets added to the repo.
- **New eYou (fediverse) icon** added to the Social group on all three
  home pages: `eYou-logo-neutral.png` → `https://eyou.social/u/ptaszynski`
  (`rel="me"`).

### Profile

- Removed the redundant leading `・` from list items (research interests
  had a double bullet against the CSS `::before "•"`; the activities rows
  had inconsistent `・` prefixes already marked by their left border).
  ~166 per language. Internal `・` (names like ミハウ・プタシンスキ,
  compounds like 攻撃的・暴言的) preserved.

---

## 2026-05-20 — Phase 8.2: Header fit + smartphone pass

### Header / search

- The labeled "Search" pill from 8.1 widened the utility cluster and
  squeezed the centered nav, clipping it on both ends at medium widths.
  Reverted the trigger to a **compact icon button** (same footprint as
  the theme toggle). Clicking still opens the overlay — now with an
  **expand/fade entrance animation** so it reads as "growing" from the
  icon (respects `prefers-reduced-motion`).
- Nav no longer clips on both sides: it's **left-aligned** (overflow now
  only scrolls off the right, the natural affordance), with slightly
  smaller item padding/font and a tighter header gap. Brand name
  truncates with an ellipsis instead of forcing the row wider.

### Smartphone pass

- Base font drops to **16px under 600px**; page padding and big
  headings tightened for phones.
- **Secondary sticky bars go static on mobile** (≤820px): the
  publications toolbar and profile TOC would otherwise tuck under the
  taller two-row mobile header. They now scroll with the page, and the
  sticky-only compress behavior is neutralized there. (`#main`-scoped
  overrides so they beat the per-page inline base rules.)
- Larger tap targets on phones: icon buttons 34 → 38px, bigger
  language-switcher and nav hit areas; tip-jar buttons go full-width.
- `html { overflow-x: clip }` guards against any stray horizontal
  scroll without breaking the sticky header.

---

## 2026-05-20 — Phase 8.1: UX polish, rotating portrait, tip-jar, contact

### Publications

- **BibTeX hover-card now opens rightward** and is viewport-aware:
  `positionBibCard()` measures the card and flips it left (or pins it
  within the viewport) only when opening right would overflow — fixes
  the off-screen-left clipping when the button sat near the left edge.
- **Year dividers**: within each type group, entries are now grouped
  under year sub-headings (pill style), sorted newest-first.
- **Toolbar compresses on scroll**: past 150 px the sticky toolbar
  collapses its filter chips + count (re-expands near the top or while
  the search box is focused), reclaiming vertical space on phones.

### Profile

- **TOC fixed**: background was translucent (`--accent-bg`) so text
  bled through — now opaque `--surface` with a stronger border + shadow.
  Compresses on scroll (hides the label, single scrollable row of links)
  via shared `bindProfileToc()` in `site.js`.

### Rotating portrait (Home + Profile)

- Reinstated the original site's rotating-photo effect with a cross-fade:
  the canonical `ptaszynski.jpg` alternates with `IMG_2645–2650.JPG` and
  `stablediffusion01–04.webp` every 3.6 s. Preloads all frames; honors
  `prefers-reduced-motion`. Lives in `bindPortraitRotator()` (`site.js`),
  targets `.hero__portrait img` and `.profile-meta img` on all languages.

### Support / tip-jar placeholders

- New `.support` component (shared CSS). Home gains a "Support me on /
  応援する / Wesprzyj mnie" group; Research + Demos gain a top banner
  ("Like my research? Buy me a coffee ☕️" / localized). Links to
  Buy Me a Coffee, Ko-fi, Patreon, Gumroad, Patronite — **placeholder
  URLs** (`/ptaszynski`), flagged with HTML comments to update once the
  accounts exist.

### Icons

- researchmap → `images/icon_researchmap.png` (replaces the
  `researchmap_icon.png` + onerror text fallback; JA home now shows the
  icon instead of a text link).
- Google Developers → `images/google-developers.svg` (was `GoogleDev.svg`).
- Both new image assets added to the repo.

### Search discoverability

- The header search trigger is now a labeled pill (magnifier + "Search"
  + `/` key hint) instead of an icon-only button — collapses back to an
  icon under 600 px. (The overlay + `/` hotkey were already there since
  Phase 8; they just weren't obvious.)

### Contact

- Updated affiliation across EN / JA / PL: title **Ph.D., Professor**;
  **Text Information Processing Laboratory**; **Division of Information
  and Communication Engineering, Faculty of Engineering**; phone
  normalized to `+81-157-26-9327` (JA: `0157-26-9327`).

### Decided against

- **Impact-factor refresh** — declined to touch; current IF values are
  embedded inline in venue strings and can't be verified without
  fabricating numbers. Left as-is per the user's call.
- **Google Programmable Search** — kept the built-in offline overlay
  (no Google dependency / tracking); made its trigger more visible
  instead.

---

## 2026-05-19 — Phase 8: Slim pages, hover BibTeX, search, RSS, JA/PL expansion

### Slim down across all pages

- Global `site.css` tightened: body line-height 1.7 → 1.55, h1/h2/h3
  smaller and with tighter margins, `.page` padding 2.5/4 → 1.5/2.5,
  `.page-title` 2.4 → 2 rem, `.page-lede` margin 2.25 → 1.25 rem.
- Hero: gap 2.5 → 1.75, margin 1/3 → 0.35/1.5, portrait 160 → 130 px,
  title 2.6 → 2.15 rem, lede line-height 1.7 → 1.55.
- Entry-point cards padding 1.35/1.2 → 0.95/1.0, h2 1.1 → 1.02 rem.
- News-list rows: 1 rem padding → 0.55 rem, time + p tighter.
- Header padding 0.9 → 0.65 rem; footer margin-top 4 → 2.5 rem.
- Per-page tightening on profile (timeline gap 0.9 → 0.45, dd
  padding 0.9 → 0.45), research (project margin 4 → 2 rem,
  cover 130 → 95 px, project__body p line-height 1.7 → 1.5),
  demos (card padding 1.0/1.1 → 0.65/0.85, kind 0.68 → 0.65 rem),
  publications (toolbar padding 1.0/1.1 → 0.6/0.9, pub-section
  margin 2 → 1.25 rem). photos.htm list rows tightened too.

### Hover-cards on `publications.htm`

- Replaced the row-expansion BibTeX block with a hover-card popover.
  Hovering / focusing the BibTeX button now reveals a floating
  preview to the right; clicking the button copies the entry to
  the clipboard (with a "✓ copied to clipboard" flash). No row
  re-flow, no second copy button. Works with keyboard focus as well.

### Deep-link research → publications

- Each `<em>` in `.project__cites` on `research.htm` (EN / JA / PL)
  is auto-wrapped at runtime with a "→ in Publications" chip that
  points to `publications.htm?q=<first-5-words-of-title>`.
- `publications.htm` now reads `?q=` (and `?type=`) on load,
  pre-fills the search box, and renders the filtered view.

### News-section RSS feed

- New `feed.xml` (RSS 2.0) at site root with the 3 current Latest
  items, ISO pub-dates. Each language home (EN / JA / PL) has a
  `<link rel="alternate" type="application/rss+xml">` for autodiscovery
  and a visible "RSS" chip beside the *Latest / 最新情報 / Aktualności*
  heading.

### Site-wide search

- New `assets/search-index.json` — ~30-entry hand-maintained index
  covering page roots, research projects, demos, and profile sections.
- Magnifier button in the header; `/` keystroke (when not in an
  input) and `⌘/Ctrl+K` open a centered overlay panel with live
  filtering, ↑/↓ to navigate, Enter to open. Fallback "search
  Publications for …" link appears when nothing else matches.
- Search overlay i18n strings added to `I18N` in `site.js`.

### JA / PL translations: profile, research, demos

- New `ja/profile.htm`, `ja/research.htm`, `ja/demos.htm`.
- New `pl/profile.htm`, `pl/research.htm`, `pl/demos.htm`.
- Standard academic-CV practice followed: page chrome (titles,
  section headings, page lede, descriptions, intro paragraphs)
  fully translated; CV listings (institution names, conference
  names, paper titles, grant titles) kept in original form with
  a note explaining the policy.
- Terminology calibrated for naturalness:
  - JA: 感情情報処理, ネットいじめ, 情緒素/情緒表現, 覚醒–沈静,
    低資源言語, 顔文字, 学校裏サイト, 言語復興技術.
  - PL: obliczenia afektywne, cyberprzemoc, wyrażenia emotywne,
    walencja × pobudzenie, języki o niskich zasobach,
    technologie rewitalizacji języków.
- `TRANSLATED_PAGES` in `site.js` extended to include the three
  new translated pages — language switcher now keeps the user in
  the same content section.
- EN pages (`profile.htm`, `research.htm`, `demos.htm`) now declare
  `<link rel="alternate" hreflang="ja">` and `hreflang="pl">`.
- `ja/index.html` and `pl/index.html` entry-point cards updated:
  Research no longer marked as EN-only; intra-page references now
  point to the same-language sibling files (`research.htm#...`,
  `profile.htm#...`).

### Header layout

- Header padding tightened (0.9 → 0.65 rem) to claw back a bit
  more vertical space; sticky-toolbar offsets in Publications
  + Profile TOC bumped from 64 → 60 px to match.

---

## 2026-05-19 — Phase 7: Compact publications, Demos page, profile cleanup

### Publications page — compact + structured BibTeX

- Layout tightened ~40 % vertically: cover 70 → 44 px, padding
  1.1 → 0.55 rem, title 1 → 0.92 rem, author 0.92 → 0.82, venue
  0.88 → 0.78. Empty-cover placeholder no longer pads to 90 px tall.
- BibTeX block: smaller font + tighter padding when expanded.
- New `parseVenue()` extracts **journal / booktitle, volume, number,
  pages, month, address, ISBN, DOI** as separate BibTeX fields —
  matching Scholar's export convention rather than dumping the whole
  venue string into one blob.
- Cite-key generator now CJK-aware (Japanese names: surname first);
  detects ALL-CAPS surname tokens.
- Author splitter handles "X, Y, **and** Z" form so the leading
  "and " no longer becomes part of a surname.
- Stripped 58 residual full-width colons (`Araki：`) from author
  strings — legacy parser artefact.
- BibTeX output verified against CrossRef for four high-profile DOIs
  (IP&M 2026, JORS 2017 ML-Ask, IEEE TAC 2010 CAO, MLKE 2026
  Polyglots) — journal name, volume, number, year all match.

### New Demos page

- `demos.htm`: three sections —
  - **Live demos:** ML-Ask Streamlit, qWALS Streamlit + PyPI,
    POST-AL in-browser, Hugging Face profile.
  - **Datasets & lexicons:** ML-Ask 2024 emotion lexicon, CVS
    structures, CAO emoticon database (with eye/mouth stats), YACIS.
  - **Code releases:** GitHub profile, qWALS repo, ML-Ask 4.3 Perl,
    standalone emoticon detector.
- Added to main nav as **Demos / デモ / Dema**.

### Links page removed

- `links.htm` deleted; its three substantive items (Computational
  Linguistics LinkedIn group, Japonica Creativa, *Hokkaido* book)
  folded into a new **"Elsewhere"** section at the bottom of
  `profile.htm`.

### Profile cleanup

- **Mojibake fix:** `ftfy.fix_text` applied across `profile.htm`
  (text only, tags preserved). ~43 k characters affected, file
  shrank 54 → 52 KB. Japanese in Honours & Awards readable again.
- **Honours & Awards layout fix:** year promoted from a sea of
  `&nbsp;` inside `<dd>` to the proper `<dt>` column.
- **Professional Activities restructured:** 165 flat `<p>` rows
  with sporadic "year ・" prefixes → 15 year-grouped sections with
  proper `<h3>` headings and clean `<ul>` lists. New
  `.activities-year` / `.activities-list` styling with a
  hoverable left border.

### Header nav fix

- The 7-item nav (Home / Profile / Research / Publications / Demos /
  Photos / Contact) was wrapping "Contact" to a second line on
  widths between ~820–1040 px. Now `flex-wrap: nowrap` with a
  hidden-scrollbar horizontal-scroll fallback. Brand subtitle
  ("Affective Computing · NLP · HCI") hides below 820 px to
  free room for the nav.

---

## 2026-05-19 — Phase 6: BibTeX, admin, research-merge, link cleanup

### Publications data cleanup

- Identified and documented a parser bug in the original `parse_pubs.py`
  (lines 148-153 prepended links from `find_previous_sibling()` of each
  `<ul>`, causing every entry to inherit its predecessor's links).
- **62 cross-pub leaked links removed** by signature-confident matching
  (DOI / ISBN / paper-ID / journal-code in URL vs venue).
- **142 venue strings cleaned** of trailing parser-junk like
  `… paper , slides , PyPI , ONLINE DEMO`.
- **116 author strings cleaned** of trailing colons (`Masui:` →
  `Masui`).
- **344 link labels improved** — generic "paper" / "pdf" replaced with
  domain-derived labels: MDPI, DOI, Springer, IEEE, ACL Anthology,
  Hugging Face, GitHub, etc.
- Pre-cleanup snapshot saved as `assets/publications.original.json`
  (gitignored later if desired).

### Spot-checked headline publications

- **p0095 (CAO IEEE TAC 2010):** replaced stale `computer.org/portal`
  URL with canonical IEEE Xplore link + DOI `10.1109/T-AFFC.2010.3`.
- **p0091 (Cyber-Bullying IJCLR 2010):** removed a *wrong* link to
  `cscjournals.org IJCL Vol 2 Issue 1` (a different paper); added
  HUSCAP institutional-repository link and the arXiv preprint.
- **p0222 (PACLING-09 "Affecting Corpora"):** removed a 404 AAAI FSS09
  link (also wrong paper).
- **~10 other pubs** sanity-checked against DBLP / Scholar — no
  further changes needed.

### Publications page UI

- New BibTeX-per-entry: an automatically generated BibTeX entry is
  available behind a `BibTeX` button on every publication. Click to
  toggle, then **Copy** to clipboard. Cite key follows
  `AuthorYearWord` convention; entry type maps from `p.type`
  (book → `inbook`, journal → `article`, conference / local →
  `inproceedings`, dissertation → `phdthesis`, etc.).
- Per-entry override: add a `bibtex` field to any pub in
  `publications.json` and it'll be used instead of the auto-generated
  one.

### Admin form (new `/admin/`)

- Static page at `admin/index.html`, **not linked** from the public
  site — bookmark the URL.
- Authenticates with a GitHub fine-grained Personal Access Token
  scoped to *Contents: Read &amp; Write* on the homepage repo. Token
  stays in `localStorage`; the page only talks to `api.github.com`.
- Friendly form with type / year / title / authors / venue / cover /
  multi-row links, plus an optional BibTeX override field.
- "Preview JSON" shows the entry that will be appended; "Save to
  GitHub" calls the Contents API to commit. Returns a link to the
  commit.

### Research + Repository merger

- Old `repository/*.htm` (eight sub-pages, partly stubs, partly
  ISO-8859-1 mojibake) → deleted.
- New `research.htm` rewritten as a single blog-style page:
  highlights grid up top → eight long-form project sections, each
  with hero image, 2-4 paragraphs of substance, downloads /
  demo / patent links, and preferred citations.
- `repository/files/`, `repository/demo/`, `repository/style.css`,
  `repository/table-images/` retained (referenced from
  `research.htm`).

### Visual polish

- Hero treatment refined: radial accent bloom, larger portrait with
  scale-on-hover.
- Card hover: subtle accent underline animation, gentler lift.
- News list rows now highlight on hover.
- Section heading: short accent underline.
- Profile-icon scale-on-hover, larger touch target.
- Print stylesheet untouched.

### i18n polish

- JA: a few card descriptions polished
  (`英語のみ` → `英語版のみ`, smoother phrasings on the contact
  speaker-invite section).
- All non-translated root pages now declare self-referential `<link
  rel="alternate" hreflang="en">` + `x-default` so the language
  switcher behaves consistently.
- `site.js`: added `data-site-depth` attribute support so the shared
  header works correctly from subdirectories like `/admin/`.

### TODO carried forward

- Zenodo migration of `data/*.pdf` (per user instruction, untouched).
- Photo migration (per user instruction, untouched).
- 302 of the originally-364 duplicate URLs left untouched because
  no single pub signature-matched; the new admin tool makes
  per-entry fixes a 30-second job.

---

## 2026-05-19 — Full modernization

Migration from 2010-era XHTML / Word-exported HTML to a modern, multilingual,
GitHub-Pages-hosted static site.

### Foundation (Phase 1)

- New `assets/site.css` — CSS variables, dark mode (auto + manual toggle),
  responsive layout, print stylesheet. Restyle the site by editing the
  variables at the top.
- New `assets/site.js` — injects shared header / nav / footer into every
  page via `<div data-include="…">`, manages dark-mode and theme persistence,
  keeps © year fresh.
- New `index.html` — hero, three entry-point cards, **Latest** news list,
  about paragraph, grouped social profile grid. UTF-8, OpenGraph,
  JSON-LD Person schema.
- Migrated `contact.htm`, `research.htm`, `links.htm`, `photos.htm` to the
  new template.
- New `page-template.html` — copy this to create new pages.

### Publications (Phase 2)

- New `assets/publications.json` — **406 entries** extracted by Python parser
  from the legacy 223 KB `publications.htm`. Edit this JSON to add a paper
  (one object per entry, newest first within each type).
- New `publications.htm` — data-driven renderer with live search box,
  type-filter chips (Books / Journals / Conferences / etc.), author
  self-highlighting, cover-image fallback to emoji placeholder.

### Profile (Phase 3)

- New `profile.htm` — clean HTML (192 KB Word soup → 57 KB), 9 sections
  (Interests, Education, Positions, Teaching, Grants, Awards, Certificates,
  Memberships, Activities). Timeline + bullet layouts. URLs auto-linkified.
- Mojibake repaired (e.g. `ÃÂ¢ÃÂÃÂ` → `'`); a few legacy entries may
  still need manual cleanup.
- Restored the 2025 promotion to Professor (the most recent
  `profile.htm` was 2025-04 but the parser used `profile_utf.htm` from
  2024-02 which still said "Associate Professor — present").

### GitHub Pages migration (Phase 4)

- `.gitignore` excludes `data/` (526 MB of paper PDFs), `photos/` (138 MB),
  `templety/`, `ccount/`, `.DS_Store`, and all `*_backup*` files.
- `.nojekyll` so Pages serves files as-is, no Jekyll build.
- `README.md` with edit + deploy instructions.
- `404.html` in the site style.
- Deployed to <https://ptaszynski.github.io/>.

### Hybrid translations (Phase 5)

- `/ja/index.html` + `/ja/contact.htm` — Japanese versions.
- `/pl/index.html` + `/pl/contact.htm` — Polish versions.
- Decision: keep `research / profile / publications` English-only
  (academic convention; avoids triple maintenance). Google Translate widget
  rejected — quality is poor on academic content and browsers do this
  natively now.
- Language switcher reads `<link rel="alternate" hreflang>` tags from each
  page's `<head>` to know which languages are available; unavailable
  buttons are disabled with a localized tooltip.
- `site.js` is now lang-aware — brand subtitle, nav labels, theme-toggle
  aria, copyright, and Othello citation switch on `<html lang>`.

### Parsing scripts archived

- `scripts/parse_pubs.py`, `scripts/parse_profile.py`, `scripts/README.md`.
  Not needed day-to-day; kept in case a legacy backup ever needs re-parsing.

---

## Known TODO for future sessions

### Carry-over from earlier phases

| Item | Why | Priority |
|---|---|---|
| Move `data/` (526 MB of paper PDFs) to Zenodo / OSF; bulk-update URLs in `assets/publications.json` | PDF links currently point at `data/*.pdf` paths that don't exist on github.io | **High** |
| Move `photos/` (138 MB) to Google Photos / Flickr / Zenodo; update `photos.htm` links | Per-event links currently 404 on github.io | Medium |
| Native-speaker review of JA / PL translations | Translations are AI-generated and need polish (PL especially — you're the authority) | Medium |
| Manual fix of ~12 residual Japanese characters lost in original encoding round-trip (e.g. `観堉` → `観光`, `案冠` → `案内`) | `ftfy` recovered ~99 % of the mojibake but a handful of multi-byte sequences were truncated in the source | Medium |
| Keep the **Latest** section on `index.html` (+ JA/PL home) fresh | Currently 3 entries spanning 2023-2026 | Ongoing |

### New from Phase 7

| Item | Why | Priority |
|---|---|---|
| Continue auditing the 302 remaining "duplicate-URL across pubs" cases | The structural-cleanup heuristic only confidently fixed 62 of 364; the rest need eyeballs — the new `/admin/` tool makes per-entry edits a 30-second job | Medium |
| Add explicit `bibtex` overrides for CJK-only / irregular-venue entries where the auto-generator produces a weak result (e.g. p0010 *心を交わす人工知能*) | The generator falls back to `Anon2016Paper`-style keys when no Latin surname is parseable | Low |

### Creative ideas worth doing next

| Idea | Sketch | Effort |
|---|---|---|
| **Talks / Keynotes page** | A new `talks.htm` listing invited talks, keynotes, panel appearances — venue, date, topic, slides/video link. Pair with a strong "want me to talk?" CTA. You're advertising availability now; a real list adds credibility | Medium |
| **Students / Lab page** | Standard for academic CVs: list of supervised PhD / MSc / BSc students with thesis title and current position. Helps recruitment + shows lineage | Medium |
| **Press / Media coverage page** | Especially around the cyberbullying-detection patent and the Ainu NLP work — journalism / podcasts / interviews collected in one spot | Low |
| **Standalone Datasets catalog with DOIs** | Deposit ML-Ask lexicon, CVS, CAO emoticon DB and YACIS to Zenodo so each has its own DOI; current Demos page links to ZIPs but they aren't independently citable. Solves the `data/` migration problem AND makes the artefacts properly findable | High once you start the Zenodo migration |
| **JSON-LD `ScholarlyArticle` markup** on `publications.htm` | Better Google Scholar / Semantic Scholar indexing of the on-site list. Roughly one extra `<script type="application/ld+json">` per render | Low |
| ~~**News-section RSS feed**~~ | ✅ Done in Phase 8 — `feed.xml` + autodiscovery on all home pages. | — |
| ~~**Site-wide search**~~ | ✅ Done in Phase 8 — `/` overlay + `assets/search-index.json`. | — |
| ~~**Hover-cards on `publications.htm`**~~ | ✅ Done in Phase 8 — hover shows BibTeX, click copies. | — |
| ~~**Deep-link from research.htm citations into publications.htm filtered view**~~ | ✅ Done in Phase 8 — `?q=` chip on every citation. | — |
| **Custom domain + HTTPS-CNAME** if desired (currently `ptaszynski.github.io`) | Custom domain ≠ free domain. Need to buy a domain at a registrar (~$10–15/yr), add 4 A-records + 1 www CNAME, drop a `CNAME` file in repo root with the domain on one line, tick "Enforce HTTPS" in Pages settings. Let's Encrypt cert auto-provisioned. | Trivial (if domain owned) |

### How to deploy any of these

```bash
# from this worktree:
git add <files> && git commit -m "..."

# then from the main worktree:
cd /Users/michalptaszynski/nlp/strona_backup
git merge --ff-only claude/inspiring-varahamihira-33f01a
git push origin main
# GitHub Pages republishes in ~30–60 s.
```
