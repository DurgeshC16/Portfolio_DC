# Handoff: A-shell (design-system foundation and page shells)

Status: done and verified. There were 7 pages × 7 widths (320, 390, 768, 1024, 1366, 1440, 1920). Every combination had 0 console errors, 0 failed requests and 0 horizontal overflow. axe reported 0 violations at 390 and 1440. The legacy lab and notebook contract suite (`_research/scripts/A-shell/labs-regression.js`, 96 checks) passed 96 of 96. Under reduced motion, 0 animations are running 300 ms after load. At idle there are 0 rAF calls per second. Scripts and screenshots are in `_research/scripts/A-shell/`.

## Regions (edit only inside your markers; the markers wrap whole `<section>`s, so you own the section element and its `data-surface`)
| Page | Region → owner | Initial surface / ids kept |
|---|---|---|
| index.html | `hero` → B · `work` → C · `evidence` → D · `bench` → L · `record` → D | hero night `#hero` (h1 `#hero-name`) · work night `#work` · evidence paper `#evidence` · bench paper `#bench` (holds legacy `#showcase`, `[data-lab]`, `[data-project]`) · record paper `#record` (holds `#research`, `#about`) |
| projects/kaaran, tutor, federated | `case-a` → E1 · `bench` → L (`#how-it-works`, legacy `#experiment`) · `case-b` → E1 | `main.detail[data-surface=paper]`. The `.detail .crumb` used by site.js lives in case-a |
| projects/certivault.html (new) | `case-a`, `case-b` → E1 | no bench; sections 1, 3 and 10 seeded per §13.2 |
| projects/notebook.html | `notebook` → E2 | `main.notebook[data-surface=paper]`; all notebook.js IDs intact |
| 404.html (new) | `notfound` → E2 | `main[data-surface=night]`, `noindex` |
| every page | `shell-header`, `shell-footer` → A · `chrome` → CHROME | `chrome` holds the empty `<dialog id="nav-overlay">` and `<dialog id="palette">` so the header's `aria-controls` resolve. Fill them or build the contents from JS |

Migrated legacy content carries the ledger §7 removals: CONFLICT/OMIT copy, the Exam tile, the counters, the co-author link and the S1 repo link. Gaps are marked `<!-- TODO(durgesh) -->`. Arrow glyphs were swapped for sprite icons. `experiments.js` still writes "≈" in the federated equation, and that glyph is outside the font subsets. **L should handle it.**

## Files
- **Mine:** `css/tokens.css`, `css/base.css`, `css/components.css`, `js/core.js`, `assets/icons.svg`, `assets/fonts/*` (10 WOFF2 files plus 3 OFL texts, including `dm-mono-license.txt`), `assets/favicon.svg` (redrawn), and the shell, head and JSON-LD of every page.
- **Stubs created** (one-line owner comment each):
  - CSS: `css/chrome.css` (CHROME), `hero.css` (B), `gallery.css` (C), `home.css` (D), `lab.css` (L), `case.css` (E1), `notfound.css` (E2).
  - JS: `js/hero-truss.js` (B), `gallery.js` (C), `home.js` (D), `case.js` (E1), and `nav.js`, `palette-index.js`, `palette.js`, `cursor.js`, `transitions.js` (all CHROME).
- `css/notebook.css` (E2) is the old `dist/notebook.css`, moved verbatim, plus a scoped shim for the legacy variables `--black` and `--iris`.
- **Deleted:** `dist/style.css`, `dist/navigation.js`, `dist/notebook.css`, `assets/dm-sans.ttf`, `assets/instrument-serif-italic.ttf`. The licences moved to `assets/fonts/`.
- **Head order:** core.js runs first, then the legacy scripts (kaaran-evidence → experiments → site), then the page modules, then CHROME. All are `defer`. Each page preloads exactly two fonts.

