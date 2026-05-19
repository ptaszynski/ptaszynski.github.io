/* ============================================================
   Michal Ptaszynski — site script
   - Injects shared header / nav / footer into every page
   - Manages dark-mode toggle (with system preference fallback)
   - Keeps copyright year fresh

   To add a new page to the nav, edit NAV_ITEMS below.
   ============================================================ */

(function () {
	"use strict";

	const NAV_ITEMS = [
		{ href: "index.html",       label: "Home" },
		{ href: "profile.htm",      label: "Profile" },
		{ href: "research.htm",     label: "Research" },
		{ href: "publications.htm", label: "Publications" },
		{ href: "links.htm",        label: "Links" },
		{ href: "photos.htm",       label: "Photos" },
		{ href: "contact.htm",      label: "Contact" }
	];

	const QUOTE_TEXT = "I understand a fury in your words, but not your words.";
	const QUOTE_CITE = "— Shakespeare, <i>Othello</i>, 4.2";

	function currentPageName() {
		const path = location.pathname.split("/").pop();
		return path || "index.html";
	}

	function escapeAttr(s) {
		return String(s).replace(/"/g, "&quot;");
	}

	/* ----- Header / nav ----- */

	function renderHeader() {
		const cur = currentPageName();
		const navHtml = NAV_ITEMS.map(it => {
			const active = it.href === cur ? ' aria-current="page"' : "";
			return `<a href="${escapeAttr(it.href)}"${active}>${it.label}</a>`;
		}).join("");

		return `
		<a class="skip-link" href="#main">Skip to content</a>
		<header class="site-header" role="banner">
			<div class="site-header__inner">
				<a class="site-brand" href="index.html" aria-label="Michal Ptaszynski — home">
					<span class="site-brand__name">Michal Ptaszynski</span>
					<span class="site-brand__role">Affective Computing · NLP · HCI</span>
				</a>
				<nav class="site-nav" role="navigation" aria-label="Main">${navHtml}</nav>
				<div class="site-utility">
					<button class="theme-toggle" type="button" aria-label="Toggle color theme" title="Toggle light / dark">
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
					<div class="lang-switcher" role="group" aria-label="Language">
						<button type="button" class="lang-btn is-active" aria-pressed="true">EN</button>
						<button type="button" class="lang-btn" title="Coming soon" disabled>日本語</button>
						<button type="button" class="lang-btn" title="Coming soon" disabled>PL</button>
					</div>
				</div>
			</div>
		</header>`;
	}

	/* ----- Footer ----- */

	function renderFooter() {
		const year = new Date().getFullYear();
		return `
		<footer class="site-footer" role="contentinfo">
			<div class="site-footer__inner">
				<p class="site-footer__copy">© 2010–${year} Michal Ptaszynski</p>
				<p class="site-footer__quote">
					<em>“${QUOTE_TEXT}”</em>
					<span class="site-footer__cite">${QUOTE_CITE}</span>
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

	/* Apply theme as early as possible to avoid a flash of the wrong palette. */
	initTheme();

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
