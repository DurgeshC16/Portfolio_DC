# Handoff: B-hero (home hero + Fig. 1 truss)

Status: done and verified in Chromium (Playwright) at 320, 390, 768, 1024, 1100, 1280, 1366, 1440 and 1920.
- **Overflow and CLS:** 0 horizontal overflow at every width. CLS from the hero is 0.0000 at 320, 390, 768 and 1440.
- **Axe:** 0 violations on `#hero` at 390 and 1440.
- **Errors:** no console errors from hero code.
- **rAF:** 0 per second at idle, offscreen, after the pointer leaves, with the pointer resting inside, and after a replay settles.
- **Reduced motion:** 0 running hero animations 300 ms after load, and the readout says `static`.
- **Cost:** script init is about 2 ms. `draw()` takes a median 0.3 ms per frame (p95 0.7 ms) at DPR 2 and 1440.
- **Scripts and screenshots:** `_research/scripts/B-hero/`. Use `shots.js`, `checks.js`, `cls.js`, `raf.js` and `perf.js`. `serve.py` is a static server with a bigger listen backlog. `python -m http.server` dropped connections under Playwright load.

## Files (mine)
- `dist/index.html`, inside `region:hero` only. It is the whole `<section class="hero grid" id="hero" data-surface="night">`.
- `dist/css/hero.css`
- `dist/js/hero-truss.js`
- `dist/assets/fig-dc-truss.svg`: the no-JS / no-canvas poster, 3.9 KB. It uses the same framing as the canvas, so they match pixel for pixel.
- `dist/assets/fig-dc-truss-404.svg`: the variant for E2's 404 page, 4.2 KB. Details under "Public hooks".
- Generator, kept outside dist per MF-35: `_research/scripts/B-hero/build-truss-svg.js`. It asserts 51 nodes, 97 edges, no edge on the stop and no D–C bridge. Run it with `node build-truss-svg.js`.

## What is built
- **DOM order is the mobile order:** h1, then copy (claim, sub-copy, CTAs), then facts, then Fig. 1, then the scroll cue. CSS grid rearranges it at larger widths:
  - **≥ 1100 (§13.1):**
    - Upper band: copy and facts in cols 1–5; Fig. 1 in cols 7–12, spanning both rows, with its caption sitting on the facts' last rule.
    - Lower band: the h1 on two lines. "Durgesh" starts at the left margin and "*Chaudhari.*" is right-aligned, giving the diagonal.
    - The dimension rule sits under "Durgesh"; the scroll cue sits in the pocket below it.
    - The hero is `min-height: calc(100svh - var(--header-h))`.
  - **760–1099:** the name sits on top, with the cue in the pocket under "Durgesh". Copy is in cols 1–7 and the facts (label over value) in cols 8–12. Fig. 1 runs full width, 300 px high.
  - **< 760:** name (76 px at 390, 62 px at 320), then claim, CTAs side by side, facts and Fig. 1 at 2:1.
    - At 390×844 the name, claim, sub-copy, both CTAs and the facts are all above the fold. The work section starts at 1048 px, under the 1.3-viewport limit of 1097.
    - At 320 the CTAs stack, but only because they cannot fit side by side (`min-width: max-content`).
- **Name (§4.5):**
  - The markup is a `.vh` "Durgesh Chaudhari" plus two `aria-hidden` lines of `<span class="ch" style="--i:n">` letters. The h1 has no `aria-label`.
  - Styling: DM Sans 600 with `opsz 40` at −0.035em, then Instrument Serif italic at 1.06em in `--c-lamp`. The full stop is `--accent`.
- **Dim-to-lit (§6.3):** a CSS-only `.intro` animation. Letters start at opacity .4 with `translateY(.12em)`, so the name is readable on the first frame. The serif letters also rotate 4° → 0.
  - Line 1 runs about 60 → 1310 ms and line 2 about 300 → 1680 ms.
  - The dimension rule draws in once with `scaleX` at 900 ms.
  - Everything else is at 100% from the first frame. There is no loader and no scroll hijack.
