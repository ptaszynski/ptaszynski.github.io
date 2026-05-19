# One-shot parsing scripts

These were used to migrate the legacy Word-exported `profile.htm` and the
hand-curated `publications.htm` into the modern site format.

They are kept here in case you want to re-run them against an old backup,
but **day to day they should not be needed** — going forward:

- To add a publication, edit `assets/publications.json`.
- To edit your CV, edit `profile.htm` directly (it is now clean HTML).

## Rerunning (only if needed)

Requires `python3` and a venv with `beautifulsoup4` + `ftfy`:

```bash
python3 -m venv /tmp/htmlparse
/tmp/htmlparse/bin/pip install beautifulsoup4 ftfy

# Re-extract publications.json from a historical publications.htm
/tmp/htmlparse/bin/python scripts/parse_pubs.py

# Re-extract profile.htm from a historical profile_utf.htm
/tmp/htmlparse/bin/python scripts/parse_profile.py
```

Both scripts have hardcoded source/output paths near the top — adjust as
needed before re-running.
