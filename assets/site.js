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
			       publications: "Publications", links: "Links", photos: "Photos", contact: "Contact" },
			skipLink: "Skip to content",
			themeToggle: "Toggle light / dark",
			langLabel: "Language",
			notTranslated: "Only available in English",
			copyright: "© 2010–{year} Michal Ptaszynski",
			quoteCite: "— Shakespeare, <i>Othello</i>, 4.2",
		},
		ja: {
			brand: "ミハウ・プタシンスキ",
			role: "感情情報処理・自然言語処理・HCI",
			brandAria: "ミハウ・プタシンスキ — ホーム",
			nav: { home: "ホーム", profile: "プロフィール", research: "研究",
			       publications: "業績", links: "リンク", photos: "写真", contact: "連絡先" },
			skipLink: "本文へスキップ",
			themeToggle: "ライト・ダークモード切替",
			langLabel: "言語",
			notTranslated: "英語版のみ",
			copyright: "© 2010–{year} ミハウ・プタシンスキ",
			quoteCite: "— シェイクスピア『オセロー』 第4幕 第2場",
		},
		pl: {
			brand: "Michał Ptaszyński",
			role: "Obliczenia afektywne · NLP · HCI",
			brandAria: "Michał Ptaszyński — strona główna",
			nav: { home: "Strona główna", profile: "Profil", research: "Badania",
			       publications: "Publikacje", links: "Linki", photos: "Zdjęcia", contact: "Kontakt" },
			skipLink: "Przejdź do treści",
			themeToggle: "Przełącz tryb jasny / ciemny",
			langLabel: "Język",
			notTranslated: "Dostępne tylko po angielsku",
			copyright: "© 2010–{year} Michał Ptaszyński",
			quoteCite: "— Szekspir, <i>Otello</i>, akt 4, scena 2",
		},
	};

	// Nav items by id (labels come from I18N.nav).
	const NAV_ITEMS = [
		{ id: "home",         href: "index.html" },
		{ id: "profile",      href: "profile.htm" },
		{ id: "research",     href: "research.htm" },
		{ id: "publications", href: "publications.htm" },
		{ id: "links",        href: "links.htm" },
		{ id: "photos",       href: "photos.htm" },
		{ id: "contact",      href: "contact.htm" },
	];

	// Pages that have /ja/ and /pl/ translations. From a translated page,
	// only these resolve within the same /ja/ folder; everything else
	// needs to walk up one level back to the EN root.
	const TRANSLATED_PAGES = new Set(["index.html", "contact.htm"]);

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

	function navHrefFor(item) {
		// From an EN root page, hrefs are bare filenames.
		// From a /ja/ or /pl/ page, untranslated items need "../".
		if (currentLang() === "en") return item.href;
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

	/* ----- Slot injection ----- */

	function injectSlot(name, html) {
		document.querySelectorAll(`[data-include="${name}"]`).forEach(el => {
			el.outerHTML = html;
		});
	}

	function init() {
		injectSlot("header", renderHeader());
		injectSlot("footer", renderFooter());
		bindThemeToggle();
	}

	initTheme(); // run early to avoid a flash of the wrong palette
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