## Tokens (all in tokens.css, exactly per §3–6)
- **Colour primitives:** `--c-*` from §3.1, plus the hairlines `--rule-night`, `--rule-night-strong`, `--rule-paper`, `--rule-paper-strong`.
- **Surface aliases (use these):** `--bg --bg-2 --bg-raised --fg --fg-2 --fg-3 --rule --rule-strong --accent --accent-hi --on-accent --focus --mark --error`. Set `data-surface="night|paper"` on any element.
- **Type:** `--f-sans --f-serif --f-serif-i --f-mono --f-deva` and `--t-name --t-display --t-title --t-h2 --t-h3 --t-counter --t-email --t-lead --t-body --t-small --t-caption --t-micro`. `--t-name` switches at 760.
- **Space and grid:**
  - `--s-1…--s-11 --s-section --s-block --s-stack`
  - `--cols` (6, or 12 at ≥ 760) `--margin --gutter --max --page-x --measure`
  - `--header-h` (60, or 72 at ≥ 760): use it for `min-height: calc(100svh - var(--header-h))`
- **Radii and elevation:** `--r-0 --r-1 --r-dot`, `--shadow-plate --shadow-tile --shadow-sheet`.
- **Layers:** `--z-*`.
- **Motion:** `--d-instant --d-response --d-swap --d-travel --d-reveal --d-name --d-assemble`, `--e-out --e-inout --e-response --e-spring`, `--st-letter --st-word --st-line --st-item --st-tile`. Under reduced motion, or when `html[data-motion=reduce]` is set, durations become 1 ms and staggers 0.

## Utilities (base.css)
`.vh` · `.mono` · `.label` (mono 12 caps, fg-2) · `.serif` · `.t-display .t-title .t-h2 .t-h3 .t-lead .t-small .t-caption` · `.fg-2 .fg-3` · `.grid` (12/6 columns with page-x padding) · `.subgrid` · `.wrap` · `.measure` · `.stack` · `.section` · `.prose` · `.focus-any` (the `--c-focus-any` ring for artwork and SVG; `svg [tabindex]` gets it automatically) · `.icon`.

Global behaviour:
- `em` and `i` render as Instrument Serif italic at 1.08em, but at 1em inside headings.
- `[lang=mr]` follows §4.7.
- `a` is accent with a 1 px underline.
- `:focus-visible` gives a 3 px `--focus` ring with a 3 px offset.
- `.is-offscreen` pauses descendant animations.

## Components (components.css): usage
- **Icon:** `<svg class="icon icon--arrow-right" aria-hidden="true" focusable="false"><use href="assets/icons.svg#arrow-right"/></svg>` (prefix `../` on `projects/*`). From JS, use `DC.icon('arrow-right')`.
  - Sprite ids: `arrow-right arrow-left arrow-down arrow-up arrow-up-right external check close menu search cmd command return plus minus copy mail file pdf download play pause reset linkedin github`.
- **Buttons:**
  - `<a class="btn btn--primary" data-magnetic><span class="btn__inner">Explore work <svg class="icon icon--arrow-down">…</svg></span></a>`
  - Variants: `btn--ghost`, `btn--text`, `btn--icon` (48×48, with a `.vh` label), `btn--sm`.
  - `.btn__tag` gives a mono suffix ("PDF · 1 p").
  - Disabled: `aria-disabled="true"`. It stays focusable. **Guard clicks in your own JS.**
  - Hovering nudges the last `.icon` in the arrow's direction. Add `.icon--static` to opt out.
- **Chips:** `<ul class="chips"><li class="chip">Hackathon build</li></ul>`. Never accent.
- **Provenance:** `<span class="prov prov--synthetic">Synthetic data</span>`. Modifiers: (none) = Live demo capture, `--synthetic`, `--aggregate`, `--drawing`, `--run`, `--illustrative`.
- **Evidence:** `<span class="cite" aria-hidden="true">[a]</span><a class="evidence" href="…">Repo <svg class="icon icon--arrow-up-right">…</svg><span class="vh"> (opens external site)</span></a>`.
- **Running head:** `<div class="running-head" aria-hidden="true"><span><b>II</b> — From the archive</span><span>Plates 06–09</span><span>p. 03</span></div>`.
  - Place it inside `.wrap` or `.grid` (it spans `1/-1`).
  - The hairline draws in automatically. The centre cell drops below 760.
