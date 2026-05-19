# Changelog

All notable changes to the personal homepage.

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

| Item | Why | Priority |
|---|---|---|
| Move `data/` (526 MB of paper PDFs) to Zenodo / OSF / arXiv; bulk-update URLs in `assets/publications.json` | PDF links in publications page currently point at `data/*.pdf` paths that don't exist on github.io | High |
| Move `photos/` (138 MB) to Google Photos / Flickr; update `photos.htm` links | Per-event links currently 404 on github.io | Medium |
| Native-speaker review of JA / PL translations | Translations are AI-generated and need polish | Medium |
| ~18 / 406 publication entries have no parseable year (sort to bottom of their section); some venue fields contain stray words like "paper", "slides" from looseness in the original markup | Parser was best-effort; entries are easy to fix one-by-one in the JSON | Low |
| Keep the **Latest** section on `index.html` (and JA/PL versions) up to date | Currently has 3 placeholder entries from 2023-2026 | Ongoing |
| The `repository/*.htm` sub-pages (linked from `research.htm` "Read more →") still use the old 2010 stylesheet | Visual whiplash from research → repo sub-page | Low |
| Wire the **Profile**, **Research** etc. pages to read from `<link rel="alternate">` so the switcher tooltips work correctly on every page (currently they correctly disable JA/PL but the tooltip pattern relies on absence of alternates) | Polish issue | Low |