- **Fig. 1 (§11):** this is Editorial's `monogram.js` geometry, rebuilt.
  - **Geometry:** Park–Miller seed 7. The scatter stays within the box ±15%. Node delay is k·22 + rnd·220 ms. Expo-out over 1500 ms. Edge alpha is ((p − .6)/.4)², node alpha .35 → .9.
  - **Tones:** edges fog/.28, nodes fog/.9, and the stop is periwinkle at `max(4, 4.2·scale)`.
  - **Pointer:** R = max(56, .17W), push (1 − d/R)²·22, and the spring runs at fixed 60 Hz substeps, so it behaves the same on 120 Hz screens.
  - **Probe:** lit edges sit within 1.1R. The nearest node within 30 px gets a 7 px ring, found by rest position so the push never outruns the probe.
  - **Readout:** one line, at most 10 Hz, `aria-hidden`. It cycles through `51 nodes · 97 edges · assembling`, `… · loop asleep`, `n.21 · degree 4 · x .23 y .19`, and `… · static` under reduced motion.
  - **Caption:** "Fig. 1 — The initials DC, drawn as a graph." plus a `.vh` description. The canvas is `aria-hidden`.
- **Loop:** the rAF loop runs only while visible and not hidden, and only while assembling, moving, or within 400 ms of the last pointer move. Edges and nodes are drawn in alpha buckets, about 10 strokes or fills per frame. DPR is capped at 2. The rect is cached and invalidated by ResizeObserver and a passive scroll flag.
  - **Assembly clock:** it starts on the first visible frame, so on mobile, where the figure is below the fold, the assembly plays when the visitor reaches it.
- **Init does no forced style or layout:** colours are read from tokens inside the first ResizeObserver callback, and the first draw happens there. The dimension label width is measured only on `pointerenter`.
- **Fallbacks:**
  - **No JS:** the SVG poster shows via `html:not(.js)`.
  - **No 2D context:** `.fig1--poster` is set and the poster shows.
  - **Reduced motion:** the final state is drawn once and no pointer listeners are attached. `DC.prefs.subscribe` attaches or detaches them live.
  - **Touch:** assembly only.
- **CTAs:**
  - The primary is "Explore work" with the arrow-down icon, linking to `#work`.
  - The ghost is "View résumé" with the tag `PDF · 1 p`, linking to the PDF. The " · 1 p" part shows only at ≥ 1280. The accessible name is "View résumé PDF · 1 page".
  - Both are `data-magnetic`, so core binds them on fine pointers.
- **In-page jump:** "Explore work" and the cue (`[data-hero-jump]`) keep native anchor navigation, so the hash updates and the focus start point moves. When motion is allowed they set `scroll-behavior: smooth` on `<html>` only for that jump, then restore it on `scrollend` or after 1.6 s (§6.4 rule 8).

