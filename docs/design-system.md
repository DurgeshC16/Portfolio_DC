# DC. — The Interactive Engineering Archive · Design System v1.0

Status: **normative** for the redesign of `dist/`. Owner: design direction. Date: 2026-11-23.
Words: **MUST** = a release blocker, **SHOULD** = expected unless a reason is written in the PR, **MAY** = optional.

Sources this document consolidates (read them only when this file is silent):
- `_research/references.md`: analysis of the two reference sites. We take principles from it, never code, assets, identity or layouts.
- `_research/audit-code.md`: the existing site. **§2 "Contracts to preserve" is binding** (URL/hash formats, IDs, data-attributes, ARIA patterns).
- `docs/content-ledger.md`: every factual claim. **It overrides any copy in this file or in the prototypes.**
- The three prototypes in `_research/proto/{editorial,cinematic,instrumented}` and the judges' report summarised in §16.
- Measurements made for this document: `_research/scripts/ds_contrast.py` (WCAG contrast), `ds_glyphs.js` / `ds_measure.js` (glyph coverage, name widths, fallback metrics). Re-run `ds_contrast.py` whenever a colour token changes.

---

## 0. Direction decision

| Prototype | Art | Recruiter | Engineering | Total |
|---|---|---|---|---|
| **editorial** | **8.1** (winner) | 7.5 | 7.0 | **22.6** |
| instrumented | 6.3 | **8.0** (winner) | **8.0** (winner) | 22.3 |
| cinematic | 7.6 | 6.5 | 6.5 | 20.6 |

**The base is Editorial ("printed engineering archive").** It has the highest total. It also has the only complete art-directed system (running heads, plates, folios, captions), the most legible type and contrast (zero axe violations, zero low-contrast text), and the best gallery figure/ground (paper plates on night). Instrumented lost on art for reasons that cannot be fixed by grafting: it is cluttered, its monogram is illegible, and its artwork is off-palette. Its *mechanics*, however, won two lenses, so we graft them heavily:
- the self-sleeping loop;
- the cheap CSS-transition gallery;
- the index ruler;
- the annotated Kaaran plate;
- the plain-language "who / focus / open to" facts;
- lettered citations.

From Cinematic we take:
- the dim-to-lit first paint;
- the large signature;
- the sans/serif name;
- the dawn arch;
- the dark credits;
- the native mobile scroll-snap strip;
- per-surface focus tokens.

One sentence for the team: **Editorial's look, Instrumented's honesty and mechanics, Cinematic's drama and first paint.**

---

## 1. Concept statement

**DC. is an engineering archive you can inspect.** The site opens at night: a near-black field, a name set large, and the initials DC drawn as a load-bearing truss that assembles and reacts to the pointer. That is the black box. The visitor then turns through five numbered **plates**, the selected work held in space. Then a warm paper sheet rises out of the dark and flattens into daylight. That is the system explained: evidence set in type, figures with sources, labs you can operate. The page ends in the dark again, with the credits.

Positioning line (verbatim, approved in the ledger): **"I build AI systems that can show their work."** The design obeys the same rule as the work it presents:
- every figure has a caption;
- every capture says where it came from and whether its data is synthetic;
- every number carries its scope;
- every accent-coloured thing can be inspected or operated.

Two audiences, two speeds:
- **Recruiters** get name, role, school, focus, availability, résumé and five project titles within one screen and one swipe.
- **Engineers** get architecture, algorithms, runnable labs and source links one click deeper.

---

## 2. Principles (adopted)

These are adapted from `references.md` §4 and the judges' reports. Each one is testable.

1. **Night → day → night.** The home page runs night (hero, gallery), then paper (evidence, bench, about), then night (credits). Darkness is a section, never a loader.
2. **Content at first paint.** Nothing readable starts at opacity 0 or fully masked. The h1 starts at ≥ 40% opacity, which is 3.36:1 and passes AA for large text. Tagline, CTAs, facts and nav start at 100%.
3. **One shout per viewport.** Exactly one oversized typographic element per screen: the name, a project title, a section statement, or the email. The hero truss is large but secondary in *tone* (hairline luminance), never in competition.
4. **Serif for meaning, sans for mechanics, mono for evidence.** Instrument Serif is for names, titles and statements. DM Sans is for UI and prose. DM Mono is for labels, captions, figures, readouts and any number that aligns or changes in place.
5. **Accent = inspectable.** Cobalt (on paper) and periwinkle (on night) mean only "you can act on this" or "this is the exact datum the evidence points to". There is one named exception: the brand full stop (§3.4).
6. **Asymmetric editorial grid, symmetric data.** Compositions zig-zag across 12 columns. Tables, charts and labs are strictly aligned.
7. **A spatial gallery that is a real list.** It is an `<ol>` of real `<a>` links, with `<button>` Prev/Next, keys, drag and swipe. State is the selected index, never the scroll position.
8. **Never hijack scroll.** Scroll-linked effects *react* to scroll. Nothing pins, scrubs a sequence, or redirects the wheel.
9. **Show the working system.** Each project has a real capture or an original technical drawing. Each case study has at least one operable lab or step-through.
10. **Earned status, visible provenance.** Status chips and provenance badges come only from the ledger. Linked evidence is accent-coloured because it is inspectable.
11. **A fact strip on every case study.** Role · Team · Timeline · Context · Stack · Proof, above the first paragraph.
12. **Numbered chapters in engineering order.** These are the 10-section case-study template (§13.2).
13. **Two motion families only.** *Reveal* (things arriving: slow, expo-out, once) and *Response* (things touched: quick, interruptible). Nothing else moves.
14. **Reveal by mask or by light, never by withholding.** Display type lifts from a dim state. Media unclips. Body text is simply there.
15. **Continuity between overview and detail.** The plate artwork morphs into the case-study header through cross-document View Transitions. Back restores the gallery where you left it.
16. **Feedback lives where the action happened.** "Copy address" becomes "Copied" in place and is announced via `aria-live`. There are no toasts.
17. **Mobile is a retold story.** At 390 px we linearise: name → claim → CTAs → facts → figure → swipe strip with full per-slide info. It is never a shrunk desktop.
18. **Premium means fast, legible and calm.** The first screen is ≤ 300 KB critical. Idle means 0 rAF/s and no infinite animations. Reduced motion jumps to end states. Focus is ≥ 3:1 everywhere. Nothing below 12 px.

---

## 3. Colour

### 3.1 Tokens (exact)

`css/tokens.css` MUST define these and only these colour primitives. Components MUST use the surface aliases (§3.3), never raw primitives, except inside SVG artwork.

**Night family**
| Token | Hex | Role |
|---|---|---|
| `--c-night` | `#0d0e11` | Hero, gallery and credits field (the deepest surface) |
| `--c-graphite` | `#141518` | Gallery floor gradient end, nav overlay, code blocks on night |
| `--c-ink` | `#1b1e26` | Text on paper. Raised surface on night. The "table" under the Kaaran brief tile |
| `--c-ink-2` | `#272b36` | Disabled fills and strong hairlines on night |
| `--c-fog` | `#ecebe5` | Primary text on night |
| `--c-lamp` | `#f4ead6` | Warm serif on night. Used **only** for the italic surname in the h1 and the footer email shout |
| `--c-mist` | `#a3a5ae` | Secondary text and control borders on night |
| `--c-slate` | `#8a8d98` | Tertiary text on night (captions, folios). Must be ≥ 13 px if used for running text |

**Paper family**
| Token | Hex | Role |
|---|---|---|
| `--c-paper` | `#f7f7f3` | Page surface of paper sections and case studies |
| `--c-paper-2` | `#eeece4` | Plate ground, lab bench ground, specimen mounts |
| `--c-paper-3` | `#e4e1d6` | Deeper mount, inline-code ground, hover ground on paper |
| `--c-bone` | `#d6d2c4` | Hairline rules on paper (decorative only) |
| `--c-ink-soft` | `#575a64` | Secondary text and control borders on paper |

**Accents (one meaning: inspectable or interactive)**
| Token | Hex | Role |
|---|---|---|
| `--c-cobalt` | `#3544b9` | Links, primary button fill, focus, highlighted datum **on paper** |
| `--c-cobalt-hi` | `#284ad5` | Hover/pressed of cobalt. Chart data marks on paper |
| `--c-cobalt-wash` | `#e3e4fb` | Tint behind a highlighted datum on paper (non-text) |
| `--c-periwinkle` | `#b7baff` | Links, primary button fill, focus, highlighted datum **on night** |
| `--c-periwinkle-hi` | `#d6d8ff` | Hover of periwinkle |
| `--c-periwinkle-lo` | `#8e93f0` | Non-text data marks on night (bars, edges in the lit state) |
| `--c-focus-any` | `#5f6bf0` | Universal focus colour for rings that may land on either surface or on artwork (§3.5) |

**Functional (labs only)**
| Token | Hex | Role |
|---|---|---|
| `--c-error` | `#a3360f` | Invalid lab input text and border on paper |
| `--c-error-night` | `#ff9b7a` | The same on night (not expected in v1) |

There is no green, no red, no gradient token and no glow token. "Valid" and "invalid" states in diagrams are carried by words and shapes (filled versus outlined seals), never by hue alone.

**Hairlines** (decorative; exempt from 3:1; never used as the only boundary of a control):
- `--rule-night: rgb(236 235 229 / .16)`
- `--rule-night-strong: rgb(236 235 229 / .32)`
- `--rule-paper: var(--c-bone)`
- `--rule-paper-strong: rgb(27 30 38 / .32)`

### 3.2 Verified contrast (WCAG 2.x, `scripts/ds_contrast.py`)

