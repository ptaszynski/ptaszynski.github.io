# Michal Ptaszynski — personal homepage

Source for [my personal site](https://ptaszynski.github.io/) (or wherever it ends up hosted).

Plain static HTML / CSS / JS. No build step. Deploys directly to **GitHub
Pages**, Netlify Drop, Cloudflare Pages, or any static host.

## Editing day-to-day

| What you want to change | Where |
|---|---|
| The home page | `index.html` |
| Your CV / profile | `profile.htm` (clean HTML; edit inline) |
| Add a new paper | `assets/publications.json` — append one object, newest on top |
| Add a new research project | `research.htm` |
| Top-menu links | `NAV_ITEMS` array in `assets/site.js` |
| Site colors / fonts | CSS variables at the top of `assets/site.css` |
| Header / footer (every page) | `renderHeader()` / `renderFooter()` in `assets/site.js` |
| Add a brand-new page | Copy `page-template.html`, fill it in, optionally add to `NAV_ITEMS` |

## Local preview

Because the publications page fetches `assets/publications.json`, you need a
local HTTP server — opening `index.html` with `file://` won't load JSON.

```bash
cd /path/to/this/repo
python3 -m http.server 8000
# open http://localhost:8000/
```

## Folder layout

```
.
├── index.html               # home
├── profile.htm              # CV
├── research.htm             # projects
├── publications.htm         # JSON-driven; renders assets/publications.json
├── links.htm
├── photos.htm               # event index; per-event galleries are not in repo
├── contact.htm
├── page-template.html       # skeleton to copy when adding a new page
├── 404.html
├── assets/
│   ├── site.css             # all visual styling (CSS variables on top)
│   ├── site.js              # shared header / nav / footer / dark-mode
│   └── publications.json    # 406 entries; edit to add papers
├── images/                  # photos, logos, paper covers
├── flags/                   # language-switcher flag icons
├── repository/              # "Read more →" sub-pages for research projects
├── spec-repository/         # SPEC binary
└── scripts/                 # one-shot parsers used during the rebuild
```

## Excluded from the published site (see `.gitignore`)

- `data/` — 526 MB of paper PDFs. Move to Zenodo / OSF / arXiv / Drive
  and update links in `assets/publications.json` to point at the new URLs.
- `photos/` — 138 MB of conference photos. Move to Google Photos or Flickr;
  update `photos.htm` links.
- `templety/`, `ccount/` — unused/legacy.
- `*_backup*`, `*_stary*`, old stylesheets — kept on disk, not deployed.

## Deploying to GitHub Pages

1. Create a new repo on GitHub (e.g. `ptaszynski.github.io` for the
   user-site URL, or any repo name for a `/<repo>/` path).
2. Push this folder:
   ```bash
   gh repo create ptaszynski.github.io --public --source=. --remote=origin --push
   # …or, manually:
   git remote add origin git@github.com:<username>/<repo>.git
   git push -u origin main
   ```
3. In the repo on github.com → **Settings → Pages**, set the source to
   the `main` branch / `/` (root). Save.
4. Your site is live at `https://<username>.github.io/` (or
   `https://<username>.github.io/<repo>/`).

The `.nojekyll` file in the root tells Pages to serve files as-is and skip
the default Jekyll build, so any `_underscore` filenames (in case you add
them later) work normally.

## Custom domain

Drop a `CNAME` file in the root containing your domain (one line). Then
add the DNS records described in [GitHub's
docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

## Light & dark mode

The site respects the OS-level `prefers-color-scheme` setting on first
load. The sun / moon icon in the top-right toggles manually and remembers
the choice in `localStorage`.

## Languages

The header has an EN / 日本語 / PL switcher. Currently EN is the only
active language; JA and PL are placeholders. The plan is sibling `/ja/`
and `/pl/` folders for fully translated home + contact pages, with
`<link rel="alternate" hreflang>` tags so Google indexes them correctly.
