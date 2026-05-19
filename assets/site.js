/* ============================================================
   Michal Ptaszynski — site script
   - Injects shared header / nav / footer into every page
   - Manages dark-mode toggle (with system preference fallback)
   - Keeps copyright year fresh
   - Multilingual (EN / JA / PL) — the page declares its language
     via <html lang="…"> and its available translations via
     <link rel="alternate" hreflang="…" href="…"> in <head>.

   To add a new page to the nav, edit NAV_ITEMS below.
   To translate a new page in JA or PL: create a sibling under /ja/
   or /pl/, add its filename to TRANSLATED_PAGES, and add
   <link rel="alternate"> tags to BOTH the EN page and the new page.
   ============================================================ */

(function () {
	"use strict";

	const I18N = {
		en: {
			brand: "Michal Ptaszynski",
			role: "Affective Computing · NLP · HCI",
			brandAria: "Michal Ptaszynski — home",
			nav: { home: "Home", profile: "Profile", research: "Research",
			       publications: "Publications", demos: "Demos", photos: "Photos", contact: "Contact" },
			skipLink: "Skip to content",
			themeToggle: "Toggle light / dark",
			langLabel: "Language",
			notTranslated: "Only available in English",
			copyright: "© 2010–{year} Michal Ptaszynski",
			quoteCite: "— Shakespeare, <i>Othello</i>, 4.2",
			search: "Search",
			searchPlaceholder: "Search the site…",
			searchHint: "press <kbd>/</kbd> anywhere to search",
			searchNothing: "No matches.",
			searchInPubs: "Search publications for",
		},
		ja: {
			brand: "ミハウ・プタシンスキ",
			role: "感情情報処理・自然言語処理・HCI",
			brandAria: "ミハウ・プタシンスキ — ホーム",
			nav: { home: "ホーム", profile: "プロフィール", research: "研究",
			       publications: "業績", demos: "デモ", photos: "写真", contact: "連絡先" },
			skipLink: "本文へスキップ",
			themeToggle: "ライト・ダークモード切替",
			langLabel: "言語",
			notTranslated: "英語版のみ",
			copyright: "© 2010–{year} ミハウ・プタシンスキ",
			quoteCite: "— シェイクスピア『オセロー』 第4幕 第2場",
			search: "サイト内検索",
			searchPlaceholder: "サイト内を検索…",
			searchHint: "<kbd>/</kbd> キーで検索",
			searchNothing: "該当なし。",
			searchInPubs: "業績ページで検索",
		},
		pl: {
			brand: "Michał Ptaszyński",
			role: "Obliczenia afektywne · NLP · HCI",
			brandAria: "Michał Ptaszyński — strona główna",
			nav: { home: "Strona główna", profile: "Profil", research: "Badania",
			       publications: "Publikacje", demos: "Dema", photos: "Zdjęcia", contact: "Kontakt" },
			skipLink: "Przejdź do treści",
			themeToggle: "Przełącz tryb jasny / ciemny",
			langLabel: "Język",
			notTranslated: "Dostępne tylko po angielsku",
			copyright: "© 2010–{year} Michał Ptaszyński",
			quoteCite: "— Szekspir, <i>Otello</i>, akt 4, scena 2",
			search: "Szukaj",
			searchPlaceholder: "Szukaj na stronie…",
			searchHint: "naciśnij <kbd>/</kbd>",
			searchNothing: "Brak wyników.",
			searchInPubs: "Szukaj w publikacjach",
		},
	};

	// Nav items by id (labels come from I18N.nav).
	const NAV_ITEMS = [
		{ id: "home",         href: "index.html" },
		{ id: "profile",      href: "profile.htm" },
		{ id: "research",     href: "research.htm" },
		{ id: "publications", href: "publications.htm" },
		{ id: "demos",        href: "demos.htm" },
		{ id: "photos",       href: "photos.htm" },
		{ id: "contact",      href: "contact.htm" },
	];

	// Pages that have /ja/ and /pl/ translations. From a translated page,
	// only these resolve within the same /ja/ folder; everything else
	// needs to walk up one level back to the EN root.
	const TRANSLATED_PAGES = new Set([
		"index.html", "contact.htm",
		"profile.htm", "research.htm", "demos.htm",
	]);

	const LANG_ORDER = ["en", "ja", "pl"];
	const LANG_LABEL = { en: "EN", ja: "日本語", pl: "PL" };

	const QUOTE_TEXT = "I understand a fury in your words, but not your words.";

	/* ----- Helpers ----- */

	function currentLang() {
		const l = (document.documentElement.getAttribute("lang") || "en").split("-")[0];
		return I18N[l] ? l : "en";
	}

	function t() { return I18N[currentLang()]; }

	function currentPageName() {
		const p = location.pathname.split("/").pop();
		return p || "index.html";
	}

	function escapeAttr(s) { return String(s).replace(/"/g, "&quot;"); }

	function inSubdir() {
		// True if this page lives one level below the site root (admin, repository, etc.)
		// — i.e. nav hrefs need a "../" prefix to reach root pages.
		// Reads <html data-site-depth="N"> or <body data-site-depth="N">; defaults to 0
		// for EN root pages.
		const dom = document.documentElement;
		const body = document.body;
		const explicit = dom.getAttribute("data-site-depth") ||
		                 (body && body.getAttribute("data-site-depth"));
		if (explicit != null) return parseInt(explicit, 10) > 0;
		// JA/PL handled by language fallthrough below
		return false;
	}

	function navHrefFor(item) {
		// From an EN root page, hrefs are bare filenames.
		// From a /ja/ or /pl/ page, untranslated items need "../".
		// From other subdirs (admin/, repository/), all items need "../".
		if (currentLang() === "en") {
			return inSubdir() ? "../" + item.href : item.href;
		}
		return TRANSLATED_PAGES.has(item.href) ? item.href : "../" + item.href;
	}

	function readAlternates() {
		const out = {};
		document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(link => {
			const code = link.getAttribute("hreflang").toLowerCase().split("-")[0];
			if (code === "x-default") return;
			out[code] = link.getAttribute("href");
		});
		return out;
	}

	/* ----- Header / nav ----- */

	function renderHeader() {
		const lang = currentLang();
		const s = t();
		const cur = currentPageName();
		const alts = readAlternates();

		const navHtml = NAV_ITEMS.map(it => {
			const active = it.href === cur ? ' aria-current="page"' : "";
			return `<a href="${escapeAttr(navHrefFor(it))}"${active}>${s.nav[it.id]}</a>`;
		}).join("");

		const langButtons = LANG_ORDER.map(code => {
			const label = LANG_LABEL[code];
			const isActive = code === lang;
			if (isActive) {
				return `<button type="button" class="lang-btn is-active" aria-pressed="true" lang="${code}">${label}</button>`;
			}
			const href = alts[code];
			if (href) {
				return `<a class="lang-btn" href="${escapeAttr(href)}" lang="${code}" hreflang="${code}">${label}</a>`;
			}
			return `<button type="button" class="lang-btn" lang="${code}" title="${escapeAttr(s.notTranslated)}" disabled>${label}</button>`;
		}).join("");

		return `
		<a class="skip-link" href="#main">${s.skipLink}</a>
		<header class="site-header" role="banner">
			<div class="site-header__inner">
				<a class="site-brand" href="${navHrefFor({id:'home', href:'index.html'})}" aria-label="${escapeAttr(s.brandAria)}">
					<span class="site-brand__name">${s.brand}</span>
					<span class="site-brand__role">${s.role}</span>
				</a>
				<nav class="site-nav" role="navigation" aria-label="${escapeAttr(s.langLabel === 'Language' ? 'Main' : s.langLabel)}">${navHtml}</nav>
				<div class="site-utility">
					<button class="site-search-btn" type="button" aria-label="${escapeAttr(s.search)}" title="${escapeAttr(s.search)} ( / )">
						<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<circle cx="11" cy="11" r="7"/>
							<line x1="21" y1="21" x2="16.65" y2="16.65"/>
						</svg>
					</button>
					<button class="theme-toggle" type="button" aria-label="${escapeAttr(s.themeToggle)}" title="${escapeAttr(s.themeToggle)}">
						<svg class="icon-sun" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
							<circle cx="12" cy="12" r="4"/>
							<g stroke="currentColor" stroke-width="2" stroke-linecap="round">
								<line x1="12" y1="2" x2="12" y2="4"/>
								<line x1="12" y1="20" x2="12" y2="22"/>
								<line x1="2" y1="12" x2="4" y2="12"/>
								<line x1="20" y1="12" x2="22" y2="12"/>
								<line x1="4.2" y1="4.2" x2="5.6" y2="5.6"/>
								<line x1="18.4" y1="18.4" x2="19.8" y2="19.8"/>
								<line x1="4.2" y1="19.8" x2="5.6" y2="18.4"/>
								<line x1="18.4" y1="5.6" x2="19.8" y2="4.2"/>
							</g>
						</svg>
						<svg class="icon-moon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
							<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
						</svg>
					</button>
					<div class="lang-switcher" role="group" aria-label="${escapeAttr(s.langLabel)}">${langButtons}</div>
				</div>
			</div>
		</header>`;
	}

	/* ----- Footer ----- */

	function renderFooter() {
		const year = new Date().getFullYear();
		const s = t();
		return `
		<footer class="site-footer" role="contentinfo">
			<div class="site-footer__inner">
				<p class="site-footer__copy">${s.copyright.replace("{year}", year)}</p>
				<p class="site-footer__quote">
					<em lang="en">“${QUOTE_TEXT}”</em>
					<span class="site-footer__cite">${s.quoteCite}</span>
				</p>
			</div>
		</footer>`;
	}

	/* ----- Theme ----- */

	function applyTheme(theme) {
		document.documentElement.dataset.theme = theme;
		try { localStorage.setItem("theme", theme); } catch (e) { /* private mode */ }
	}

	function initTheme() {
		let saved = null;
		try { saved = localStorage.getItem("theme"); } catch (e) {}
		if (saved === "light" || saved === "dark") {
			applyTheme(saved);
			return;
		}
		const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
		applyTheme(prefersDark ? "dark" : "light");
	}

	function bindThemeToggle() {
		const btn = document.querySelector(".theme-toggle");
		if (!btn) return;
		btn.addEventListener("click", () => {
			const cur = document.documentElement.dataset.theme;
			applyTheme(cur === "dark" ? "light" : "dark");
		});
	}

	/* ----- Site-wide search ----- */

	function rootPrefix() {
		// JA/PL pages and other subdirs need "../" to reach the root.
		if (currentLang() !== "en") return "../";
		return inSubdir() ? "../" : "";
	}

	let searchState = { index: null, loading: false, results: [], cursor: 0 };

	function renderSearchOverlay() {
		const s = t();
		const wrap = document.createElement("div");
		wrap.className = "site-search-overlay";
		wrap.setAttribute("role", "dialog");
		wrap.setAttribute("aria-modal", "true");
		wrap.setAttribute("aria-label", s.search);
		wrap.hidden = true;
		wrap.innerHTML = `
			<div class="site-search-overlay__backdrop" data-search-close></div>
			<div class="site-search-overlay__panel">
				<div class="site-search-overlay__inputrow">
					<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<circle cx="11" cy="11" r="7"/>
						<line x1="21" y1="21" x2="16.65" y2="16.65"/>
					</svg>
					<input type="search" class="site-search-overlay__input" placeholder="${escapeAttr(s.searchPlaceholder)}" aria-label="${escapeAttr(s.search)}" autocomplete="off">
					<button type="button" class="site-search-overlay__close" data-search-close aria-label="Close">Esc</button>
				</div>
				<div class="site-search-overlay__results" role="listbox"></div>
				<div class="site-search-overlay__footer">${s.searchHint} · <kbd>↑</kbd> <kbd>↓</kbd> navigate · <kbd>↵</kbd> open</div>
			</div>`;
		document.body.appendChild(wrap);
		return wrap;
	}

	async function loadSearchIndex() {
		if (searchState.index || searchState.loading) return searchState.index;
		searchState.loading = true;
		try {
			const r = await fetch(rootPrefix() + "assets/search-index.json", { cache: "no-cache" });
			if (!r.ok) throw new Error("HTTP " + r.status);
			const data = await r.json();
			searchState.index = (data.entries || []).map(e => ({
				...e,
				_hay: (e.title + " " + e.snippet + " " + (e.kind || "")).toLowerCase(),
			}));
		} catch (e) {
			console.error("Search index load failed:", e);
			searchState.index = [];
		}
		searchState.loading = false;
		return searchState.index;
	}

	function searchQuery(q) {
		q = (q || "").trim().toLowerCase();
		if (!q || !searchState.index) return [];
		const toks = q.split(/\s+/).filter(Boolean);
		const scored = [];
		for (const entry of searchState.index) {
			let score = 0;
			for (const tok of toks) {
				const inTitle = entry.title.toLowerCase().includes(tok);
				const inHay = entry._hay.includes(tok);
				if (!inHay) { score = -1; break; }
				score += inTitle ? 3 : 1;
			}
			if (score > 0) scored.push({ entry, score });
		}
		scored.sort((a, b) => b.score - a.score);
		return scored.slice(0, 24).map(x => x.entry);
	}

	function escHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

	function searchResultUrl(entry) {
		if (/^https?:\/\//.test(entry.url)) return entry.url;
		return rootPrefix() + entry.url;
	}

	function renderSearchResults(overlay, query) {
		const s = t();
		const box = overlay.querySelector(".site-search-overlay__results");
		searchState.results = searchQuery(query);
		searchState.cursor = 0;

		if (!query) {
			box.innerHTML = "";
			return;
		}

		if (!searchState.results.length) {
			// Offer a publications-page fallback even when nothing in the
			// site index matches — the user might be searching for a paper.
			box.innerHTML =
				`<p class="site-search-overlay__empty">${escHtml(s.searchNothing)}</p>` +
				`<a class="site-search-overlay__result is-fallback" href="${escapeAttr(rootPrefix() + "publications.htm?q=" + encodeURIComponent(query))}">` +
					`<span class="site-search-overlay__kind">→</span>` +
					`<span class="site-search-overlay__body">` +
						`<strong>${escHtml(s.searchInPubs)}: “${escHtml(query)}”</strong>` +
					`</span>` +
				`</a>`;
			searchState.results = [{ url: "publications.htm?q=" + encodeURIComponent(query), title: s.searchInPubs, snippet: query, kind: "fallback" }];
			return;
		}

		box.innerHTML = searchState.results.map((r, i) =>
			`<a class="site-search-overlay__result${i === 0 ? " is-active" : ""}" href="${escapeAttr(searchResultUrl(r))}" data-i="${i}">` +
				`<span class="site-search-overlay__kind">${escHtml(r.kind || "")}</span>` +
				`<span class="site-search-overlay__body">` +
					`<strong>${escHtml(r.title)}</strong>` +
					`<span class="site-search-overlay__snippet">${escHtml(r.snippet || "")}</span>` +
				`</span>` +
			`</a>`
		).join("");
	}

	function moveCursor(overlay, dir) {
		if (!searchState.results.length) return;
		searchState.cursor = (searchState.cursor + dir + searchState.results.length) % searchState.results.length;
		overlay.querySelectorAll(".site-search-overlay__result").forEach((el, i) => {
			el.classList.toggle("is-active", i === searchState.cursor);
			if (i === searchState.cursor) el.scrollIntoView({ block: "nearest" });
		});
	}

	function openSearch(overlay) {
		overlay.hidden = false;
		document.body.classList.add("has-search-open");
		const input = overlay.querySelector(".site-search-overlay__input");
		input.value = "";
		renderSearchResults(overlay, "");
		setTimeout(() => input.focus(), 10);
		loadSearchIndex();
	}

	function closeSearch(overlay) {
		overlay.hidden = true;
		document.body.classList.remove("has-search-open");
	}

	function bindSearch() {
		const overlay = renderSearchOverlay();
		const input = overlay.querySelector(".site-search-overlay__input");

		// Header button
		document.querySelectorAll(".site-search-btn").forEach(b => {
			b.addEventListener("click", () => openSearch(overlay));
		});

		// Backdrop / Esc-button close
		overlay.querySelectorAll("[data-search-close]").forEach(el => {
			el.addEventListener("click", () => closeSearch(overlay));
		});

		// Input
		let debounce;
		input.addEventListener("input", () => {
			clearTimeout(debounce);
			debounce = setTimeout(() => renderSearchResults(overlay, input.value), 90);
		});
		input.addEventListener("keydown", (e) => {
			if (e.key === "ArrowDown") { e.preventDefault(); moveCursor(overlay, +1); }
			else if (e.key === "ArrowUp") { e.preventDefault(); moveCursor(overlay, -1); }
			else if (e.key === "Enter") {
				const r = searchState.results[searchState.cursor];
				if (r) { window.location.href = searchResultUrl(r); }
			} else if (e.key === "Escape") { closeSearch(overlay); }
		});

		// Result click bubbles up normally — no special handling needed.

		// Global hotkeys: "/" opens (when not in an input); Esc closes.
		document.addEventListener("keydown", (e) => {
			if (overlay.hidden) {
				const inEditable = e.target && (
					/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) ||
					e.target.isContentEditable
				);
				if (e.key === "/" && !inEditable && !e.metaKey && !e.ctrlKey && !e.altKey) {
					e.preventDefault(); openSearch(overlay);
				}
				if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
					e.preventDefault(); openSearch(overlay);
				}
			} else if (e.key === "Escape") {
				closeSearch(overlay);
			}
		});
	}

	/* ----- Slot injection ----- */

	function injectSlot(name, html) {
		document.querySelectorAll(`[data-include="${name}"]`).forEach(el => {
			el.outerHTML = html;
		});
	}

	/* ----- Rotating portrait (Home hero + Profile photo) -----
	   Reproduces the original site's effect: the canonical portrait
	   alternates with candid / generated photos every few seconds,
	   here with a gentle cross-fade. Honors prefers-reduced-motion. */

	const ROTATION_IMAGES = [
		"ptaszynski.jpg", "IMG_2645.JPG",
		"ptaszynski.jpg", "IMG_2646.JPG",
		"ptaszynski.jpg", "IMG_2647.JPG",
		"ptaszynski.jpg", "IMG_2648.JPG",
		"ptaszynski.jpg", "IMG_2649.JPG",
		"ptaszynski.jpg", "IMG_2650.JPG",
		"ptaszynski.jpg", "stablediffusion01.webp",
		"ptaszynski.jpg", "stablediffusion02.webp",
		"ptaszynski.jpg", "stablediffusion03.webp",
		"ptaszynski.jpg", "stablediffusion04.webp",
	];

	function bindPortraitRotator() {
		if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const targets = document.querySelectorAll(".hero__portrait img, .profile-meta img");
		if (!targets.length) return;

		targets.forEach(img => {
			const src0 = img.getAttribute("src") || "";
			const slash = src0.lastIndexOf("/");
			const dir = slash >= 0 ? src0.slice(0, slash + 1) : "";
			const urls = ROTATION_IMAGES.map(f => dir + f);

			// Preload so swaps are instant (no flash mid-fade).
			urls.forEach(u => { const i = new Image(); i.src = u; });

			// Keep any existing transform transition (hero hover-scale).
			img.style.transition = "opacity .6s ease, transform .3s ease";

			let idx = 0;
			setInterval(() => {
				idx = (idx + 1) % urls.length;
				const next = urls[idx];
				img.style.opacity = "0";
				setTimeout(() => {
					img.src = next;
					requestAnimationFrame(() => { img.style.opacity = "1"; });
				}, 600);
			}, 3600);
		});
	}

	/* ----- Profile TOC compact-on-scroll ----- */

	function bindProfileToc() {
		const toc = document.querySelector(".profile-toc");
		if (!toc) return;
		const onScroll = () => {
			toc.classList.toggle("is-compact", window.scrollY > 150);
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		onScroll();
	}

	function init() {
		injectSlot("header", renderHeader());
		injectSlot("footer", renderFooter());
		bindThemeToggle();
		bindSearch();
		bindProfileToc();
		bindPortraitRotator();
	}

	initTheme(); // run early to avoid a flash of the wrong palette
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