- **Section head:** `<div class="grid section-head [section-head--offset]">` + running head + `h2.section-head__title.t-display` + `p.section-head__dek` (cols 4–9) + `p.section-head__note` (cols 10–12). `--offset` puts the title in cols 4–12.
- **Figure:** `<figure class="fig" data-reveal="media"><div class="fig__media">…</div><figcaption class="fig__cap"><span class="fig__no">Fig. 3.2</span> <span class="fig__text">…</span> <span class="prov prov--drawing">Original drawing</span></figcaption></figure>`. For several badges, wrap them in `.fig__badges`.
- **Facts:** `<dl class="facts"><div><dt>Role</dt><dd>…</dd></div>…</dl>`.
  - Layout: 2 columns below 760, 3 from 760 to 1099, one row at ≥ 1100.
  - `.facts--stack` gives label/value rows for decks and sidebars.
- **Metric:** `.metrics > .metric > p.metric__figure(span.metric__value + span.metric__unit) + p.metric__label + p.metric__scope`. The scope line is mandatory.
- **Code:** `.code > .code__bar(.code__path, .code__rev, copy button) + pre[tabindex=0][aria-label]`. Put `.code--lines` on the `pre` or its wrapper, with `<span class="line">` per line. Tones: `.tok-k`, `.tok-c`.
- **Copy:** `<button class="btn btn--ghost copy" data-copy="text" | data-copy-from="#id">`. Inside: `.btn__inner` with `svg.icon.copy__idle`, `svg.icon.copy__done` and `span[data-copy-label]`. Add a sibling `p.vh[aria-live=polite][data-copy-live]`.
  - Optional attributes: `data-copy-done`, `data-copy-done-label`.
  - Copy controls are hidden without JS.
- **Scroll cue (B):** `<a class="scroll-cue" href="#work"><span class="scroll-cue__track" aria-hidden="true"></span><span>Selected work</span></a>`.
  - The tick runs about 2.3 passes, then rests centred.
  - It pauses offscreen and is hidden below 760.
- **`kbd`:** `<kbd class="kbd">K</kbd>`. A `data-kbd-mod` kbd becomes the ⌘ icon (with a "Command" `.vh` label) on Mac.
- **Reveal attributes (DC.reveal):**
  - `data-reveal` or `="lift"` (headings): .5 opacity, .3em lift.
  - `="lines"`: staggers `[data-reveal-item]`, or the direct children if none are marked.
  - `="fade"`: captions.
  - `="rule"`: scaleX.
  - `="media"`: clips `.fig__media` or `[data-reveal-clip]`. The image settles from 1.1 and the caption follows 300 ms later.
  - Put the attribute on the **unclipped wrapper**. Delay with `--reveal-delay`.
  - Start states apply only with `html.js` and motion allowed.

## Header and footer hooks
- **Header attributes:** `header.site-header[data-header][data-surface]` (core.js tracks the surface) and `[data-hidden]` (hidden on scroll-down past 100svh; it shows again on scroll-up or focus-within).
- **Menu trigger:** `button.site-header__index[data-menu-open][aria-controls=nav-overlay][aria-expanded]`. **CHROME:** set `aria-expanded` and call `DC.header.pin(true)` while the overlay is open.
- **Palette trigger:** `button.site-header__search[data-palette-open][aria-controls=palette]`. Both triggers are hidden without JS.
- **Scroll progress:** `span.site-header__progress[data-scroll-progress]`. It is empty, so style it in chrome.css.
- **Page hooks:** `body[data-page=home|case|notebook|notfound]` and `body[data-case=<key>]`. Show the progress bar only on case and notebook pages.
- **Nav current item:** case pages set `aria-current="page"` on Work; the notebook sets it on Notebook. On the home page, core.js scroll-spies the same-page links and sets `aria-current="true"`.
- **Surface tracking:** a section drives the header only if it is at least 90% of the viewport width. The deepest such section wins. Opt out with `data-surface-local`. After injecting surfaces, call `DC.header.refresh()`.
- **Footer:** `footer.credits#contact[data-surface=night]`, with `[data-copy-email]` on the copy button and `[data-copy-live]` on the live region. The Contact link in the nav is `#contact` on every page.