## Public hooks
- **`DC.hero.replay()` → boolean (for CHROME's palette "Replay"):**
  - It re-runs the name lift, the dimension rule and the truss assembly.
  - If the hero is offscreen, it smooth-scrolls to it first.
  - It returns `false` and does nothing when motion is reduced, including after `DC.prefs.setMotion('reduce')`.
  - It works after `.intro` has been removed, using `.name.is-replay`.
- **Also exposed:** `DC.hero.el` (the section), `DC.hero.nodes` (51), `DC.hero.edges` (97).
- **Attributes:**
  - `[data-hero]` (section)
  - `[data-hero-name]` (h1 `#hero-name`, which A's `aria-labelledby` uses)
  - `[data-hero-dim]` (the "Durgesh" line; JS writes `data-dim="623 px"` on hover)
  - `[data-hero-jump]`
  - `[data-fig1]`, `[data-fig1-canvas]`, `[data-fig1-readout]`
- **Classes (hero.css):**
  - `.name`, `.name__l1`, `.name__l2`, `.name__stop`, `.ch`, `.is-replay`, `.is-reset`
  - `.hero__copy`, `.hero__claim`, `.hero__sub`, `.hero__ctas`, `.hero__pages`, `.hero__facts`, `.hero__when`, `.hero__cue`
  - `.fig1`, `.fig1__frame` (its `::before` draws the four 8 px corner ticks), `.fig1__canvas`, `.fig1__poster`, `.fig1__cap`, `.fig1__no`, `.fig1__readout`, `.fig1--poster`
  - E2 may copy the `.fig1__frame` tick pattern for the 404 figure.
- **For E2's 404 page:** use `<img src="assets/fig-dc-truss-404.svg" alt="" width="640" height="334">`.
  - The figure has one dashed edge: the top chord of the C, drawn as the periwinkle dashed datum.
  - It has one displaced node: a C bottom node moved by (9, 12) design units, with a faint ring at its original position.
  - It is transparent, for a night surface. Both SVGs carry `role="img"` and an `aria-label`. With `alt=""` they stay decorative, so put the meaning in the figcaption.

## Content (ledger)
- **Claim:** "I build AI systems that can *show their work.*" (ledger §2, keep). The italic is serif in `--fg`, never accent.
- **Sub-copy:** "In the LLM applications I build, code, not the model, is responsible for the facts." This restates the approved §2 wording. It is followed by "This archive holds the case studies, runnable labs and the evidence behind each claim.", which describes the site, as in A's meta description.
- **Facts:**
  - *Now*: "Third-year B.Tech Computer Engineering student, VIT Pune", then "2024–2028 (expected)" in mono. This combines the two approved §2 wordings and covers MF-18's "student".
  - *Focus*: "LLM systems, machine learning, algorithms", from §13.1.
  - *Open to*: "AI engineering internships", from §2.
- **Removed:** "Pune, India" with its pin icon and the old overline, because the facts carry VIT Pune.
- **`TODO(durgesh)` comment in the region:** the résumé PDF still contains claims the ledger holds back (Q-5).

## Decisions and deviations
- **760–1099 puts the name first,** as on mobile, rather than in a lower band. With the name in a lower band it fell below the fold at 768×1024 and 1024×768. §13.1 does not specify this range.
- **The ≥ 1100 name size also depends on height:** `clamp(6rem, min(12.5vw, (100svh − header − 495px)·.55), 13.5rem)`.
  - Results: 180 px at 1440×900, 216 at 1920×1080, 128 at 1280×800 and 111 at 1366×768.
  - The whole name stays on the first screen at laptop heights.
  - At 1100×800 the hero is 15 px taller than the viewport, but the name is still fully visible.
- **Fig. 1 height at ≥ 1100** stretches to the copy-plus-facts column: min `min(38svh, 360px)`, max 400. It comes to 369 at 1440×900. §11.2 says `min(42svh, 400px)`; I changed it so the caption aligns with the facts' bottom rule.
- **Probe readout labels:** I added `· settled` (the 400 ms before sleep), `· probe` (pointer inside, no node near) and `· static`.
- **Dimension label:** it shows the measured width of "Durgesh" (for example `623 px`). It appears on name hover only, on fine pointers only (MF-23), placed under "Du" so it stays clear of the g's descender.

## Known issues
- **Minified size:** hero-truss.js is 16 KB source and 5.8 KB gzipped. The repo has no minifier. Whitespace-stripped it is 11.7 KB; real minification should bring it near the §11.6 limit of 8 KB.
- **Long tasks on load:** they occur (55–120 ms) with or without hero-truss.js. In route-substitution runs, the hero's init variants change nothing measurable, and the page's first layout (the other regions) dominates. Re-measure once all regions land.
- **Desktop overlap:** at ≥ 1100 the right end of the dimension rule passes about 5 px above the top of the italic "C". This is intentional, a drafting look.
- **Desktop reading order:** the h1 comes first in the DOM but sits in the lower band visually. The h1 is not focusable, so the tab order (CTAs, then cue) is unaffected.
- **Not yet tested:** Firefox and Safari. Safari has no `scrollend`; the 1.6 s timeout covers it.

## Requests
- **CHROME:** wire the palette's "Replay Fig. 1" to `DC.hero.replay()`. Hide the item, or show "motion paused", when it returns `false`.
- **E2:** the 404 truss is ready at `assets/fig-dc-truss-404.svg`.
- **Lead / Durgesh:** update the résumé PDF (ledger Q-5). The hero's ghost CTA and the header both link to it.
- **A (optional):** the `.scroll-cue` component works as is. No changes needed.