| Foreground → background | Ratio | Use allowed |
|---|---|---|
| fog → night / graphite / ink | **16.16 / 15.29 / 13.95** | Any text |
| lamp → night | **16.16** | Display serif |
| mist → night / graphite / ink / ink-2 | **7.86 / 7.43 / 6.78 / 5.76** | Secondary text, control borders |
| slate → night / graphite / ink | **5.83 / 5.52 / 5.03** | Tertiary text, captions |
| periwinkle → night / graphite / ink | **10.55 / 9.98 / 9.11** | Links, focus, accent text |
| periwinkle-hi → night | **13.90** | Hover text |
| periwinkle-lo → night / graphite / ink | **6.97 / 6.59 / 6.02** | Non-text marks (≥ 3:1 required) |
| night → periwinkle (primary button label) | **10.55** | Button text |
| night → periwinkle-hi (hover) | **13.90** | Button text |
| ink → paper / paper-2 / paper-3 | **15.51 / 14.09 / 12.73** | Any text |
| ink-soft → paper / paper-2 / paper-3 | **6.41 / 5.82 / 5.26** | Secondary text, control borders |
| cobalt → paper / paper-2 / paper-3 / #fff / cobalt-wash | **7.30 / 6.63 / 5.99 / 7.84 / 6.26** | Links, focus, accent text |
| cobalt-hi → paper / paper-2 | **6.45 / 5.86** | Hover, data marks |
| paper → cobalt (primary button label) / → cobalt-hi | **7.30 / 6.45** | Button text |
| error → paper / paper-2 | **6.32 / 5.74** | Lab validation |
| fog @ 40% over night (name start state) | **3.36** | Large display text only (≥ 24 px) |
| **Forbidden:** periwinkle → paper | 1.70 | ✗ never |
| **Forbidden:** cobalt → night | 2.46 | ✗ never |
| **Rejected:** fog @ 16% / 28% over night (cinematic's start state) | 1.49 / 2.24 | ✗ fails "visible at first paint" |

### 3.3 Surfaces (the only way components get colour)

Every section sets `data-surface="night"` or `data-surface="paper"`. The attribute remaps the aliases. This is the Cinematic `.surface-*` pattern under Editorial's attribute name.

```css
:root, [data-surface="night"] {
  --bg: var(--c-night); --bg-2: var(--c-graphite); --bg-raised: var(--c-ink);
  --fg: var(--c-fog); --fg-2: var(--c-mist); --fg-3: var(--c-slate);
  --rule: var(--rule-night); --rule-strong: var(--rule-night-strong);
  --accent: var(--c-periwinkle); --accent-hi: var(--c-periwinkle-hi); --on-accent: var(--c-night);
  --focus: var(--c-periwinkle); --mark: var(--c-periwinkle-lo);
  color-scheme: dark;
}
[data-surface="paper"] {
  --bg: var(--c-paper); --bg-2: var(--c-paper-2); --bg-raised: var(--c-paper-3);
  --fg: var(--c-ink); --fg-2: var(--c-ink-soft); --fg-3: var(--c-ink-soft);
  --rule: var(--rule-paper); --rule-strong: var(--rule-paper-strong);
  --accent: var(--c-cobalt); --accent-hi: var(--c-cobalt-hi); --on-accent: var(--c-paper);
  --focus: var(--c-cobalt); --mark: var(--c-cobalt-hi);
  color-scheme: light;
}
```

A **plate** (paper artwork sitting on night) sets `data-surface="paper"` on the plate itself. Its caption strip is paper. Its focus ring sits *outside* the plate on night, so the ring uses the night `--focus`. This is handled by setting `--focus` from the parent, as in §3.5.

### 3.4 The accent rule (decided and enforced)

Cobalt and periwinkle MAY appear only on:
1. links and buttons (text, underline, fill, border);
2. focus rings;
3. a linked evidence badge (§10.5);
4. the **single highlighted datum** in a figure: the cited value, the rotated node, the averaged weight, the winning row. One per figure. It is the thing the caption tells you to inspect;
5. live pointer feedback on interactive figures (lit truss edges, probe ring);
6. **the brand full stop.** This is the one decorative exception: the "." in the `DC.` wordmark, the "." that ends the h1, and the truss's full-stop node. It is the logo.

Cobalt and periwinkle MUST NOT be used for:
- display headlines or italic phrases in headings. Editorial's "*set in type.*", Cinematic's "*explained system*" and the hero's "*show their work.*" all become `--fg`;
- tile or section grounds (Editorial's cobalt Kaaran tile becomes an `--c-ink` table);
- decorative rules, scroll progress, tick marks or kicker labels.

Code review MUST reject any `var(--accent)` used on an element that is neither interactive nor one of the six cases above.

### 3.5 Focus

```css
:focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; border-radius: 2px; }
/* Rings that can fall on artwork, mixed surfaces, or canvas/SVG nodes: */
.focus-any:focus-visible, svg [tabindex]:focus-visible {
  outline: 3px solid var(--c-focus-any); outline-offset: 2px;
  box-shadow: 0 0 0 2px var(--bg); /* surface-coloured separator behind the ring */
}
```

- The ring is 3 px wide with a 3 px offset. It is never removed, and `outline: none` without a replacement is a blocker.
- Per-surface rings measure 10.55:1 on night and 7.30:1 on paper.
- `--c-focus-any` (#5f6bf0) clears 3:1 on every surface we have: night 4.46, graphite 4.21, ink 3.85, ink-2 3.26, paper 4.03, paper-2 3.66, paper-3 3.31, white 4.33.
- Circular or small controls get the same 3 px ring. There are no 1–2 px rings anywhere. (The judges found Editorial's dark round Prev ring too thin. The 3 px offset ring plus rectangular buttons fixes that.)
- Tile-level focus MUST be applied to the tile's own `<a>` (`.tile:focus-visible`) or to a real wrapper via `:focus-within`. Do not rely on a `:has()` rule that targets a sibling (Instrumented's rule never rendered).
- The gallery stage is **not** focusable. There is no giant focus box.

---

## 4. Typography

### 4.1 Files to ship (OFL; copy from `_research/proto/_fonts/` to `dist/assets/fonts/`)

| File | KB | Loaded | Notes |
|---|---|---|---|
| `dm-sans-normal-100_1000-latin.woff2` | 61 | **preload** | UI, prose, "Durgesh" |
| `instrument-serif-italic-400-latin.woff2` | 22 | **preload** | "Chaudhari", italic accents in the hero statement |
| `instrument-serif-normal-400-latin.woff2` | 21 | on use | Titles, statements |
| `dm-mono-normal-400-latin.woff2` | 14 | on use | Labels, captions, readouts |
| `dm-mono-normal-500-latin.woff2` | 15 | on use | Emphasised mono (active index stop, metric values) |
| `*-latin-ext.woff2` for the four faces above | 10–31 each | on use via `unicode-range` | Names with diacritics, etc. |

- **Do not ship** DM Sans italic. Body `em`/`i` inside sans text renders as Instrument Serif italic at 1.08em. That is the house device, as in "can *show their work*".
- Set `font-synthesis: none` globally.
- Remove the legacy `dist/assets/dm-sans.ttf` and `instrument-serif-italic.ttf` once nothing references them.
- Keep the OFL texts and add `dm-mono-license.txt` (OFL 1.1, copied verbatim from the DM Mono upstream repository).

`@font-face`:
- copy the `unicode-range` values exactly from `_research/proto/_fonts/fonts.css`;
- use `font-display: swap`;
- `weight 100 1000` for DM Sans.

Preload exactly two files in every page `<head>`:
```html
<link rel="preload" href="/assets/fonts/dm-sans-normal-100_1000-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/instrument-serif-italic-400-latin.woff2" as="font" type="font/woff2" crossorigin>
```
(Use correct relative paths on `projects/*.html`.)

**Metric-matched fallbacks** (measured with `ds_measure.js` against Arial and Times New Roman). They remove most of the swap shift on the name:
```css
@font-face { font-family: "DM Sans Fallback"; src: local("Arial"); size-adjust: 92.4%; ascent-override: 107.4%; descent-override: 33.5%; line-gap-override: 0%; }
@font-face { font-family: "Instrument Serif Fallback"; src: local("Times New Roman"); size-adjust: 82.4%; ascent-override: 120.2%; descent-override: 37.6%; line-gap-override: 0%; }
@font-face { font-family: "Instrument Serif Italic Fallback"; font-style: italic; src: local("Times New Roman Italic"), local("TimesNewRomanPS-ItalicMT"); size-adjust: 86.2%; ascent-override: 114.9%; descent-override: 36.0%; line-gap-override: 0%; }
```

Stacks:
```css
--f-sans:  "DM Sans", "DM Sans Fallback", system-ui, "Segoe UI", "Nirmala UI", "Noto Sans Devanagari", sans-serif;
--f-serif: "Instrument Serif", "Instrument Serif Fallback", Georgia, serif;
--f-serif-i: "Instrument Serif", "Instrument Serif Italic Fallback", Georgia, serif; /* with font-style: italic */
--f-mono:  "DM Mono", "Courier New", ui-monospace, monospace; /* DM Mono and Courier New share 0.6em advances (measured) */
--f-deva:  "Nirmala UI", "Noto Sans Devanagari", "Kohinoor Devanagari", "Mangal", sans-serif;
```

### 4.2 Glyph coverage: verified, and it changes the rules

`ds_glyphs` and fontTools cmap checks show the shipped latin subsets **lack ← → ↗ ↘ ✓ ✕ ₁ ₂ ⌈ ⌉ ≈ ≤ ≥ ⌘ ↵ ●** in every family, and ↑ ↓ in serif and mono. Present everywhere: `× · — – − … § ° •`.

- Arrows, external-link marks, check marks, close marks and the ⌘ key MUST be **inline SVG icons** from one sprite, `assets/icons.svg`. Those icons are: `arrow-left`, `arrow-right`, `arrow-down`, `arrow-up-right`, `check`, `close`, `cmd`, `return`, `plus`, `minus`.
- Icons use a 1.5 px stroke at a 16 px box and `currentColor`. They sit at `0.9em`, aligned to the cap height with `vertical-align: -0.12em`. Decorative icons are `aria-hidden="true"`.
- In SVG diagrams, write subscripts as `log<tspan font-size="70%" dy="0.25em">2</tspan>` (never baseline-shift, never U+2082), and ceilings as drawn paths or plain text "ceil(log2 n)".
- Never type ← → ↗ ✓ in HTML text. CI SHOULD grep `dist/` for `[←→↗✓⌈⌉₂⌘]` outside `aria-label`/`alt` and fail on a hit.

### 4.3 Tabular figures: verified, and it changes the rules

The Google-subset WOFF2s carry **no `tnum` feature** (GSUB features: DM Sans `calt ccmp dnom frac liga locl numr`; Instrument Serif `ccmp liga locl`). `font-variant-numeric: tabular-nums` therefore does nothing; we measured identical widths.

- Any number that **changes in place or aligns in a column** MUST be set in **DM Mono**, which is monospaced and so tabular by construction. That covers counters, lab readouts, probe readouts, table columns, metrics, timings and dates in lists.
- Serif folio numerals (the gallery counter "01 / 05", running-head folios) MAY stay in Instrument Serif. Each digit sits in a fixed cell: `display:inline-block; width:.56em; text-align:center`.
- Prose numbers stay in DM Sans. Evidence numbers are never set in the decorative serif.

### 4.4 Type scale (fluid between 390 and 1440 px)

| Token | Value | px @390 → @1440 | Family / weight | Line-height | Tracking | Role |
|---|---|---|---|---|---|---|
| `--t-name` (≥ 760) | `clamp(6rem, 12.5vw, 13.5rem)` | — → 180 (216 cap) | see §4.5 | `.88` | see §4.5 | h1 name, two lines |
| `--t-name` (< 760) | `clamp(3.875rem, 19.5vw, 9.25rem)` | 76 (62 @320) | — | `.88` | — | h1 name, two lines |
| `--t-display` | `clamp(3.25rem, 1.671rem + 6.476vw, 7.5rem)` | 52 → 120 | Serif 400 | `.95` | `-0.01em`, word-spacing `.06em` | Section statement (one per section) |
| `--t-title` | `clamp(2.75rem, 1.729rem + 4.19vw, 5.5rem)` | 44 → 88 | Serif 400 | `.95` | `-0.01em` | Case-study title. Gallery deck title capped at `min(var(--t-title), 4.5rem)` |
| `--t-h2` | `clamp(2rem, 1.536rem + 1.905vw, 3.25rem)` | 32 → 52 | Serif 400 | `1.05` | `-0.005em` | Section headings, chapter titles |
| `--t-h3` | `clamp(1.5rem, 1.314rem + .762vw, 2rem)` | 24 → 32 | Serif 400 | `1.1` | `0` | Tile titles, entry titles |
| `--t-counter` | `clamp(2.5rem, 1.943rem + 2.286vw, 4rem)` | 40 → 64 | Serif 400 | `1` | `0` | Gallery counter (always smaller than the deck title) |
| `--t-email` | `min(clamp(1.75rem, .357rem + 5.714vw, 5.5rem), calc((100vw - 2 * var(--margin)) / 11.8))` | 28 → 88 | Serif italic, lamp | `1` | `0` | Footer shout; the `min()` guarantees no overflow at 320 |
| `--t-lead` | `clamp(1.3125rem, 1.104rem + .857vw, 1.875rem)` | 21 → 30 | Sans 450 (opsz auto) | `1.25` | `-0.01em` | Hero claim, case-study dek |
| `--t-body` | `clamp(1rem, .977rem + .095vw, 1.0625rem)` | 16 → 17 | Sans 400 | `1.6` | `0` | Prose. Measure 60–72ch |
| `--t-small` | `.9375rem` | 15 | Sans 400 | `1.55` | `.005em` | Secondary prose, fact values |
| `--t-caption` | `.8125rem` | 13 | Mono 400 | `1.45` | `.02em` | Captions, readouts |
| `--t-micro` | `.75rem` | 12 | Mono 400/500, UPPERCASE | `1.4` | `.08em` | Labels, chips, running heads. **The floor: no visible text is smaller, including SVG text at its rendered size** |

Weights in use: DM Sans 400, 450, 500, 600 (name only); Mono 400, 500. Do not use other weights. Optical size is automatic (`font-optical-sizing: auto`), except the name, which uses `"opsz" 40`.

### 4.5 The name (h1)

Decision: we use the **sans/serif pairing**, which all three judges flagged as the most distinctive, over the all-serif name. The pairing carries the concept: the engineer in *mechanics* sans, the author in *meaning* serif.
- **"Durgesh"**: DM Sans, `font-weight: 600; font-variation-settings: "opsz" 40; letter-spacing: -0.035em;` colour `--fg`. Measured width 3.441em. The letters do not touch at this tracking. Never go tighter than −0.04em.
- **"Chaudhari"**: Instrument Serif italic, `font-size: 1.06em; letter-spacing: -0.01em;` colour `--c-lamp`. Then a brand full stop in `--accent` (the §3.4 exception). Measured width "Chaudhari." is 4.132em, so 4.38em at 1.06.
- Fit is guaranteed by the token: at < 760 px, 19.5vw × 4.38 = 85.4vw, which is less than the available 87.5vw at 320 and 89.7vw at 390. Above 760 px the two words sit on two lines (diagonal composition, §13.1).
- Markup: `<h1 class="name"><span class="vh">Durgesh Chaudhari</span><span class="name__l1" aria-hidden="true">…letters…</span><span class="name__l2" aria-hidden="true">…letters…</span></h1>`. Letters are `<span style="--i:n">`. This is Instrumented's robust pattern: no `aria-label` on the h1.

### 4.6 Tracking and setting rules

- Negative tracking only at ≥ 24 px. Body and UI text are never negatively tracked.
- Serif display text ≥ 48 px gets `word-spacing: .06em`. Instrument Serif's narrow space otherwise makes words merge at tight sizes.
- UPPERCASE only in mono labels (`--t-micro`, +0.08em). No uppercase sans or serif.
- Never animate `letter-spacing` or `word-spacing`. (Editorial's surname lock-up is removed. It cost 116 layouts.)
- `text-wrap: balance` on headings ≤ 4 lines. `text-wrap: pretty` on body paragraphs.
- `hanging-punctuation: first` on pull-quotes. Use real quotes (" " ' ') and real dashes (– —).
- Thousands take a comma ("10,000"). Use a non-breaking space between a number and its unit ("120 rows", "14 px").

### 4.7 Devanagari (Marathi)

- Any Marathi text MUST be wrapped in `lang="mr"`. The stack falls through to `--f-deva` (system Nirmala UI on Windows, Noto Sans Devanagari on Android, Kohinoor on Apple).
- `[lang="mr"]` sets:
  - `font-family: var(--f-deva)`;
  - `line-height: 1.75` (prose) or `1.3` (headings);
  - `letter-spacing: 0`;
  - `font-style: normal`, because the serif has no Devanagari and italics must not be synthesised;
  - `text-transform: none`;
  - `font-size: 1.04em`.
- Never set Marathi in mono labels. Translate the label to English, or use sans.

---

## 5. Space, grid, breakpoints, radii, rules, elevation, layers

### 5.1 Spacing (4 px base)

`--s-1..--s-11` = **4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192** px.

| Token | Value | Use |
|---|---|---|
| `--s-section` | `clamp(80px, 48px + 8.2vw, 168px)` | Vertical gap between sections. 80 @390 → 166 @1440 (shorter than Editorial's 216, to shorten the page) |
| `--s-block` | `clamp(48px, 32px + 4vw, 96px)` | Between blocks inside a section |
| `--s-stack` | `--s-5` (24) | Default vertical rhythm between paragraphs and components |

Rule: **no empty region larger than one column plus one gutter** inside a composed block (bento, deck, footer). The judges flagged Editorial's bento hole and Cinematic's evidence dead zones.

### 5.2 Grid

```css
--cols: 12;                                   /* 6 below 760 px */
--margin: clamp(20px, 4.2vw, 64px);           /* page side margin */
--gutter: clamp(12px, 1.7vw, 28px);
--max: 1600px;                                /* content max; margins grow beyond it */
--page-x: max(var(--margin), (100vw - var(--max)) / 2);
.grid { display:grid; grid-template-columns: repeat(var(--cols), minmax(0,1fr)); column-gap: var(--gutter); padding-inline: var(--page-x); }
```
Prose measure: 60–72ch, placed in columns 3–9 (case studies) or 4–10 (notebook).

### 5.3 Breakpoints (min-width, mobile first)

| Name | Range | What changes |
|---|---|---|
| `xs` | < 360 | Header nav labels switch from mono caps to DM Sans 500 / 13 px. Footer email uses its `min()` |
| `sm` | 360–759 | 6 columns. Name `--t-name` mobile. Gallery = native scroll-snap strip. Bento = single column zig-zag |
| `md` | 760–1099 | 12 columns. Hero stacks the claim above the figure. Gallery 3D with `W = min(64vw, 620px)`. Index ruler shows numbers plus the active name only |
| `lg` | 1100–1599 | The full asymmetric layout |
| `xl` | ≥ 1600 | Content capped at 1600. Name capped at 13.5rem |

Height query: `@media (max-height: 760px) and (min-width: 760px)` tightens the gallery (§12.3).
QA widths: **320, 390, 768, 1024, 1440, 1920** and 1366×768. `scrollWidth === clientWidth` at each one.

### 5.4 Radii

`--r-0: 0`, `--r-1: 2px` (buttons, chips, plates, tiles, images, inputs: everything), `--r-dot: 50%` (truss nodes, diagram nodes and the brand stop only).
- No pills.
- No circular buttons. Editorial's round Prev/Next become 48 px rectangular text buttons.
- The dawn arch is a `clip-path` shape, not a radius token.

### 5.5 Rules and hairlines

- 1 px, `var(--rule)`.
- Running heads and fact tables use `var(--rule)`. Section-closing rules use `var(--rule-strong)`.
- A rule never carries an accent.
- The **dimension rule** under the name (Instrumented graft) is used **once on the whole site**, in the hero. It is a 1 px `--rule-strong` line with 6 px end ticks spanning "Durgesh". The mono label `180 px · DM Sans 600 / Instrument Serif italic` appears **only on hover or focus of the h1 area, on fine pointers**, and otherwise stays hidden. It never competes with the name.

### 5.6 Elevation (shadows only; never glows, never glass)

```css
--shadow-plate: 0 48px 80px -40px rgb(0 0 0 / .75), 0 2px 6px rgb(0 0 0 / .30);   /* paper plates over night */
--shadow-tile:  0 30px 60px -36px rgb(27 30 38 / .45);                             /* specimens on paper */
--shadow-sheet: 0 -24px 60px -30px rgb(0 0 0 / .55);                               /* dawn sheet's top edge over night */
```
Banned anywhere: `backdrop-filter`, `filter: blur()` on UI, coloured shadows, `box-shadow` used as a glow, inner glows, and gradient borders. One gradient is allowed: the gallery floor, `linear-gradient(var(--c-night), var(--c-graphite))`, vertical and non-decorative.

### 5.7 Layers

`--z-base 1`, `--z-stage 5`, `--z-header 20`, `--z-cursor 30`, `--z-skip 50`. The nav overlay and the command palette use native `<dialog>` (top layer) and need no z-index.

---

## 6. Motion system

### 6.1 Tokens

| Token | Value | Family | Use |
|---|---|---|---|
| `--d-instant` | 120 ms | Response | Colour, opacity and underline feedback |
| `--d-response` | 240 ms | Response | Hover lift, press, tilt, chip swaps, title exit |
| `--d-swap` | 480 ms | Response | Button wipe, deck text swap in, counter roll, palette and overlay open |
| `--d-travel` | 900 ms | Response | Gallery plate travel, index marker, lean |
| `--d-reveal` | 900 ms | Reveal | Masks, image unclip, statement words |
| `--d-name` | 1000 ms | Reveal | Per-letter lift of the name |
| `--d-assemble` | 1500 ms | Reveal | Per-node truss travel |
| `--e-out` | `cubic-bezier(.16, 1, .3, 1)` | both | Expo-out: every arrival and every travel |
| `--e-inout` | `cubic-bezier(.76, 0, .24, 1)` | both | Masks that cross, exits |
| `--e-response` | `cubic-bezier(.25, 1, .5, 1)` | Response | Hover colour and border |
| `--e-spring` | `linear(0, .109, .342, .593, .805, .954, 1.041, 1.078, 1.082, 1.068, 1.047, 1.027, 1.011, 1.001, .995, 1)` | Response | Icon nudges, magnetic release (ζ ≈ 0.62, ~8% overshoot) |

Staggers:

| Token | Value | Use |
|---|---|---|
| `--st-letter` | 42 ms | Name letters |
| `--st-word` | 70 ms | Statement words |
| `--st-line` | 90 ms | Heading lines |
| `--st-item` | 40 ms | Deck fields, overlay items, palette groups |
| `--st-tile` | 120 ms | Bento tiles |

### 6.2 The two families

- **Reveal** covers things arriving on their own.
  - It runs once per page load, for elements entering the viewport (IntersectionObserver at threshold 0.2, observing an *unclipped* wrapper) or for the hero at first paint.
  - Easing is `--e-out`; duration is 480–1500 ms.
  - It starts from a **visible** state: dim, a small offset, or a partial clip. Never from `opacity: 0` on readable text.
  - It never loops.
- **Response** covers things the visitor causes: hover, press, drag, select, open.
  - Feedback is 120–240 ms.
  - Travel is 900 ms and **interruptible from its current value**.
  - Drag follows 1:1 with no easing, then settles with `--e-out` over `--d-travel`.

Any animation that fits neither family is not built.

### 6.3 Choreographies

**Hero (once, from first paint):**

| t (ms) | Event |
|---|---|
| 0 | Header, claim, sub-copy, CTAs and facts are painted at 100%. The name letters are painted at 40% opacity and `translateY(.12em)`. The truss shows 51 dots in a seeded scatter at 35% alpha |
| 60 → ~1360 | "Durgesh" letters lift to 100% / 0 (`--d-name`, `--e-out`, `--st-letter`) |
| 300 → ~1720 | "Chaudhari." letters do the same. Serif letters also rotate 4° → 0 |
| 0 → ~2820 | Truss nodes travel to their positions (`--d-assemble`, delay `k·22 + jitter(0–220)` ms, seeded). An edge appears when both ends pass 60% |
| ~2900 | The truss loop sleeps (§11.6) |
| 1600 | Scroll cue: a 3-iteration run of its tick (2400 ms each), then it rests. It is not infinite |

**Gallery change:** §12.4. **Dawn sheet:** §9.2. **Tiles:** §10.8.

**Section heads (Reveal):** heading lines lift from 0.5 opacity and `translateY(.3em)` (`--d-reveal`, `--st-line`). The running-head hairline draws with `scaleX` 0 → 1 (`--d-reveal`).

**Nav overlay and palette (Response):** the dialog fades plus 8 px (`--d-swap`, `--e-out`). Items follow `--st-item`. Close takes `--d-response` with `--e-inout`.

### 6.4 Rules

1. **Animate only `transform`, `opacity`, `clip-path` and SVG `stroke-dashoffset`.** Never `top/left/width/height/margin/padding/border-radius/letter-spacing/font-size`, in CSS or per frame in JS. (This fixes Instrumented's `top` scan line, Cinematic's margin/radius dawn and Editorial's letter-spacing.)
2. **No infinite animations.** No `animation-iteration-count: infinite` anywhere in production CSS; CI greps for it. Ambient loops are capped at 3 iterations.
3. **Offscreen pausing.** One shared IntersectionObserver (`js/core.js → watchVisibility(el, onIn, onOut)`) toggles `.is-offscreen`, which sets `animation-play-state: paused` on descendants. rAF loops stop when offscreen or when `document.hidden`.
4. **Self-sleeping loops.** Every rAF loop stops itself when its residual is < 0.05 px for 400 ms and no pointer is inside. Target: **0 rAF/s and 0 style recalcs at idle**.
5. **Interruption.** Use CSS transitions for anything that can be interrupted, since they retarget natively. WAAPI swaps carry a token: a newer swap cancels older ones (`anim.cancel()` plus token check), and they never queue. Rapid input coalesces to the latest target index. A drag started mid-travel commits to the current target and offsets from it.
6. **Per-frame custom properties** are written to the single element that uses them, never to `:root` or a section (this fixes Cinematic's `--mx/--my` on the hero root).
7. **No layout reads in loops.** Cache `getBoundingClientRect()` on resize/scroll invalidation (ResizeObserver plus a passive scroll flag), not per pointermove.
8. **No smooth scrolling by default.** `html { scroll-behavior: auto }`. In-page anchor links call `scrollIntoView({behavior: reduce ? 'auto' : 'smooth'})` explicitly. Focus-driven scrolling is always instant.
9. **The site honours `prefers-reduced-motion: reduce` as the only motion switch.** There is no in-page motion toggle in v1. The command palette MAY offer "Pause motion", which sets `html[data-motion="reduce"]` with the same effects, persisted in `localStorage`.

### 6.5 Reduced motion (end states, verified by test)

Under `(prefers-reduced-motion: reduce)` or `html[data-motion="reduce"]`:
- duration tokens become `1ms` and staggers `0ms`;
- a global rule clamps `animation-duration`/`transition-duration` to `1ms` and `animation-iteration-count` to `1`;
- `.intro` is never added, so the name renders at rest;
- the truss draws its final state once, with no loop and no pointer response;
- the gallery changes instantly; the lean, magnetic pull, tilt, contextual cursor and scroll cue are off;
- scroll-driven animations are disabled, so the dawn sheet renders flat;
- view transitions are off: `@media (prefers-reduced-motion: reduce) { @view-transition { navigation: none; } }`.
- **QA gate:** 300 ms after load and after each interaction, `document.getAnimations().filter(a => a.playState === 'running').length === 0`.

---

## 7. Surfaces and section rhythm

### 7.1 Order on the home page

`night` hero → `night` Selected work → **dawn** → `paper` Evidence → `paper` Bench → `paper` Research & about → `night` Credits.

The header adopts the surface beneath it. An IntersectionObserver on `[data-surface]` sections sets `header[data-surface]` and switches at the header's bottom edge.

### 7.2 The dawn sheet (night → paper turn)

This is Cinematic's arch rebuilt compositor-friendly, with Editorial's running head.
- **Structure:** `section.dawn[data-surface="paper"]` sits inside a night wrapper. The sheet's first child is the running head `II — From the archive · Plates 06–09 · p. 03`.
- **Supported browsers** (`@supports (animation-timeline: view())`): `clip-path` animates from `inset(0 var(--page-x) 0 var(--page-x) round 50% 50% 0 0 / 180px 180px 0 0)` to `inset(0 round 0)`, plus `translate: 0 4vh` → `0` on the sheet's *inner* wrapper. Settings: `animation-timeline: view(); animation-range: entry 0% entry 90%; animation-fill-mode: both`. There is no JS and no layout.
- **Fallback** (Firefox, older Safari): when the sheet's top crosses 85% of the viewport, an IntersectionObserver plays **the same keyframes once** with WAAPI (1200 ms, `--e-out`). The turn still reads as a deliberate dawn, timed instead of scroll-linked.
- **Reduced motion:** flat from the start. The running head and statement are static.
- **Safari check:** test `clip-path` plus `view()` on Safari 17+ and confirm no flash of the flat sheet before the first frame.
- The sheet casts `--shadow-sheet` upward onto the night above.

### 7.3 Credits (paper → night)

The footer returns to `night`. The hand-off is a plain 1 px `--rule-strong` edge with no arch; the dawn is the only dramatic turn.

---

## 8. Iconography and imagery

### 8.1 Icons

One SVG sprite (§4.2): 16 px grid, 1.5 px stroke, square caps, no fills except `check`. There are no tech-logo icons and no icon grids. The stack is written in words.

### 8.2 Project artwork rules

- **Allowed sources:**
  - original SVG drawings;
  - captures from `_research/assets-candidates/kaaran/` (public demo, synthetic data);
  - existing `dist/assets/*.webp`.
- Nothing marked do-not-publish. No facial imagery, ever (the federated provenance forbids the dataset faces). No `_research/refs/` screenshots.
- **Third-party UI captures sit on a neutral mat:** a `--c-paper-2` passe-partout with 6% padding, a 1 px `--rule` frame and a provenance badge. Kaaran's red and green chips must stay *inside* the mat so they never read as site colours. The Review Summarizer purple-gradient capture is **not used** on the home page.
- **Crops are authored, not computed:** crop the source image file at a whole-line or whole-element boundary. `object-fit: cover` MUST NOT cut text mid-word. Each crop is recorded in `assets/ARTWORK.md` with source file and crop box.
- **SVG diagrams:**
  - one drawing language: 1.25 px strokes, `--fg`-equivalent ink, nodes as circles, mono labels;
  - exactly one highlighted datum in accent;
  - a `role="img"` + `<title>` + `<desc>` with the full meaning;
  - a "Fig."/"Pl." caption outside the SVG.
- **Mobile legibility:** every SVG plate ships a **compact variant**: a 400-wide viewBox, labels ≥ 20 viewBox units, at most 6 labels. That keeps labels ≥ 12 px at a 240 px rendered width. Swap with two inline SVGs and CSS `display` at 760 px, or one SVG with `<g class="v-full">`/`<g class="v-compact">`.
- **Images:**
  - WebP, with `width`/`height` attributes;
  - `loading="lazy"` below the fold, promoted to eager one screen ahead by the reveal observer (Instrumented pattern);
  - `decoding="async"`;
  - `srcset` at 1× and 2× for plates.

---

## 9. File layout and parallel ownership

The site stays a static `dist/` with no build step. Page URLs are frozen: `index.html`, `projects/{kaaran,tutor,federated,notebook}.html`, plus the new `projects/certivault.html` and `404.html`.

**All URLs MUST be relative.** The site may be hosted under a subpath, and existing pages use `../`. Root-relative paths (`/assets/...`) in this document's snippets are illustrative only.

```
dist/
  index.html  404.html  projects/*.html
  css/tokens.css      colour, type, space, motion tokens, @font-face, surfaces      (owner A)
  css/base.css        reset, element defaults, grid, focus, reduced-motion, utilities (.vh, .mono)   (A)
  css/components.css  header, overlay, buttons, chips, badges, running head, figure, facts, bench, palette, cursor, footer (A)
  css/home.css        hero, Fig. 1 frame, gallery, dawn, bento, about                (B, C, D)
  css/case.css        case-study template, notebook, 404                             (E)
  js/core.js          window.DC: prefs (reduce/fine), watchVisibility, header surface tracking, reveal observer,
                      magnetic, copy-email, view-transition hooks (pageswap/pagereveal)            (A)
  js/hero-truss.js    Fig. 1 (§11)                                                   (B)
  js/gallery.js       §12                                                            (C)
  js/nav.js, js/palette.js, js/palette-index.js, js/cursor.js                        (A / E)
  experiments.js, notebook.js, site.js   existing lab logic: contracts preserved, restyled only  (D / E)
  assets/fonts/*.woff2 + OFL texts, assets/icons.svg, assets/img/*.webp, assets/fig-dc-truss.svg, résumé PDF
```

- **Owners for parallel work:** A = system and shell; B = hero; C = gallery; D = paper sections and labs on home; E = case studies, notebook, 404, palette, transitions.
- **Integration rules:**
  - Components consume **only** surface aliases and tokens.
  - JS modules are classic `defer` scripts wrapped in IIFEs. They attach by `id` or `data-*`, never by styling classes. The only global is `window.DC`. The existing scripts share one global lexical scope (audit §1.3), so do not declare top-level `const`/`function` names.
  - An inline `<head>` script (≤ 300 bytes) adds `.js`, and `.intro` when motion is allowed.
- **Artwork log:** crops and sources go in `docs/artwork.md` (outside `dist/`).

---

## 10. Components

Each component lists its DOM contract, states, motion and responsive behaviour. File placement is in §15.

### 10.1 Header

```html
<header class="site-header" data-surface="night">
  <a class="skip" href="#main">Skip to content</a>
  <a class="wordmark" href="/index.html" aria-label="DC. — home"><span aria-hidden="true">DC<span class="stop">.</span></span></a>
  <nav aria-label="Primary"><ul>
    <li><a href="/index.html#work">Work</a></li><li><a href="/index.html#evidence">Evidence</a></li>
    <li><a href="/projects/notebook.html">Notebook</a></li><li><a href="/index.html#contact">Contact</a></li></ul></nav>
  <a class="header__cv" href="/assets/Durgesh-Chaudhari-Resume.pdf">Résumé <span class="vh">(PDF)</span></a>
  <button class="header__search" type="button" aria-haspopup="dialog" aria-controls="palette">Search <kbd class="kbd">Ctrl K</kbd></button>
  <button class="header__index" type="button" aria-haspopup="dialog" aria-controls="nav-overlay" aria-expanded="false">Index</button>
</header>
```
- **Positioning:** absolute over the hero. After the visitor scrolls past 100svh it becomes `position: sticky`, hides on scroll-down and reveals on scroll-up (translateY, `--d-swap`). It has a **solid** `var(--bg)` and a bottom `--rule`. No transparency over content and no blur.
- **≥ 1100:** wordmark · archive title (`THE INTERACTIVE ENGINEERING ARCHIVE`, mono micro, fg-2) · nav with superscript section numerals · Résumé · Search.
- **760–1099:** the archive title is dropped.
- **< 760:** wordmark · **Work · Contact · Résumé** (always visible; a must-fix) · Index icon button (48×48, label "Index"). Search moves into the overlay. At < 360 the nav labels switch to sans 13 px.
- **`kbd` label:** "Ctrl K", or the `cmd` SVG plus "K" when `navigator.userAgentData?.platform` or `navigator.platform` matches Mac/iOS.
- **Active section:** the nav link gets `aria-current="true"` from a scroll-spy, which sets `aria-current` only. On case pages "Work" gets `aria-current="page"`.

### 10.2 Full-screen nav overlay

- **Element:** `<dialog id="nav-overlay" data-surface="night">`, opened with `showModal()`.
- **Layout:** a 12-col grid.
  - Left, cols 1–8: the five sections as a numbered list (`I Selected work`, `II Evidence`, `III Bench`, `IV Research & about`, `V Correspondence`). Each item is set in `--t-h2` serif with a mono page folio ("p. 02") right-aligned on the same baseline.
  - Right, cols 10–12: "Case studies" (5 links), "Notebook" (3 entry links), a Search button and Résumé.
  - Bottom row: email plus Copy.
- **Behaviour:** Escape and the close button close it, and focus returns to the opener. Focus is trapped natively by `<dialog>`. `inert` is unnecessary. Body scroll is locked with `overflow: hidden` on `html` while open. Links close the dialog and then navigate.
- **Motion:** §6.3. Under reduced motion it is instant.
- **Not:** a half-screen inverted panel or index letters (reference "do not copy").

### 10.3 Buttons and links

| Variant | Spec |
|---|---|
| `.btn--primary` | Fill `--accent`, label `--on-accent`, DM Sans 500 / 16, height 52 (min 48), padding-inline 24, radius 2. Hover: fill `--accent-hi` wipes left → right (a `::before` with `scaleX`, `--d-swap` `--e-out`), and the arrow icon nudges 3 px (`--e-spring`) |
| `.btn--ghost` | 1 px border `--fg-2` (≥ 5.76:1 on every surface), label `--fg`. Hover: border `--fg`, the same wipe at 8% `--fg` |
| `.btn--text` | Label `--accent`, 1 px underline at `text-underline-offset: .22em`. Hover: the underline thickens to 2 px and the colour goes to `--accent-hi` (`--d-instant`) |
| `.btn--icon` | 48×48, an icon plus a visually hidden label. Used only where a text label is impossible |
| Inline link (prose) | `--accent`, underline 1 px at offset .18em. Visited is identical (no purple). External links get the `arrow-up-right` icon plus `<span class="vh">(opens external site)</span>` |
| Disabled | `aria-disabled="true"`, opacity .38, no hover, stays focusable, click is a no-op |

- **Magnetic** (fine pointer only, `(hover:hover) and (pointer:fine)`, not under reduced motion): primary CTAs, gallery Prev/Next and the footer Copy button.
  - The pull radius is the element box plus 24 px. Translate up to **6 px** toward the pointer (factor 0.18 of the offset, clamped).
  - Written as `transform` on the button's inner span only, inside rAF only while hovered.
  - On leave it releases with `--e-spring` 480 ms.
  - The hit box never moves; only the inner span does.
- **Press:** `scale(.98)` for 120 ms on the inner span.
- **Accessible names MUST contain the visible label** (axe `label-content-name-mismatch` = 0). Prefer visible text plus visually hidden suffixes ("Prev<span class=vh> project</span>") over `aria-label`.

### 10.4 Chips (state)

`.chip`: DM Mono 12 / UPPERCASE / +0.08em, height 24, padding 0 8 px, 1 px border `--rule-strong`, text `--fg-2`, radius 2. **Non-interactive chips are never accent-coloured.**

The vocabulary is fixed. A project shows at most two chips, and each must map to a ledger row:
- `Hackathon build`
- `Build stage · top 30` (only with the ledger wording)
- `Co-authored paper` (with its status word from the ledger: *published / presented / accepted*)
- `Coursework`
- `Research prototype`
- `Co-built` (credit names in the fact strip)
- `No live demo yet`
- `Archived`

There are no pulsing dots, no green "Shipped" and no "In progress" with a coloured dot.

### 10.5 Evidence and provenance badges

These are two kinds, never mixed.

**Provenance badge** (`.prov`) says *what this image or number is*. It is neutral (fg-2), mono 12, with a leading 8 px glyph drawn in CSS.
- `Live demo capture` — outline square
- `Synthetic data` — square with a diagonal hatch. **Mandatory** on every Kaaran capture with readable figures
- `Real public aggregate` — filled square (`kaaran-desktop-real-data.png` only, with its source)
- `Original drawing` — circle
- `Recorded run` — tick mark, e.g. `Recorded run · DS_Actual_CP @ b80db89`
- `Illustrative` — dashed square (rank-fusion worked example)

**Evidence badge** (`a.evidence`) says *where to check a claim*. It is a link, so it is accent-coloured: 1 px `--accent` border, `--accent` text, and the `arrow-up-right` icon.

Its label follows the ledger status:

| Ledger status | Badge text | Link |
|---|---|---|
| VERIFIED | `Source` or a specific label such as `Repo`, `Live demo`, `DOI` | required |
| VERIFIED (self-reported) | `Project log` | required |
| RESUME | No badge. The wording itself must attribute: "per résumé" | none |
| CONFLICT / UNKNOWN | **Not published** | — |

Lettered citations (Instrumented graft): in decks, fact strips and the footer, evidence links MAY be indexed `[1] Live demo`, `[a] GitHub`. The index is a mono `--fg-3` prefix *outside* the link text so the link's name stays clean.

### 10.6 Running head and section header

**Running head:**
```html
<div class="running-head" aria-hidden="true"><span>II — From the archive</span><span>Plates 06–09</span><span>p. 03</span></div>
```
- Mono 12, uppercase only for the folio prefix.
- Three cells: left, centre and right on desktop. On mobile the centre cell drops.
- A hairline below. It draws in with `scaleX` (Reveal).
- It is decorative, so `aria-hidden`. The real heading is the h2.

**Section header:** running head → `h2` (`--t-display` for the one statement per section, `--t-h2` otherwise; one italic serif phrase allowed, in `--fg`) → optional dek (`--t-lead`, fg-2, cols 4–9) → optional marginal note (mono caption, cols 10–12).

**Section numerals:** roman numerals in running heads (I–V); "Pl. 01–05" for gallery plates; "Fig. n" for figures. The jargon labels "No. 00 The author" and "Fig. 00" are **removed** as primary identifiers.

### 10.7 Figures and captions

```html
<figure class="fig">
  <div class="fig__media">…img or svg…</div>
  <figcaption class="fig__cap"><span class="fig__no">Fig. 3.2</span> <span class="fig__text">What the plate shows, in one sentence.</span> <span class="prov">Original drawing</span></figcaption>
</figure>
```
The caption sits below the media. It is a grid: number (mono 12) · text (sans 15, fg-2) · badge (right-aligned). The figure number is never the only description.

### 10.8 Project tiles (bento, paper): four variants, never identical cards

| Variant | Shape | Mount | Caption | Content (v1) |
|---|---|---|---|---|
| **Sheet** | portrait 4:5 | `--c-ink` table. The A4 page (an authored crop, whole lines) is laid at −2.5° with `--shadow-tile` | Below, left | Kaaran Marathi evidence brief (`lang="mr"`; `Live demo capture` + `Synthetic data`) |
| **Specimen** | landscape 16:9 | `--c-paper-2` mount with a 1 px rule and a mono specimen label at top-left | Below, offset one column right | CertiVault certificate plus six verdict seals (original SVG; seals in ink with words; "Valid" is the highlighted datum) |
| **Worked example** | square 1:1 | No mount. It is drawn directly on paper with a dotted 8 px grid | Right of the media on ≥ 1100, below on mobile | Reciprocal-rank fusion at k = 60 (`Illustrative` ranks; computed scores). Caption line one is plain language for recruiters |
| **Index** | text column | none | — | "Also in the archive": a typeset list (mono number · serif title · one-line description · chip) linking to the notebook entries and secondary case material. It fills the grid cell beside the square so no hole remains |

- **Each tile is one `<a>`.** It has an `aria-labelledby` title and an `aria-describedby` description. The focus ring is on the `<a>` (§3.5).
- **Grid at ≥ 1100:** Sheet cols 1–5 × rows 1–2; Specimen cols 6–12 row 1; Worked example cols 6–9 row 2; Index cols 10–12 row 2. Row 2 aligns to the Sheet's bottom edge, so there is **no offset hole**.
- **760–1099:** Sheet cols 1–6; Specimen cols 7–12; Worked example cols 1–6; Index cols 7–12.
- **< 760:** single column zig-zag. The Specimen bleeds to the left edge; the Worked example is inset one column.
- **Reveal:** the media unclips from `inset(100% 0 0 0)` to `inset(0)` (`--d-reveal`, `--e-inout`) while the image settles from `scale(1.1)` to `1` (1400 ms, `--e-out`). The caption follows at +300 ms (opacity .5 → 1, translateY 8 px). The cobalt scan-line variant (Instrumented) MAY lead the edge, as a `transform: translateY` on a 2 px element, never `top`.
- **Hover** (fine pointer): perspective tilt ≤ 4° (`--d-response`), media `scale(1.03)`, title underline wipe, and the **pixel-dimension label** fades in at the media's bottom-right (mono 12, `1216 × 760 px`, `--d-instant`). The label also shows on `:focus-visible`.

### 10.9 Gallery: see §12.

### 10.10 Case-study fact strip

```html
<dl class="facts">
  <div><dt>Role</dt><dd>…</dd></div><div><dt>Team</dt><dd>… (credited by name)</dd></div>
  <div><dt>Timeline</dt><dd>…</dd></div><div><dt>Context</dt><dd>…</dd></div>
  <div><dt>Stack</dt><dd>…</dd></div><div><dt>Proof</dt><dd><a class="evidence">…</a> …</dd></div>
</dl>
```
- ≥ 1100: six cells in a row with hairlines above and below.
- 760–1099: 3 × 2.
- < 760: 2 × 3. `dt` is mono 12 caps in fg-2; `dd` is sans 15 in `--fg`.
- Any row without ledger support is **omitted**, never "TBD".

### 10.11 Metrics and code

- **Metric:** a value in DM Mono 500 at `--t-h2`, a unit in mono 13, a label in sans 15, and a **mandatory scope line** in mono 12 fg-2 ("1 recorded run · 10,000 sorted keys · DS_Actual_CP @ b80db89"). A metric without scope does not ship. The highlighted metric (one per chapter) MAY use `--accent` only if it links to its source.
- **Inline code:** DM Mono .92em, `--bg-raised` ground, padding .1em .3em, radius 2.
- **Code block:** `--bg-2` ground, 1 px `--rule`, DM Mono 13/1.6, line numbers in `--fg-3`. A header bar carries the file path, the revision and a Copy button (a morph confirmation). Two tones only: keywords `--fg` 500 and comments `--fg-2`. No rainbow syntax highlighting. `overflow-x: auto` inside the block (never page overflow), `tabindex="0"` so it can be scrolled by keyboard, and an `aria-label` with the file name.

### 10.12 Lab panel ("bench") chrome

This wraps every existing interactive lab: Kaaran evidence, AVL rotation, federated averaging, and the notebook trees, retrieval and insertion labs.
- **Shell:** `section.bench[data-surface="paper"]` with a `--c-paper-2` ground, a 1 px `--rule-strong` frame and radius 2.
- **Header bar:** mono 12 `Lab 02 · Rotation bench` · a live state readout (mono) · `Reset` (`.btn--text`).
- **Body:** controls column (cols 1–4 of the bench) and stage (cols 5–12) on ≥ 1100; stacked on mobile.
- **Footer:** "Reading" (`role="status"`, sans 15) and a "Source" citation line (mono 12 plus an evidence badge).
- **Contracts:** every ID, `data-*` attribute, ARIA pattern and URL-hash format listed in `audit-code.md` §2.1–2.5 MUST survive unchanged, together with the no-JS fallbacks. Fix the known no-JS defect (the federated static bars) while you are there.
- Inputs: 48 px height, a 1 px `--fg-2` border, and focus per §3.5. Invalid inputs get `--c-error` text, a border and a message linked with `aria-describedby`.

### 10.13 Command palette (Ctrl/Cmd + K)

- **Element:** `<dialog id="palette" data-surface="night" aria-label="Search the archive">`, opened with `showModal()`.
- **Triggers:** the header button; Ctrl+K / ⌘K (`keydown` on `document`, `preventDefault`, ignored when `e.isComposing`, or when focus is in an `input`, `textarea`, `select` or `[contenteditable]` outside the palette); the nav overlay entry.
- **DOM:**
  - `<input role="combobox" aria-expanded="true" aria-controls="palette-list" aria-autocomplete="list" aria-activedescendant="…">`;
  - `<ul id="palette-list" role="listbox">` with grouped `role="option"` items, group labels as `role="presentation"` headings, and `aria-selected` on the active option;
  - a mono footer hint drawn with SVG keys: "↑↓ move · ↵ open · esc close".
- **Index** (static JSON in `js/palette-index.js`; no network):
  - Sections (5).
  - Case studies (5).
  - Labs: each with its deep link, e.g. `projects/tutor.html#lab/tutor?moves=R30`.
  - Notebook entries (`#trees`, `#retrieval`, `#insertion`).
  - Actions: Copy email; Open résumé (PDF); View GitHub; Replay Fig. 1 (re-runs the hero truss; hidden under reduced motion); Pause motion / Resume motion (§6.4 rule 9).
- **Matching:** NFD-normalised, case-insensitive subsequence, scored prefix > word-start > contiguous > subsequence. Ties sort by group order. At most 8 results. An empty query shows Sections and Case studies.
- **Keys:** ↑/↓ wrap; Home/End; Enter activates; Ctrl/Cmd+Enter opens links in a new tab (`window.open` for link items only); Esc closes; focus returns to the opener.
- **Motion:** §6.3. The selected row gets a `--bg-raised` ground and a 2 px `--accent` left rule, because it is interactive.

### 10.14 Contextual cursor

- **Fine pointer only, not under reduced motion.** It is a label chip that *accompanies* the native cursor. **The native cursor is never hidden.**
- Element: `<div class="cursor-chip" aria-hidden="true">`, `position: fixed`, `pointer-events: none`, `--z-cursor`. Mono 12 caps, radius 2. Ink on paper, or fog on ink, per the surface under the pointer. No blur and no glass.
- Position: pointer + (16, 16) px, written as `transform` in rAF **only while the pointer moves** (the loop sleeps after 100 ms of rest).
- Labels come from the nearest `[data-cursor]` ancestor:
  - `Open` on the front plate and tiles;
  - `Select` on side plates;
  - `Drag` on the empty stage;
  - `Probe` on the hero figure;
  - `Copy` on the email.
- The chip hides on `keydown`, over form fields, on `pointerleave` of the window and during drag. It appears 120 ms after entering a target (`--d-instant`).

### 10.15 Scroll progress

- A 2 px bar on the bottom edge of the sticky header, coloured `--fg-2` (not accent).
- `transform: scaleX()` driven by `animation-timeline: scroll(root block)`, linear.
- Unsupported browsers: no bar (no JS fallback; it is decorative).
- Shown only on case studies and the notebook, not on the home page.

### 10.16 Page transitions (cross-document View Transitions)

```css
@view-transition { navigation: auto; }
@media (prefers-reduced-motion: reduce) { @view-transition { navigation: none; } }
::view-transition-old(root) { animation: 160ms var(--e-inout) both vt-fade-out; }
::view-transition-new(root) { animation: 320ms var(--e-out) 80ms both vt-rise-in; } /* opacity 0→1, translateY 12px→0 */
::view-transition-group(*) { animation-duration: 520ms; animation-timing-function: var(--e-out); }
```
- **Shared elements:** `plate-<key>` (artwork) and `title-<key>` (project title). `<key>` ∈ `kaaran | tutor | federated | certivault | notebook`.
- **Home:** names are assigned **only on navigation**. In `pageswap`, if `event.activation.entry.url` matches `projects/<key>.html`, set `view-transition-name` on that slide's `.plate__art` and on the deck title. Clear them in `pagereveal` / `pageshow`. This avoids offscreen morphs and duplicate-name errors.
- **Case page:** the header art has a static `view-transition-name: plate-<key>` and the h1 has `title-<key>`.
- **Back to home:** in `pagereveal`, restore the gallery index from `history.state` *before* the first frame (§12.6), then set the names on the restored plate so it morphs back into place. Clear them on `event.viewTransition.finished`.
- **Case → case (Prev/Next at the foot):** root cross-fade only.
- No transition may exceed 700 ms. Unsupported browsers navigate normally; that is the fallback.

### 10.17 Copy email and footer credits

- **Copy button:** "Copy address" becomes `check` icon + "Copied" for 2000 ms. A `<span aria-live="polite" class="vh">` announces "Email address copied". On clipboard failure the button shows the address itself, selected, and announces "Copy failed — the address is shown on the button" (Editorial fallback).
- **Footer:**
  - running head `V — Correspondence · p. 05`;
  - mono label;
  - email as `<a href="mailto:…">` at `--t-email` in lamp italic serif (the shout);
  - Copy;
  - lettered links `[a] GitHub` `[b] LinkedIn` `[c] LeetCode` `[d] Résumé (PDF)`;
  - a one-line availability note from the ledger ("Looking for an AI engineering internship.");
  - a mono colophon ("Set in DM Sans, Instrument Serif and DM Mono. Hand-built in HTML, CSS and JavaScript."). No year boasting and no "/'26" numeral.

### 10.18 Scroll cue

- A link to `#work` with a 72 px hairline and a 22 px `--fg-2` tick that runs 3 times, then rests.
- Label "Selected work" in mono; there is no "Scroll 01 —" prefix.
- Hidden under 760 px (the strip is reachable anyway).

---

## 11. Hero signature: Fig. 1, "DC. as a graph"

**Base:** `_research/proto/editorial/js/monogram.js`, the hand-built deterministic truss. **Grafts:** Cinematic's scale and self-sleeping loop; Instrumented's probe readout and single trace line.

### 11.1 Geometry (fixed facts)

The truss is built from its construction rules, not sampled from a font, so it never depends on font loading.
- **D:** outer and inner contours, offset 0 and 14 in design units (box 212 × 100). Each contour has a 5-point stem, a top-bar point, a 7-point bowl (−90° to 90°, step 30°) and a bottom-bar point, so 14 points. The contours are joined as a closed truss: chords on both contours, one diagonal and one rung per point.
- **C:** radii 50 and 36, an 11-point arc from 320° to 40° (step 28°), as an open truss.
- **Full stop:** one node at (206, 94), `kind: "dot"`.
- **Totals:** **51 nodes, 97 edges**, computed and asserted in a unit check. **No k-NN edges and no bridges between D and C.** The full stop has **no edges**, so there is no stray long edge.
- **Scatter:** Park–Miller PRNG with seed 7, so it is identical on every load. Start positions lie in the figure box ±15%, which reads as 51 loose points, not a starfield. Node delay is `k·22 + rnd·220` ms.

### 11.2 Scale and placement (one shout: the name dominates)

- **≥ 1100:** the canvas spans grid cols 7–12 of the hero's upper band, about **640–760 px wide (≈ 50% of the viewport)**. Height is `min(42svh, 400px)`. The truss fits with 8% horizontal and 12% vertical padding.
- **760–1099:** full content width under the claim, height 300.
- **< 760:** full width after the facts, aspect 2:1 (≈ 350 × 175 at 390).
- **Tone hierarchy:** edges `rgb(236 235 229 / .28)` at 1 px; nodes `rgb(236 235 229 / .9)` with radius `max(1.6, scale·1.0)`; the full stop `--c-periwinkle` with radius `max(4, scale·4.2)`.
- The name is 100% fog/lamp at 180 px. The truss is therefore large but **secondary in luminance**, which preserves one shout.
- **Frame:** Editorial's tick-cornered frame (four 8 px corner ticks in `--rule-strong`). No box border.

### 11.3 Assembly

- Each node eases from scatter to target with expo-out over 1500 ms after its delay.
- Edge alpha is `((min(pa, pb) − .6) / .4)²` once both endpoints pass 60% progress, so structure *emerges*.
- Node alpha is `.35 + .65·p`.
- Total ≈ 2.8 s. It starts in the first rAF after the deferred script runs. There is no font wait.

### 11.4 Pointer response (fine pointer only; not under reduced motion)

- **Radius:** R = `max(56, 0.17·W)` px (≈ 120 at 700 px wide).
- **Push:** `(1 − d/R)² · 22` px radially. Spring per frame: `v = (v + (target − disp)·0.16)·0.72`, normalised by dt.
- **Edges:** those whose midpoint is within `1.1R` are drawn in `--c-periwinkle-lo` → `--c-periwinkle` by proximity. This is live interactive feedback, so the accent is allowed.
- **Nearest node within 30 px:** a 7 px periwinkle ring.
- **Readout** (one line under the figure, mono 12, fg-2, right-aligned, `aria-hidden`, ≤ 10 Hz):
  - `51 nodes · 97 edges · assembling` → `… · loop asleep` (settled);
  - during the probe: `n.23 · degree 4 · x .41 y .62`.
- **Caption left:** `Fig. 1 — The initials DC, drawn as a graph.`
- Pointer leave: the springs return. **No Re-run button** in the tab order. Replay lives in the command palette.

### 11.5 Fallbacks

- **Reduced motion:** final positions drawn once; readout `51 nodes · 97 edges · static`; no pointer listeners attached.
- **No JS / no canvas:** `<img class="fig1__poster" src="assets/fig-dc-truss.svg" alt="">`, generated once from the same geometry by `tools/build-truss-svg.js` and committed. It is shown when `html:not(.js)`. The `<figcaption>` carries the description.
- **Touch / coarse pointer:** assembly only; tap does nothing.
- **Resize:** ResizeObserver recomputes scale. Settled nodes snap; nodes still assembling keep their progress.

### 11.6 Loop control and budget

- rAF runs only while (assembling OR |velocity| or |displacement| > 0.05 px OR the pointer is inside the canvas) AND intersecting AND `!document.hidden`.
- It sleeps after 400 ms of rest. It wakes on pointerenter/move/leave, resize, `visibilitychange` (visible) and intersection (in view, if not settled).
- Draw uses two batched `stroke()` passes (neutral edges, lit edges), then the nodes. DPR is capped at 2. The canvas rect is cached and invalidated by ResizeObserver and a passive `scroll` flag.
- **Budget:**
  - script ≤ 8 KB minified;
  - init ≤ 4 ms;
  - frame ≤ 2 ms at 1440;
  - **no long task > 50 ms**;
  - **0 rAF/s** at idle, offscreen and in a hidden tab;
  - CLS contribution 0 (the canvas has fixed dimensions from CSS).

---

## 12. Featured gallery: "Five plates"

**Base:** Editorial's `gallery()` in `_research/proto/editorial/js/main.js` (layout maths, drag, token-guarded swaps, lean). **Grafts:**
- Instrumented's index ruler, odometer counter and annotated Kaaran plate;
- Cinematic's deck layout, side-plate click and mobile scroll-snap strip;
- **clamped, not wrapped**.

### 12.1 DOM and ARIA

```html
<section id="work" data-surface="night" aria-labelledby="work-h">
  <div class="running-head" aria-hidden="true"><span>I — Selected work</span><span>Plates 01–05</span><span>p. 02</span></div>
  <h2 id="work-h">Five plates <em>from the archive</em></h2>
  <p class="work__hint" id="work-hint">Drag the plates, or use the buttons. Arrow keys work once you are in the gallery.</p>
  <div class="gallery" id="gallery" role="region" aria-roledescription="carousel" aria-label="Project gallery" aria-describedby="work-hint">
    <div class="gallery__stage" data-cursor="Drag">
      <ol class="gallery__ring" id="ring">
        <li class="slide" id="slide-kaaran" aria-roledescription="slide" aria-label="1 of 5" data-key="kaaran">
          <a class="plate" href="projects/kaaran.html" tabindex="-1" data-surface="paper" data-cursor="Open">
            <span class="plate__art">…img + annotation svg…</span>
            <span class="plate__cap"><span class="mono">Pl. 01</span> Kaaran: source drawer <span class="prov">Synthetic data</span></span>
          </a>
          <div class="slide__text">
            <p class="kicker">Applied AI · 2026</p><h3>Kaaran</h3><p class="summary">…</p>
            <dl class="facts facts--deck">…Role / Stack / Status…</dl>
            <a class="btn btn--text" href="projects/kaaran.html">Read the case study<span class="vh">: Kaaran</span></a>
          </div>
        </li>
        … 4 more …
      </ol>
    </div>
    <div class="gallery__controls">
      <p class="counter" aria-hidden="true"><span class="counter__win"><span class="counter__roll">01 02 03 04 05</span></span> / 05</p>
      <button class="btn btn--ghost" id="prev" aria-controls="ring">‹svg› Prev<span class="vh"> project</span></button>
      <div class="index" role="group" aria-label="Jump to project">
        <button class="index__stop" aria-current="true" tabindex="0">01 Kaaran</button>
        <button class="index__stop" tabindex="-1">02 Tree tutor</button> …
        <span class="index__marker" aria-hidden="true"></span>
      </div>
      <button class="btn btn--ghost" id="next" aria-controls="ring">Next<span class="vh"> project</span> ‹svg›</button>
    </div>
    <div class="deck" id="deck" aria-hidden="false"> <!-- desktop only; populated from the active slide__text -->
      <p class="kicker"></p><h3 class="deck__title" id="deck-title"></h3><p class="summary"></p>
      <dl class="facts facts--deck"></dl><a class="btn btn--primary" id="deck-link" data-cursor="Open">Read the case study<span class="vh"></span> ‹svg›</a>
    </div>
    <p class="vh" aria-live="polite" id="gallery-live"></p>
  </div>
</section>
```

- **One source of truth for copy.** Each slide's `.slide__text` holds its copy. On desktop (JS on, ≥ 760) `.slide__text` is `display:none` and the deck mirrors the active one, so the heading is **never duplicated** in the a11y tree. On mobile the deck is `display:none` and each slide shows its own text. With no JS, the slides render as a static list with their text and the deck stays hidden.
- **All five slides stay in the accessibility tree**, with no `aria-hidden` on inactive slides. Plate `<a>`s are `tabindex="-1"`: real links for mouse, ctrl/cmd/middle-click and screen-reader browsing, but not tab stops.
- **Tab stops (desktop):** Prev → index (one roving stop) → Next → deck CTA. That is four, and the deck CTA is the canonical project link.
- **Names:** the carousel region is "Project gallery", which is distinct from the section's h2 (fixes axe `landmark-unique`). Every accessible name contains its visible text.

### 12.2 State

- `index` is an integer in 0–4 and the only source of truth. Positions derive from it, never from scroll. **No wrap-around:** `go(i)` clamps.
- At 0, Prev is `aria-disabled="true"`; at 4, Next is. Disabled buttons stay focusable, and pressing them is a no-op that plays a 120 ms 3 px "bump" of the ring (Response).
- `go(i)` sets, in this order:
  1. `index`;
  2. classes;
  3. `aria-current` on the index stop, and the roving `tabindex`;
  4. the counter `--at`;
  5. the marker `--at`;
  6. the deck (token-guarded swap);
  7. the live region text, "Project 2 of 5: Neuro-symbolic tree tutor";
  8. persistence (§12.6).

### 12.3 Desktop geometry (≥ 760, CSS 3D)

```
W (plate width) = min(40vw, 600px, (100svh − 500px) × 1.6)      /* tablet: min(64vw, 620px, …) */
plate = W × W/1.6 (16:10) + 40px caption strip
o = i − pos   (pos = index, or fractional during drag)    a = |o|   s = sign(o)
translateX = s · (a ≤ 1 ? a·0.8W : 0.8W + (a − 1)·0.42W)
translateZ = −min(a, 2.2) · 360px
rotateY    = clamp(o, −1.3, 1.3) · 30deg          /* convex: neighbours turn away like pages */
opacity    = a ≤ 1 ? 1 : max(0, 1 − (a − 1)·0.85)
veil       = min(a, 2) · 0.3                      /* --veil on a ::after of the plate, colour night */
visibility = opacity ≤ .01 ? hidden : visible
z-index    = 100 − round(a·10)
stage: perspective 1700px; transform-style preserve-3d on the ring; overflow-x: clip on the SECTION (not the 3D parent)
```
- **Fit check:** at 1440×900, W = 576, so the plate is 360 + 40. Running head 44 + heading row 64 + gaps 48 + stage 416 + controls 56 + gap 24 + deck 172 = **824 ≤ 900**. At 1366×768, W = 430, giving 752 ≤ 768. The deck MUST stay ≤ 172 px tall on desktop:
  - kicker (18) + title capped at 72 px (68) + summary ≤ 2 lines (54) on the left;
  - facts (Role, Stack, Status; 3 × 36) plus the CTA (48) on the right.
- **Deck grid:** counter + controls row above; deck cols 1–7 (kicker, title, summary) and cols 8–12 (facts, CTA).
- **The project title is the largest element in the deck.** The counter is `--t-counter`, always smaller than the title.
- **Lean** (fine pointer): the ring rotates up to ±5° Y and ±3° X toward the pointer, written to `#ring` only via rAF, with a 900 ms `--e-out` transition. It resets on leave. It is off during drag.
- **Light:** paper plates on night *are* the light. There is no lamp cone. The active plate gets `--shadow-plate`; neighbours get the veil.
- **Safari:** `preserve-3d` breaks under `overflow: hidden`/`clip` on the 3D parent. Clip on the section and keep the stage free. Verify on Safari 17+.

### 12.4 Travel and deck choreography (Response)

| Element | Motion |
|---|---|
| Plates | CSS transition on `transform, opacity` (`--d-travel`, `--e-out`) |
| Deck title | The old title exits up 70% plus fade (`--d-response`, `--e-inout`). The new title rises from 90% (`--d-swap` + 160 ms = 640 ms, `--e-out`) in the direction of travel. WAAPI with a token guard |
| Counter | Odometer: `.counter__roll` `translateY(calc(var(--at) * -1em))` (`--d-swap`, `--e-inout`) |
| Index marker | 3 px `--accent` bar `translateX(calc(var(--at) * 100%))` (`--d-travel`, `--e-out`) |
| Kicker, summary, facts | Fade and 6 px drop: out 160 ms, in 480 ms, `--st-item` |
| Kaaran annotation | `stroke-dashoffset` draw-in (900 ms, delay 380) **once** each time the plate becomes active. No loop |
| FedAvg plate | Its arrows play **one** round (2400 ms) on activation, then rest. **No infinite flow dashes** |

- **The deck updates on commit only**, never while dragging across boundaries. That fixes Cinematic's replay noise.
- **Reduced motion:** all of it is instant.

### 12.5 Inputs

| Input | Behaviour |
|---|---|
| Prev / Next `<button>` | `go(index ∓ 1)`. Focus stays on the button |
| Index stop | `go(n)`. The stop group has roving tabindex. ←/→ inside it move selection *and* stop focus |
| ←/→, Home/End | The listener is on `#gallery` (any descendant focus), with `preventDefault`. ←/→ = ±1, Home/End = first/last. **Focus then moves to the deck CTA** (`preventScroll: true`, then `deck.scrollIntoView({block: 'nearest'})`), so the selected title and its link are on screen together. Ignored with Alt/Ctrl/Meta. Nothing is bound on `document` |
| Drag / swipe (desktop, pointer) | `pointerdown` on the stage. It starts after 6 px of horizontal intent where \|dx\| > \|dy\|, then `setPointerCapture`. Plates follow 1:1 (`pos = index − dx/step`, `step = 0.8W`) with `.is-dragging` disabling transitions. Ends are rubber-banded (excess × 0.35). Release: `round(dx/step)`, or ±1 if \|dx\| > 40 px or \|v\| > 0.35 px/ms. Clamp, then commit. The click after a drag is suppressed. `touch-action: pan-y` is on **the stage only, at ≥ 760** |
| Click a side plate | `preventDefault`, `go(i)`, **unless** `e.ctrlKey \|\| e.metaKey \|\| e.shiftKey \|\| e.button === 1`, in which case the browser opens the link natively |
| Click the front plate | Native link navigation (a real `<a>`). Never `location.href` |

### 12.6 State persistence

- On every commit: `history.replaceState({...history.state, dcPlate: index}, '')` (the URL is untouched, so the existing `#lab/...` hash contracts are never clobbered) and `sessionStorage.setItem('dc.plate', index)`.
- On load: `index = history.state?.dcPlate ?? +sessionStorage.getItem('dc.plate') ?? 0`, validated to 0–4, applied with `layout(instant)` (no transition) **before** the first visible frame of the gallery. On the back navigation this happens in `pagereveal` (§10.16).
- The mobile strip restores `scrollLeft` from the same index with `behavior: 'instant'`.

### 12.7 Mobile (< 760): native strip

- `.gallery__ring` becomes a flex row: `overflow-x: auto; scroll-snap-type: x mandatory; overscroll-behavior-x: contain; scrollbar-width: none; padding-inline: var(--margin); scroll-padding-inline: var(--margin)`. Slides are `flex: 0 0 calc(100% − 28px)` with `scroll-snap-align: start` and a 14 px gap.
- **No 3D, no custom pointer handlers, and no `touch-action` on plates or slides.** Swipes starting on the image, the caption or the text all scroll the strip natively. This fixes Cinematic's confirmed `pan-y` bug.
- **Each slide shows everything:** compact plate SVG or capture, caption with provenance, kicker, **title (`--t-h2`, larger than any numeral)**, summary, Role/Stack/Status, and "Read the case study". Neighbours are **not dimmed**, avoiding Cinematic's 2.3–3.9:1 peeking text.
- **Above the strip:** `01 — 05` mono with a progress hairline (`scaleX`), the **active project name** in mono caps, and 48×48 Prev/Next.
- The index ruler is hidden on mobile; the active name replaces it.
- **Active index:** an IntersectionObserver with `root = ring` and threshold 0.6 sets `index`. There is no scroll handler. Prev/Next call `ring.scrollTo({left: slide.offsetLeft − paddingLeft, behavior})`, never `scrollIntoView` (which would scroll the page).
- **Tab order:** every slide's CTA is tabbable; focusing one scrolls it into view natively.
- **No horizontal page overflow:** the section has `overflow-x: clip`, and the strip scrolls inside itself.

### 12.8 Plates (v1 set; copy per ledger)

| # | Key | Artwork | Highlighted datum | Provenance |
|---|---|---|---|---|
| 01 | kaaran | Crop of `kaaran-desktop-source-drawer.png` on a paper-2 mat, with Instrumented's **annotation overlay**: the 11.6 in the card circled, a dashed leader to the drawer's 11.6, and the tag `figure → file · filter · 120 rows` | the circled 11.6 | Live demo capture · Synthetic data |
| 02 | tutor | Original SVG: AVL RR case (30-20-10 or 10-20-30) → rotation → validator verdict + LLM explanation box. Compact variant: 3 nodes + 1 arrow + "rotate" | the rotated node | Original drawing |
| 03 | federated | Original SVG: 3 clients (data stays local) → weights up → server FedAvg → global model down. **No images of people.** Compact: 3 boxes → 1 box | the weighted average | Original drawing |
| 04 | certivault | Original SVG: issue (hash + signature) → certificate + QR → verify → one of six verdict words | "Valid" seal | Original drawing |
| 05 | notebook | Original SVG chart: horizontal bars on a log scale (1–10,000), AVL 14 · Red-Black 24 · Splay 10,000 for 10,000 sorted keys; reference line at ⌈log₂ 10,001⌉ = 14 (drawn ceiling, §4.2); direct labels, no legend | Splay's 10,000 | Recorded run · DS_Actual_CP @ b80db89 |

- The SVG art uses **ink on paper-2** with the highlighted datum in cobalt (paper surface rules apply inside plates).
- The plate caption strip is paper-2 with mono `Pl. 0n` and a provenance badge.

---

## 13. Page templates

### 13.1 Home (`index.html`)

| # | Section | Surface | ≥ 1100 composition | < 760 composition |
|---|---|---|---|---|
| 0 | Header | night | §10.1 | Wordmark · Work · Contact · Résumé · Index |
| 1 | **Hero** (`<main id="main">` starts here) | night | **Upper band** (≈ 415 px): cols 1–5 hold the claim (`--t-lead`; "I build AI systems that can *show their work.*" with the italic in serif, `--fg`), 3-line sub-copy (fg-2), CTAs (primary "Explore work" ↓ to `#work`; ghost "View résumé · PDF · 1 p"), and the **facts** `dl`: *Now* B.Tech Computer Engineering, VIT Pune · 2024–2028 (expected) / *Focus* LLM systems, ML, algorithms / *Open to* AI engineering internships. Cols 7–12 hold **Fig. 1** (truss) with caption and readout. **Lower band:** the h1 on two lines, "Durgesh" from the left margin and "*Chaudhari.*" right-aligned (diagonal reading path), with the dimension rule under "Durgesh". The scroll cue sits in the pocket below "Durgesh" | Order: **h1** (2 lines, 76 px) → claim → CTAs (side by side, 48 px) → facts → Fig. 1 (2:1). Name, claim and both CTAs must be above the fold at 390×844. The work strip begins ≤ 1.3 viewport heights down |
| 2 | **I — Selected work** | night | §12 (fits 1440×900) | §12.7 strip |
| 3 | **II — Evidence** (dawn sheet) | paper | Running head · statement h2 "Evidence, *set in type.*" (`--t-display`, cols 4–12; italic in ink) · dek cols 4–8 · marginal note cols 10–12 ("Every plate links to its source. Figures from the Kaaran demo are synthetic and labelled so.") · bento §10.8 | Single column zig-zag |
| 4 | **III — The bench** | paper | Running head · h2 "Operate the systems" · one bench (§10.12) with a 3-way picker (Kaaran evidence / Tree rotation / Federated averaging) as a link-based picker, preserving `#lab/<key>?…` (audit §2.1) · link "Open the engineering notebook" | The bench stacks; the picker is a 3-button row |
| 5 | **IV — Research & about** | paper | cols 1–5: the co-authored paper (title, venue, status word **per ledger**, DOI evidence badge if verified). cols 7–12: education, focus, evidence-backed skills **as text lists grouped by area** (no icon grid), verified achievements only | Stacked |
| 6 | **V — Correspondence** (footer) | night | §10.17. The email shout spans cols 3–12 | Email at `--t-email` (fits 320) |

- **Desktop page height target ≤ 5,200 px. Mobile ≤ 6,200 px.**
- **Landmarks:** `header`, `nav`, `main`, `footer`. Sections are labelled by their h2s. **One h1.**

### 13.2 Case study (`projects/<key>.html`): the 10 sections

Keys and URLs are preserved: `kaaran.html`, `tutor.html`, `federated.html`, `notebook.html` (its own template, §13.3), plus the **new** `certivault.html`. Until a case study is complete, it ships with sections 1, 2, 3 and 10 plus a plain "Full write-up in progress" note in place of 4–9. **No gallery link may 404**, and the existing ones keep their URLs.

The page sits on a `paper` surface. Its header is `night` up to the end of section 1. A 2 px scroll progress bar sits in the sticky header (§10.15).

| # | Section | Content and spec |
|---|---|---|
| 1 | **Plate header** | Night band. Crumb `← Selected work` (to `../index.html#work`; the gallery restores its plate from state) · mono `Pl. 0n · Kicker` · h1 at `--t-title` (`view-transition-name: title-<key>`) · one-line dek · the plate artwork at full content width (`view-transition-name: plate-<key>`) with caption and provenance · 1–2 state chips |
| 2 | **Fact strip** | §10.10: Role · Team (named credits) · Timeline · Context · Stack · Proof |
| 3 | **In 30 seconds** | Three plain-language lines for recruiters: *What it is* · *What I did* · *What came of it*. Sans `--t-lead`, cols 3–9 |
| 4 | **01 Problem** | Who has the problem, in their words. Prose ≤ 180 words, plus at most one pull-quote or key number |
| 5 | **02 Constraints** | A list of 3–6 constraints (data, time, language, privacy, compute) in mono label + sans text pairs |
| 6 | **03 Architecture** | One original SVG diagram (Fig. n.1) at cols 2–11 with a numbered legend. Mobile gets the compact variant or tap-to-expand into a `<dialog>` figure viewer |
| 7 | **04 How it works (lab)** | The operable bench (§10.12), preserving the existing lab contracts, or a step-through. At least one control |
| 8 | **05 Evaluation & evidence** | Metrics (§10.11) with scope lines, captures with provenance, evidence badges. Self-reported numbers are attributed ("the project log reports…") |
| 9 | **06 My contribution & credits** | A contribution boundary table: *I did* / *Team did* / *Not mine*, with named collaborators (e.g. Niraj Chavan on the tutor, **wording per ledger**) |
| 10 | **07 What I'd change · next** | 3–5 honest bullets, then the colophon: proof links, last updated, and **Prev / Next project** (two large serif links with plate numbers, all breakpoints, cross-fade transition) |

Chapter headings use the format `01 — Problem` (mono numeral plus `--t-h2` serif). Prose sits in cols 3–9. Figures zig-zag (cols 1–8, then 5–12) with `--s-block` gaps.

### 13.3 Notebook (`projects/notebook.html`)

- **Header:** night band with a running head `Notebook · Entries 01–03 · p. —`, h1 "Engineering notebook" and a dek.
- **Body:** paper. ≥ 1100: a sticky contents `nav aria-label="Notebook contents"` in cols 1–3 (keep the existing label) with entries in cols 4–12. < 1100: contents become a `<details>` at the top.
- **Entry** = `article` with:
  - mono `Entry 0n · date`, a serif `--t-h2` title, a dek, chips/provenance;
  - **Fig.** plus the bench (trees benchmark, retrieval/RRF, AVL insertion replay);
  - a results table (DM Mono numerals, `<caption>`, `th scope`), the method and source citation, and a scope line.
- **Contracts:** `#trees?order=&size=&metric=`, `#retrieval?scenario=&channel=`, `#insertion?step=` and the plain anchors exactly as in audit §2.1. All IDs and data-attributes are those notebook.js uses (§2.2). The canvas keeps `role="img"` with its regenerated label.
- Prev/Next entry links at each entry's end. There is no scroll progress on the contents column.

### 13.4 404 (`404.html`)

- Night surface. The header is identical.
- h1 at `--t-title`: "No plate at this address." A mono line gives the requested path, escaped through `textContent`.
- A static SVG of the truss with **one edge drawn dashed and one node displaced**, captioned "Fig. 404 — one edge missing". It is the `fig-dc-truss.svg` variant.
- Links: Home; the five case studies as a list; Notebook; and "Search the archive" (opens the palette).
- One h1, landmarks, no scripts beyond core. `<meta name="robots" content="noindex">`.

---

## 14. Quality gates (every PR touching `dist/`)

**Accessibility**
- axe (`@axe-core/playwright`) **0 violations** on home, each case page, the notebook and 404, at 390 and 1440. This includes `label-content-name-mismatch` and `landmark-unique`.
- One h1 per page; landmarks; skip link works.
- Keyboard path verified: the gallery has 4 tab stops; arrows move focus to the deck CTA; the palette and overlay trap focus and close on Esc.
- Focus ring visible on night, paper and plates: screenshot each.
- No visible text < 12 px, measured at rendered size and including SVG text.

**Motion and performance**
- At 300 ms after interactions with reduced motion, `getAnimations()` running count is 0.
- 0 rAF/s at idle, offscreen and in a hidden tab (hero truss, cursor).
- No `animation-iteration-count: infinite` in shipped CSS.
- CLS < 0.01 at 320, 390, 768, 1440.
- No long task > 50 ms on load.
- First screen ≤ 300 KB (HTML + critical CSS + JS + 2 preloaded fonts), with no render-blocking JS (`defer` everywhere; one tiny inline head script sets `.js` and `.intro`).

**Layout**
- `scrollWidth === clientWidth` at 320, 390, 768, 1024, 1440, 1920.
- Gallery heading, plate, counter, controls, title and CTA are fully visible at 1440×900 after `#work` is scrolled to the top.

**Content**
- Every claim maps to `content-ledger.md`. Every capture has a provenance badge. Synthetic data is labelled. No faces.
- No ← → ↗ ✓ ⌈ ⌉ ₂ ⌘ characters in text nodes (§4.2).

**Cross-browser:** Chromium, Firefox (dawn fallback), and Safari 17+ (3D plus clip, view transitions off).

---

## 15. Code provenance: what to start from

| Component | Start from | Keep | Change |
|---|---|---|---|
| `css/tokens.css` | `editorial/css/tokens.css` | Structure, spacing, motion easings | Replace colour, type and motion values with §3–6. Add the surface aliases from §3.3 (the Cinematic `.surface-*` pattern), the fallback faces from §4.1 and the radius set from §5.4 |
| `@font-face` | `editorial/css/tokens.css` (top block) | `unicode-range`s | Paths → `/assets/fonts/`. Drop DM Sans italic. Add fallbacks and `font-synthesis: none` |
| Hero h1 markup + intro | `instrumented/index.html` h1 (sr-only name + `aria-hidden` letters) and `cinematic/css/site.css` L111+ (dim-to-lit) | CSS-only keyframes from the first frame | Start state is opacity .4 (not .16). Remove Editorial's mask hiding and the letter-spacing tween |
| Fig. 1 truss | `editorial/js/monogram.js` | Geometry, PRNG, assembly, pointer spring, probe | Remove the breathing loop. Add the self-sleep (pattern: `cinematic/js/hero.js` `schedule()/stop()`), the readout line and the rect cache. Enlarge per §11.2. Add a palette "Replay" hook |
| Gallery (desktop) | `editorial/js/main.js` → `gallery()` | `layout()`, drag, `swapText` token guard, lean | Clamp (remove `wrap`). Change the key handling and focus target to the deck CTA, the tab stops, the a11y tree (no `aria-hidden` on slides, `.slide__text` mirroring) and persistence. The modifier-click passthrough |
| Index ruler + odometer | `instrumented/css/site.css` L315–354 (`.index*`, `.counter*`) and `select()` in `instrumented/js/main.js` | The marker and roll mechanics | Roving tabindex. DM Mono numerals. Hide below 760 |
| Gallery (mobile) | `cinematic/js/gallery.js` `modeChange()` + `cinematic/css/site.css` strip rules | Native scroll-snap | **Remove `touch-action: pan-y` from plates.** Neighbours undimmed. IO-derived index. `ring.scrollTo` |
| Kaaran annotation | `instrumented/index.html` L111–115 + `instrumented/css/site.css` L262–276 | Overlay geometry and tag | The tag `→` becomes the SVG arrow (§4.2). One draw-in per activation |
| Plate SVGs | `editorial/index.html` (AVL, FedAvg, issue → verify, tree heights) | Drawings | Recolour to ink on paper-2 with one cobalt datum. **Remove the infinite `.flow-up/.flow-down` animations.** Add compact variants |
| Dawn sheet | Concept: `cinematic`. CSS base: Editorial's `view()` timeline rule in `editorial/css/main.css` | — | Re-implement with `clip-path` (§7.2) plus the IO/WAAPI fallback. **Do not reuse Cinematic's JS scroll handler** |
| Bento tiles | `editorial` (tiles, reveal, tilt, Kaaran brief, CertiVault specimen, RRF SVG) | Artwork and tilt maths | Kaaran tile ground cobalt → ink. Add the Index tile. Pixel-dimension label (Instrumented). The reveal observes the unclipped wrapper (`instrumented/js/main.js` `reveals()`, including its eager-load promotion). Scan line via `transform` |
| Footer / copy | `editorial` copy-email (fallback shows the address) | Morph and aria-live | Dark credits per Cinematic. Lettered links per Instrumented. SVG check icon |
| Focus styles | `editorial` 3 px ring + `cinematic` surface switch | — | §3.5, plus `--c-focus-any` |
| Labs, notebook, case-page logic | Existing `dist/experiments.js`, `dist/notebook.js`, `dist/site.js` | **All contracts in audit §2** | Restyle with the bench chrome only. Fix the federated no-JS bars |
| Case pages | New, from the §13.2 template | — | Editorial's `projects/*.html` stubs are not reused beyond their file names |

**Do not reuse:**
- `cinematic/js/hero.js` sampling (font race, `Math.random`, 500 nodes);
- `instrumented/js/main.js` `heroGraph()` (k-NN edges, 156 ms long task);
- the Cinematic dawn scroll handler and the `--mx/--my` spotlight on the hero root;
- Cinematic's `location.href` plate navigation;
- Editorial's breathing loop, letter-spacing intro and stage `tabindex=0`;
- Instrumented's `top` scan animation, Re-run button, multi-line trace, and rulers on every section;
- any `tools/`, `shoot.js`, `patch_it*.py` or iteration screenshots (no build cruft in `dist/`).

---

## 16. Judges' must-fix register (all apply)

| ID | Must-fix (merged across the art, recruiter and engineering lenses) | Resolved by |
|---|---|---|
| MF-01 | Content readable at first paint; no opacity-0 or masked h1/CTA/tagline/facts/nav | §2 principle 2, §6.3, §4.5 (start opacity .4 = 3.36:1) |
| MF-02 | One shout per viewport; truss and name not at equal weight | §2.3, §11.2 |
| MF-03 | Monogram reads as "DC." with no bridges, no stray stop edge, no starfield scatter | §11.1 |
| MF-04 | At 1440×900: heading, arc, counter, controls, title and CTA in one viewport | §12.3 fit check, §14 |
| MF-05 | No visible wrap-around jump | §12.2 (clamped) |
| MF-06 | Strong plate figure/ground on dark; no imperceptible "lamp" | §12.3 (paper plates, no lamp) |
| MF-07 | The cobalt/periwinkle rule decided and enforced | §3.4 |
| MF-08 | Third-party captures on neutral mats, on-palette; curated five; Kaaran chips framed | §8.2, §12.8 |
| MF-09 | Mobile plates: no text < 12 px (compact redraws or tap-to-expand); strips clip inside their scroller | §8.2, §12.7 |
| MF-10 | Deliberate crops; no mid-word cuts | §8.2, §10.8 |
| MF-11 | No layout-property animation (letter-spacing, top, margin, radius); CLS < 0.01 down to 320 | §6.4 rule 1, §14 |
| MF-12 | Every rAF loop self-sleeps; pause offscreen and in hidden tabs; no idle work | §6.4 rules 3–4, §11.6 |
| MF-13 | No infinite animations (scroll cue, flow dashes); reduced motion leaves 0 running animations | §6.4 rule 2, §6.5, §12.4 |
| MF-14 | Glyphs outside the subsets drawn as SVG | §4.2 |
| MF-15 | Focus ≥ 3:1 on night, paper and plates; 3 px; tile focus actually renders | §3.5 |
| MF-16 | Static fallback for the view()-timeline sheet that looks intentional; Safari preserve-3d plus clip checked | §7.2, §12.3 |
| MF-17 | Case-study links resolve to real pages with back and prev/next | §13.2 |
| MF-18 | Plain-language who/what/looking-for in the hero; "student" present; no "The author"/"No. 00"/"Fig. 00" as identifiers | §13.1, §10.6 |
| MF-19 | Mobile swipe works from the image (no `pan-y` on strip plates); tested on real iOS/Android | §12.7, §14 |
| MF-20 | Mobile: title outranks the numeral; active project name shown | §12.7 |
| MF-21 | Arrow keys move focus to the active project link, scrolled into view with its title; no giant stage focus ring | §12.5 |
| MF-22 | Gallery tab stops cut to Prev, index (one stop), Next, active link; decorative controls out of the path | §12.1, §11.4 |
| MF-23 | Instrumentation never competes with the name (readout on one line, dimension label on hover only) | §5.5, §11.4 |
| MF-24 | Work / Contact / Résumé visible in the mobile header | §10.1 |
| MF-25 | No dead UI (empty audio players, empty "Index start" rails); chart labels independent of scroll timing | §10.8, §12.2, §12.8 |
| MF-26 | Shorter page; no dead gaps | §5.1 rule, §13.1 height targets |
| MF-27 | Keys from any gallery control, with `preventDefault`, never hijacked outside the gallery | §12.5 |
| MF-28 | Plate artwork is a real `<a>`; modifier-clicks work | §12.1, §12.5 |
| MF-29 | No overflow at 320; full nav reachable at 390 | §4.4 `min()` tokens, §10.1, §14 |
| MF-30 | axe: names contain visible labels; carousel region labelled distinctly | §10.3, §12.1 |
| MF-31 | No duplicated active heading; all five projects in the a11y tree | §12.1 |
| MF-32 | Startup: no long task > 50 ms; precomputed monogram | §11.1, §11.6 |
| MF-33 | Per-frame custom properties only on the consuming element | §6.4 rule 6 |
| MF-34 | No smooth-scroll lag on focus | §6.4 rule 8 |
| MF-35 | No build cruft shipped | §15 |

---

## 17. Do-not list

- No neon, no gradients as decoration, no glowing borders, no `backdrop-filter`/glass, no coloured or glow shadows.
- No particle fields, starfields, mesh textures or "neural network" backgrounds. The truss has 51 nodes, period.
- No tech-logo or icon grids. No skill bars, percentages or radar charts.
- No identical rectangular card rows. Every tile variant differs in shape, mount and caption placement.
- No accent on decoration, headlines, grounds or rules (§3.4). No periwinkle on paper and no cobalt on night.
- No loader, splash, typewriter, curtain or "enter site" gate. No scroll hijacking, pinning or scroll-scrubbed galleries.
- No `opacity: 0` start states on readable text. No letter-spacing, `top`, margin or radius animation. No infinite animation.
- No custom cursor that hides the native one. No pointer effects on coarse pointers.
- No `<div>` buttons or `href="#"` actions. No `location.href` navigation from pointer handlers. No `outline: none` without a 3 px replacement.
- No text below 12 px, including inside SVGs at rendered size. No uppercase except mono labels. No faux bold or italic.
- No ← → ↗ ✓ ⌘ characters in text (SVG icons only). No `tabular-nums` reliance (use DM Mono).
- No unverified, CONFLICT or UNKNOWN claims. No "TBD" placeholders. No metric without scope. No facial imagery. No do-not-publish assets. No `_research/refs/` imagery. No Review Summarizer purple capture on home.
- Nothing copied from dousanmiao.com or valentin-chevalier.com: marks, layouts as composed, microcopy, the theme toy, the half-screen menu, index letters, "/'24" numerals, coordinates beside the name, glass lens cursor, status pulse dots.
- No runtime libraries or frameworks (no GSAP, Three, Lenis, Swiper). No third-party scripts or analytics without a separate decision.

---

## 18. Content holds (must be resolved with Durgesh before launch; design is unaffected)

1. All prototype copy is provisional. `content-ledger.md` wording wins. For example, Kaaran's stack per the ledger is "Claude, Python, pandas, FastAPI (DuckDB only with the v1 note)", and Federated's "Flower" only as "described".
2. The tree-tutor role: the brief says "co-built with Niraj Chavan", but research found no Durgesh commits in that repo. Use the ledger's approved contribution wording.
3. The paper's status word (published / presented / accepted) and DOI badge follow ledger §4. "Granted patent" is CONFLICT and is not published.
4. CertiVault: "No live demo yet" chip until a demo exists. Its case page ships the minimal §13.2 form first.
5. The rank-fusion tile uses illustrative ranks, labelled `Illustrative`. The scores are computed (k = 60).