## DC API (js/core.js; `window.DC` is the only global)
- `DC.root` (absolute URL of dist/) · `DC.url(path)` · `DC.email` · `DC.isMac` · `DC.version`
- `DC.prefs.reduce` / `.fine` (live booleans) · `DC.prefs.subscribe(fn(prefs)) → unsubscribe` · `DC.prefs.setMotion('reduce'|'auto')`. `setMotion` is for the palette's "Pause motion": it sets `html[data-motion]`, saves `localStorage['dc.motion']` and removes `.intro`.
- `DC.watchVisibility(el, onIn, onOut) → unwatch`, or `DC.watchVisibility(el, cb(visible, el))`. It uses one shared IntersectionObserver plus `document.hidden`, and toggles `.is-offscreen`.
- `DC.reveal.observe(elOrNodeList)` · `DC.reveal.now(el)`
- `DC.magnetic.attach(el) → detach` · `DC.magnetic.refresh()`. `[data-magnetic]` is bound automatically on fine pointers only.
  - The transform goes on the inner `.btn__inner`, which is created if missing.
  - Pull radius is the box plus 24 px; maximum travel is 6 px; release uses the spring over 480 ms.
  - There is no rAF loop; the work runs only on pointermove.
- `DC.copy(text) → Promise<boolean>` · `DC.copyEmail()` (drives the footer control)
- `DC.header.el` / `.surface` / `.setSurface(s)` (also updates `theme-color`) / `.pin(bool)` / `.refresh()`
- `DC.state.get(key, fallback)` / `DC.state.set(key, value)`. It merges into `history.state` without touching the URL, with a sessionStorage `dc.<key>` fallback. **site.js's `replaceState(null, …)` wipes `history.state`. C: rely on the sessionStorage fallback.**
- `DC.icon(name, {label, className}) → '<svg…>'` · `DC.bind(scope)` (re-wires reveal, magnetic, copy and kbd inside content you inject)
- **Inline head script** (249 bytes, identical on every page): adds `.js`; adds `.intro` unless motion is reduced; applies `localStorage['dc.motion']`.

## Decisions
- **Sticky header:** it is sticky in normal flow, solid and never transparent, rather than "absolute over hero then sticky". That gives no layout shift and identical behaviour on every page.
- **Index and Search:** Index is visible at every width. Search hides below 760, as §10.1 specifies.
- **404 scripts:** the 404 page loads the CHROME scripts too, so the shared header works there. This deviates from §13.4's "core only".
- **Footer:** the label reads "Contact" so it does not repeat the "V — Correspondence" running head. Below 760 the email breaks before "@" and is sized from a measured 7.53em line, so it fits at 320.
- **JSON-LD:**
  - Added: `alumniOf`, address (Pune, IN), LeetCode.
  - LinkedIn uses the canonical `www.` form.
  - Removed "Multi-agent systems" and "Federated learning".
  - No email or phone.

## Known issues and requests
- **Lead:** generate `dist/assets/og/og-default.png` (1200×630). The meta tags already point to it.
- **Lead / Durgesh:** make `og:image` absolute and add a canonical URL once the domain is known (Q-16).
- **404 relative paths:** the CSS breaks if the server serves 404.html under a nested missing path. This needs a `<base>` once the deployment URL is known.
- **CHROME:**
  - Overlay/palette markup goes in `region:chrome` (7 pages), or build it from JS.
  - `pagereveal` may fire before deferred scripts run; consider registering early.
- **L:** remove the "≈" glyph in `experiments.js` (federated equation). Legacy lab styling is gone with style.css: the SVG nodes and the `.weight-plot` bars are unstyled until lab.css is written.
- **D, C, E1, E2:** migrated legacy content is unstyled by design; replace it.
